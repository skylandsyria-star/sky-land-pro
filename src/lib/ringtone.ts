// Loud looping ringtone via Web Audio API — no external asset needed.
// Emits a classic two-tone phone ring pattern and repeats until stop() is called.

let ctx: AudioContext | null = null;
let stopFn: (() => void) | null = null;

function getCtx(): AudioContext | null {
  try {
    if (!ctx) {
      const AC: typeof AudioContext =
        (window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext);
      ctx = new AC();
    }
    if (ctx.state === "suspended") ctx.resume().catch(() => {});
    return ctx;
  } catch {
    return null;
  }
}

function playRingBurst(ac: AudioContext, startAt: number, durationSec = 1.4): void {
  // Two sine oscillators mixed (440 + 480 Hz) — telephone-like ring
  const master = ac.createGain();
  master.gain.setValueAtTime(0, startAt);
  master.gain.linearRampToValueAtTime(1.0, startAt + 0.05);
  master.gain.setValueAtTime(1.0, startAt + durationSec - 0.1);
  master.gain.linearRampToValueAtTime(0, startAt + durationSec);
  master.connect(ac.destination);

  for (const freq of [440, 480, 620]) {
    const o = ac.createOscillator();
    o.type = "sine";
    o.frequency.value = freq;
    const g = ac.createGain();
    g.gain.value = 0.35;
    o.connect(g).connect(master);
    o.start(startAt);
    o.stop(startAt + durationSec);
  }
}

export function startRingtone(maxSeconds = 30): void {
  stopRingtone();
  const ac = getCtx();
  if (!ac) return;

  let cancelled = false;
  const startedAt = ac.currentTime;
  const endAt = startedAt + maxSeconds;

  function scheduleLoop() {
    if (cancelled) return;
    const now = ac!.currentTime;
    // Pattern: ring 1.4s, pause 0.4s, ring 1.4s, pause 2.8s = ~6s cycle
    let t = now;
    while (t < now + 4 && t < endAt) {
      playRingBurst(ac!, t, 1.4);
      t += 1.4 + 0.4;
      if (t >= endAt) break;
      playRingBurst(ac!, t, 1.4);
      t += 1.4 + 2.8;
    }
  }

  scheduleLoop();
  const interval = window.setInterval(() => {
    if (cancelled || ac.currentTime >= endAt) {
      window.clearInterval(interval);
      return;
    }
    scheduleLoop();
  }, 3500);

  stopFn = () => {
    cancelled = true;
    window.clearInterval(interval);
    try {
      // Fade out master by muting destination via short gain node isn't trivial here;
      // easiest: close and recreate on next start
      ac.close().catch(() => {});
    } catch {
      // ignore
    }
    ctx = null;
    stopFn = null;
  };
}

export function stopRingtone(): void {
  if (stopFn) stopFn();
}
