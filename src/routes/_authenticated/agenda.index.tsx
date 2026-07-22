import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { CheckCircle2, Clock, Plus, Bell, Phone, MapPin, ListTodo, CalendarClock } from "lucide-react";
import { toast } from "sonner";
import { kindLabel } from "@/hooks/useReminders";

export const Route = createFileRoute("/_authenticated/agenda/")({
  head: () => ({
    meta: [
      { title: "الأجندة والتذكيرات — سكاي لاند" },
      { name: "description", content: "المواعيد والمهام والمتابعات." },
      { property: "og:title", content: "الأجندة — سكاي لاند" },
      { property: "og:description", content: "إدارة المواعيد والمهام والتذكيرات." },
    ],
  }),
  component: AgendaPage,
});

type Tab = "today" | "upcoming" | "overdue" | "done";

function AgendaPage() {
  const [tab, setTab] = useState<Tab>("today");
  const qc = useQueryClient();

  const q = useQuery({
    queryKey: ["agenda", tab],
    queryFn: async () => {
      const now = new Date();
      const startToday = new Date(now); startToday.setHours(0, 0, 0, 0);
      const endToday = new Date(now); endToday.setHours(23, 59, 59, 999);

      let query = supabase.from("agenda_items")
        .select("id,title,description,kind,status,due_at,remind_at,owner_id,property_id,customer_id")
        .order("due_at", { ascending: true })
        .limit(100);

      if (tab === "today") {
        query = query.eq("status", "pending")
          .gte("due_at", startToday.toISOString())
          .lte("due_at", endToday.toISOString());
      } else if (tab === "upcoming") {
        query = query.eq("status", "pending").gt("due_at", endToday.toISOString());
      } else if (tab === "overdue") {
        query = query.eq("status", "pending").lt("due_at", startToday.toISOString());
      } else {
        query = query.eq("status", "done").order("completed_at", { ascending: false });
      }
      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
  });

  async function complete(id: string) {
    const { error } = await supabase.from("agenda_items")
      .update({ status: "done", completed_at: new Date().toISOString() })
      .eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("تم الإنجاز");
    qc.invalidateQueries({ queryKey: ["agenda"] });
  }

  async function snooze(id: string, minutes: number) {
    const next = new Date(Date.now() + minutes * 60_000).toISOString();
    const { error } = await supabase.from("agenda_items")
      .update({ status: "pending", remind_at: next, due_at: next, notified_at: null })
      .eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(`تم التأجيل ${minutes} د`);
    qc.invalidateQueries({ queryKey: ["agenda"] });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black">الأجندة والتذكيرات</h1>
          <p className="text-xs text-muted-foreground">المواعيد، المهام، المكالمات والمتابعات</p>
        </div>
        <Link to="/agenda/new" className="inline-flex items-center gap-1 rounded-xl bg-primary px-3 py-2 text-xs font-bold text-primary-foreground">
          <Plus className="h-4 w-4" /> جديد
        </Link>
      </div>

      <div className="flex gap-1 overflow-x-auto rounded-xl bg-muted p-1">
        {(["today","upcoming","overdue","done"] as Tab[]).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 whitespace-nowrap rounded-lg px-3 py-2 text-xs font-bold transition ${tab===t ? "bg-background text-foreground shadow" : "text-muted-foreground"}`}>
            {t==="today"?"اليوم":t==="upcoming"?"القادمة":t==="overdue"?"متأخرة":"منجزة"}
          </button>
        ))}
      </div>

      <NotifBanner />

      <div className="space-y-2">
        {q.isLoading && <div className="text-sm text-muted-foreground">جاري التحميل...</div>}
        {q.data?.length === 0 && (
          <div className="card-elevated p-6 text-center text-sm text-muted-foreground">
            لا يوجد عناصر في هذه القائمة.
          </div>
        )}
        {q.data?.map((it) => {
          const due = new Date(it.due_at);
          const overdue = it.status === "pending" && due.getTime() < Date.now();
          return (
            <div key={it.id} className="card-elevated p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <KindIcon kind={it.kind} />
                    <span className="text-[11px] font-semibold text-muted-foreground">{kindLabel(it.kind)}</span>
                    {overdue && <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-bold text-destructive">متأخر</span>}
                  </div>
                  <div className="mt-1 font-bold">{it.title}</div>
                  {it.description && <div className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{it.description}</div>}
                  <div className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span dir="ltr">{due.toLocaleDateString("ar-EG", { dateStyle: "medium" })} {due.toLocaleTimeString("ar-EG", { hour: "numeric", minute: "2-digit", hour12: true })}</span>
                  </div>
                </div>
              </div>
              {it.status === "pending" && (
                <div className="mt-3 flex flex-wrap gap-2">
                  <button onClick={() => complete(it.id)} className="inline-flex items-center gap-1 rounded-lg bg-success/10 px-3 py-1.5 text-xs font-bold text-success">
                    <CheckCircle2 className="h-3.5 w-3.5" /> إنجاز
                  </button>
                  <button onClick={() => snooze(it.id, 15)} className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold">+15د</button>
                  <button onClick={() => snooze(it.id, 60)} className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold">+1س</button>
                  <button onClick={() => snooze(it.id, 60 * 24)} className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold">+يوم</button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function KindIcon({ kind }: { kind: string }) {
  const cls = "h-4 w-4 text-primary";
  switch (kind) {
    case "appointment": return <CalendarClock className={cls} />;
    case "call": return <Phone className={cls} />;
    case "visit": return <MapPin className={cls} />;
    case "follow_up": return <Bell className={cls} />;
    default: return <ListTodo className={cls} />;
  }
}

function NotifBanner() {
  const [perm, setPerm] = useState(() =>
    typeof window !== "undefined" && "Notification" in window ? Notification.permission : "default",
  );
  if (perm === "granted") return null;
  return (
    <button
      onClick={async () => {
        if (!("Notification" in window)) return toast.error("متصفحك لا يدعم الإشعارات");
        const p = await Notification.requestPermission();
        setPerm(p);
        if (p === "granted") toast.success("تم تفعيل الإشعارات");
      }}
      className="w-full rounded-xl border border-primary/40 bg-primary/5 p-3 text-right text-xs font-semibold text-primary"
    >
      🔔 فعّل إشعارات المتصفح لتصلك التذكيرات حتى لو أغلقت التبويب
    </button>
  );
}
