import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { startRingtone, stopRingtone } from "@/lib/ringtone";

const POLL_MS = 30_000;

export function useReminders(enabled = true) {
  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().catch(() => {});
    }

    let cancelled = false;

    async function tick() {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from("agenda_items")
        .select("id,title,kind,due_at,remind_at,notified_at,status")
        .eq("status", "pending")
        .is("notified_at", null)
        .or(`remind_at.lte.${now},and(remind_at.is.null,due_at.lte.${now})`)
        .limit(20);
      if (cancelled || error || !data) return;
      for (const item of data) {
        fireNotification(item.title, kindLabel(item.kind));
        await supabase
          .from("agenda_items")
          .update({ notified_at: new Date().toISOString() })
          .eq("id", item.id);
      }
    }

    tick();
    const id = window.setInterval(tick, POLL_MS);
    const onVis = () => { if (document.visibilityState === "visible") tick(); };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      cancelled = true;
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [enabled]);
}

function fireNotification(title: string, body: string) {
  try {
    if ("Notification" in window && Notification.permission === "granted") {
      const n = new Notification(`🔔 ${title}`, {
        body,
        icon: "/favicon.ico",
        badge: "/favicon.ico",
        tag: title,
        requireInteraction: true,
      });
      n.onclick = () => { window.focus(); n.close(); };
    }
  } catch {
    // ignore
  }
  try {
    if ("vibrate" in navigator) navigator.vibrate([300, 150, 300]);
  } catch {
    // ignore
  }
  toast.warning(`🔔 ${title}`, { description: body, duration: 15_000 });
}

export function kindLabel(kind: string) {
  switch (kind) {
    case "appointment": return "موعد";
    case "task": return "مهمة";
    case "follow_up": return "متابعة";
    case "call": return "مكالمة";
    case "visit": return "زيارة";
    default: return kind;
  }
}
