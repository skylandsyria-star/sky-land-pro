// Loud looping ringtone via Web Audio API — no external asset needed.
// Emits a harsh multi-tone alarm ring and repeats until stop() is called.

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
  // Master gain — loud but avoid clipping
  const master = ac.createGain();
  master.gain.setValueAtTime(0, startAt);
  master.gain.linearRampToValueAtTime(1.0, startAt + 0.03);
  master.gain.setValueAtTime(1.0, startAt + durationSec - 0.08);
  master.gain.linearRampToValueAtTime(0, startAt + durationSec);

  // Soft-clip compressor for perceived loudness
  const comp = ac.createDynamicsCompressor();
  comp.threshold.value = -12;
  comp.knee.value = 6;
  comp.ratio.value = 12;
  comp.attack.value = 0.003;
  comp.release.value = 0.2;

  master.connect(comp).connect(ac.destination);

  // Rich alarm-like stack: telephone tones + higher square wave for harshness
  const voices: Array<{ freq: number; type: OscillatorType; gain: number }> = [
    { freq: 440, type: "sine", gain: 0.6 },
    { freq: 480, type: "sine", gain: 0.6 },
    { freq: 620, type: "sine", gain: 0.5 },
    { freq: 880, type: "square", gain: 0.35 },
    { freq: 1320, type: "square", gain: 0.25 },
    { freq: 220, type: "triangle", gain: 0.5 },
  ];

  for (const v of voices) {
    const o = ac.createOscillator();
    o.type = v.type;
    o.frequency.value = v.freq;
    // Subtle vibrato for attention
    const lfo = ac.createOscillator();
    lfo.frequency.value = 7;
    const lfoGain = ac.createGain();
    lfoGain.gain.value = v.freq * 0.01;
    lfo.connect(lfoGain).connect(o.frequency);

    const g = ac.createGain();
    g.gain.value = v.gain;
    o.connect(g).connect(master);
    o.start(startAt);
    lfo.start(startAt);
    o.stop(startAt + durationSec);
    lfo.stop(startAt + durationSec);
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
    let t = now;
    // Alarm pattern: 3 quick rings then short pause, repeat
    while (t < now + 5 && t < endAt) {
      playRingBurst(ac!, t, 1.2);
      t += 1.2 + 0.25;
      if (t >= endAt) break;
      playRingBurst(ac!, t, 1.2);
      t += 1.2 + 0.25;
      if (t >= endAt) break;
      playRingBurst(ac!, t, 1.2);
      t += 1.2 + 1.5;
    }
  }

  scheduleLoop();
  const interval = window.setInterval(() => {
    if (cancelled || ac.currentTime >= endAt) {
      window.clearInterval(interval);
      return;
    }
    scheduleLoop();
  }, 4000);

  stopFn = () => {
    cancelled = true;
    window.clearInterval(interval);
    try {
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
