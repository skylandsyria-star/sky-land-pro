import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export const Route = createFileRoute("/_authenticated/owners/new")({
  head: () => ({
    meta: [
      { title: "إضافة مالك — سكاي لاند" },
      { name: "description", content: "إضافة صاحب عقار جديد." },
      { property: "og:title", content: "إضافة مالك" },
      { property: "og:description", content: "إضافة صاحب عقار جديد." },
    ],
  }),
  component: NewOwner,
});

function NewOwner() {
  const router = useRouter();
  const qc = useQueryClient();
  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    whatsapp: "",
    secondary_phone: "",
    city: "",
    area: "",
    address: "",
    source: "",
    status: "new",
    notes: "",
  });
  const [loading, setLoading] = useState(false);

  function upd<K extends keyof typeof form>(k: K, v: string) {
    setForm({ ...form, [k]: v });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const { data: user } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from("owners")
        .insert({ ...form, created_by: user.user?.id })
        .select("id")
        .single();
      if (error) throw error;
      toast.success("تمت إضافة المالك");
      qc.invalidateQueries({ queryKey: ["owners"] });
      qc.invalidateQueries({ queryKey: ["count", "owners"] });
      router.navigate({ to: "/owners/$id", params: { id: data.id } });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "فشل الحفظ");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-black">إضافة مالك جديد</h1>
      <form onSubmit={submit} className="card-elevated space-y-3 p-4">
        <F label="الاسم الكامل *">
          <input required className="inp" value={form.full_name} onChange={(e) => upd("full_name", e.target.value)} />
        </F>
        <div className="grid grid-cols-2 gap-3">
          <F label="رقم الهاتف *">
            <input required dir="ltr" className="inp" value={form.phone} onChange={(e) => upd("phone", e.target.value)} placeholder="+963..." />
          </F>
          <F label="واتساب">
            <input dir="ltr" className="inp" value={form.whatsapp} onChange={(e) => upd("whatsapp", e.target.value)} />
          </F>
        </div>
        <F label="هاتف احتياطي">
          <input dir="ltr" className="inp" value={form.secondary_phone} onChange={(e) => upd("secondary_phone", e.target.value)} />
        </F>
        <div className="grid grid-cols-2 gap-3">
          <F label="المحافظة/المدينة">
            <input className="inp" value={form.city} onChange={(e) => upd("city", e.target.value)} />
          </F>
          <F label="المنطقة">
            <input className="inp" value={form.area} onChange={(e) => upd("area", e.target.value)} />
          </F>
        </div>
        <F label="العنوان التفصيلي">
          <input className="inp" value={form.address} onChange={(e) => upd("address", e.target.value)} />
        </F>
        <div className="grid grid-cols-2 gap-3">
          <F label="مصدر العميل">
            <input className="inp" value={form.source} onChange={(e) => upd("source", e.target.value)} placeholder="إعلان، توصية..." />
          </F>
          <F label="الحالة">
            <select className="inp" value={form.status} onChange={(e) => upd("status", e.target.value)}>
              <option value="new">جديد</option>
              <option value="contacted">تم التواصل</option>
              <option value="active">نشط</option>
              <option value="waiting">في الانتظار</option>
              <option value="not_responding">لا يرد</option>
              <option value="archived">مؤرشف</option>
            </select>
          </F>
        </div>
        <F label="ملاحظات">
          <textarea rows={3} className="inp" value={form.notes} onChange={(e) => upd("notes", e.target.value)} />
        </F>

        <div className="flex gap-2 pt-2">
          <button type="button" onClick={() => router.history.back()} className="flex-1 rounded-xl border border-border py-3 text-sm font-semibold">
            إلغاء
          </button>
          <button type="submit" disabled={loading} className="flex-1 rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground disabled:opacity-60">
            {loading ? "جاري..." : "حفظ المالك"}
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
