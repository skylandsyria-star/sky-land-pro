import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/agenda/new")({
  head: () => ({
    meta: [
      { title: "إضافة تذكير — سكاي لاند" },
      { name: "description", content: "إضافة موعد أو مهمة أو متابعة." },
      { property: "og:title", content: "إضافة تذكير" },
      { property: "og:description", content: "إضافة موعد أو مهمة أو متابعة." },
    ],
  }),
  component: NewAgenda,
});

function defaultDue() {
  const d = new Date(Date.now() + 60 * 60_000);
  d.setMinutes(0, 0, 0);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function NewAgenda() {
  const router = useRouter();
  const qc = useQueryClient();
  const [form, setForm] = useState({
    title: "",
    description: "",
    kind: "task",
    due_at: defaultDue(),
    remind_before: "0",
    customer_id: "",
    owner_id: "",
    property_id: "",
  });
  const [loading, setLoading] = useState(false);

  const customers = useQuery({
    queryKey: ["opts","customers"],
    queryFn: async () => (await supabase.from("customers").select("id,full_name").order("created_at",{ascending:false}).limit(200)).data ?? [],
  });
  const owners = useQuery({
    queryKey: ["opts","owners"],
    queryFn: async () => (await supabase.from("owners").select("id,full_name").order("created_at",{ascending:false}).limit(200)).data ?? [],
  });
  const properties = useQuery({
    queryKey: ["opts","properties"],
    queryFn: async () => (await supabase.from("properties").select("id,title").order("created_at",{ascending:false}).limit(200)).data ?? [],
  });

  function upd<K extends keyof typeof form>(k: K, v: string) { setForm({ ...form, [k]: v }); }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const dueDate = new Date(form.due_at);
      if (isNaN(dueDate.getTime())) throw new Error("تاريخ غير صحيح");
      const remindMin = parseInt(form.remind_before, 10) || 0;
      const remindAt = remindMin > 0 ? new Date(dueDate.getTime() - remindMin * 60_000) : dueDate;
      const { data: u } = await supabase.auth.getUser();
      const { error } = await supabase.from("agenda_items").insert({
        title: form.title,
        description: form.description || null,
        kind: form.kind as never,
        due_at: dueDate.toISOString(),
        remind_at: remindAt.toISOString(),
        customer_id: form.customer_id || null,
        owner_id: form.owner_id || null,
        property_id: form.property_id || null,
        created_by: u.user?.id,
        assigned_to: u.user?.id,
      });
      if (error) throw error;
      toast.success("تم الحفظ");
      qc.invalidateQueries({ queryKey: ["agenda"] });
      router.navigate({ to: "/agenda" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "فشل الحفظ");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-black">تذكير جديد</h1>
      <form onSubmit={submit} className="card-elevated space-y-3 p-4">
        <F label="النوع">
          <select className="inp" value={form.kind} onChange={(e)=>upd("kind",e.target.value)}>
            <option value="task">مهمة</option>
            <option value="appointment">موعد</option>
            <option value="call">مكالمة</option>
            <option value="visit">زيارة</option>
            <option value="follow_up">متابعة</option>
          </select>
        </F>
        <F label="العنوان *">
          <input required className="inp" value={form.title} onChange={(e)=>upd("title",e.target.value)} placeholder="مثال: اتصال بالعميل" />
        </F>
        <F label="الوصف">
          <textarea rows={2} className="inp" value={form.description} onChange={(e)=>upd("description",e.target.value)} />
        </F>
        <div className="grid grid-cols-2 gap-3">
          <F label="التاريخ والوقت *">
            <input required type="datetime-local" className="inp" value={form.due_at} onChange={(e)=>upd("due_at",e.target.value)} />
          </F>
          <F label="نبّهني قبل">
            <select className="inp" value={form.remind_before} onChange={(e)=>upd("remind_before",e.target.value)}>
              <option value="0">في الموعد</option>
              <option value="10">10 دقائق</option>
              <option value="30">30 دقيقة</option>
              <option value="60">ساعة</option>
              <option value="180">3 ساعات</option>
              <option value="1440">يوم</option>
            </select>
          </F>
        </div>
        <F label="عميل مرتبط">
          <select className="inp" value={form.customer_id} onChange={(e)=>upd("customer_id",e.target.value)}>
            <option value="">— لا شيء —</option>
            {customers.data?.map((c) => <option key={c.id} value={c.id}>{c.full_name}</option>)}
          </select>
        </F>
        <F label="مالك مرتبط">
          <select className="inp" value={form.owner_id} onChange={(e)=>upd("owner_id",e.target.value)}>
            <option value="">— لا شيء —</option>
            {owners.data?.map((o) => <option key={o.id} value={o.id}>{o.full_name}</option>)}
          </select>
        </F>
        <F label="عقار مرتبط">
          <select className="inp" value={form.property_id} onChange={(e)=>upd("property_id",e.target.value)}>
            <option value="">— لا شيء —</option>
            {properties.data?.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
          </select>
        </F>

        <div className="flex gap-2 pt-2">
          <button type="button" onClick={()=>router.history.back()} className="flex-1 rounded-xl border border-border py-3 text-sm font-semibold">إلغاء</button>
          <button type="submit" disabled={loading} className="flex-1 rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground disabled:opacity-60">
            {loading ? "جاري..." : "حفظ"}
          </button>
        </div>
      </form>
      <style>{`.inp{width:100%;padding:.6rem .75rem;border:1px solid var(--color-input);border-radius:.6rem;background:var(--color-background);font-size:.9rem}.inp:focus{outline:2px solid var(--color-ring);outline-offset:1px}`}</style>
    </div>
  );
}

function F({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold">{label}</span>
      {children}
    </label>
  );
}
