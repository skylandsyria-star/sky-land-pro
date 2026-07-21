import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export const Route = createFileRoute("/_authenticated/customers/new")({
  head: () => ({
    meta: [
      { title: "إضافة عميل — سكاي لاند" },
      { name: "description", content: "إضافة عميل/طلب جديد." },
      { property: "og:title", content: "إضافة عميل" },
      { property: "og:description", content: "إضافة عميل/طلب جديد." },
    ],
  }),
  component: NewCust,
});

function NewCust() {
  const router = useRouter();
  const qc = useQueryClient();
  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    whatsapp: "",
    request_type: "buy",
    desired_property_type: "apartment",
    city: "",
    area: "",
    min_budget: "",
    max_budget: "",
    currency: "SYP",
    min_bedrooms: "",
    urgency: "normal",
    status: "new",
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  function upd(k: string, v: any) { setForm({ ...form, [k]: v }); }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const { data: user } = await supabase.auth.getUser();
      const payload: any = {
        ...form,
        created_by: user.user?.id,
        min_budget: form.min_budget ? Number(form.min_budget) : null,
        max_budget: form.max_budget ? Number(form.max_budget) : null,
        min_bedrooms: form.min_bedrooms ? Number(form.min_bedrooms) : null,
      };
      const { data, error } = await supabase.from("customers").insert(payload).select("id").single();
      if (error) throw error;
      toast.success("تمت إضافة العميل");
      qc.invalidateQueries({ queryKey: ["customers"] });
      qc.invalidateQueries({ queryKey: ["count", "customers"] });
      router.navigate({ to: "/customers/$id", params: { id: data.id } });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "فشل الحفظ");
    } finally { setLoading(false); }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-black">إضافة عميل جديد</h1>
      <form onSubmit={submit} className="card-elevated space-y-3 p-4">
        <F label="الاسم الكامل *">
          <input required className="inp" value={form.full_name} onChange={(e) => upd("full_name", e.target.value)} />
        </F>
        <div className="grid grid-cols-2 gap-3">
          <F label="رقم الهاتف *"><input required dir="ltr" className="inp" value={form.phone} onChange={(e) => upd("phone", e.target.value)} placeholder="+963..." /></F>
          <F label="واتساب"><input dir="ltr" className="inp" value={form.whatsapp} onChange={(e) => upd("whatsapp", e.target.value)} /></F>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <F label="نوع الطلب">
            <select className="inp" value={form.request_type} onChange={(e) => upd("request_type", e.target.value)}>
              <option value="buy">شراء</option>
              <option value="rent">إيجار</option>
            </select>
          </F>
          <F label="نوع العقار">
            <select className="inp" value={form.desired_property_type} onChange={(e) => upd("desired_property_type", e.target.value)}>
              <option value="apartment">شقة</option>
              <option value="villa">فيلا</option>
              <option value="house">منزل</option>
              <option value="land">أرض</option>
              <option value="shop">محل</option>
              <option value="office">مكتب</option>
              <option value="other">أخرى</option>
            </select>
          </F>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <F label="المدينة"><input className="inp" value={form.city} onChange={(e) => upd("city", e.target.value)} /></F>
          <F label="المنطقة المفضلة"><input className="inp" value={form.area} onChange={(e) => upd("area", e.target.value)} /></F>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <F label="من (ميزانية)"><input type="number" className="inp" value={form.min_budget} onChange={(e) => upd("min_budget", e.target.value)} /></F>
          <F label="إلى (ميزانية)"><input type="number" className="inp" value={form.max_budget} onChange={(e) => upd("max_budget", e.target.value)} /></F>
          <F label="العملة">
            <select className="inp" value={form.currency} onChange={(e) => upd("currency", e.target.value)}>
              <option value="SYP">ل.س</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="TRY">TRY</option>
            </select>
          </F>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <F label="الحد الأدنى للغرف"><input type="number" className="inp" value={form.min_bedrooms} onChange={(e) => upd("min_bedrooms", e.target.value)} /></F>
          <F label="الأولوية">
            <select className="inp" value={form.urgency} onChange={(e) => upd("urgency", e.target.value)}>
              <option value="low">منخفضة</option>
              <option value="normal">عادية</option>
              <option value="high">عالية</option>
              <option value="urgent">عاجلة</option>
            </select>
          </F>
          <F label="الحالة">
            <select className="inp" value={form.status} onChange={(e) => upd("status", e.target.value)}>
              <option value="new">جديد</option>
              <option value="contacted">تم التواصل</option>
              <option value="searching">قيد البحث</option>
              <option value="negotiating">تفاوض</option>
              <option value="closed">مغلق</option>
            </select>
          </F>
        </div>
        <F label="ملاحظات"><textarea rows={3} className="inp" value={form.notes} onChange={(e) => upd("notes", e.target.value)} /></F>

        <div className="flex gap-2 pt-2">
          <button type="button" onClick={() => router.history.back()} className="flex-1 rounded-xl border border-border py-3 text-sm font-semibold">إلغاء</button>
          <button type="submit" disabled={loading} className="flex-1 rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground disabled:opacity-60">
            {loading ? "جاري..." : "حفظ العميل"}
          </button>
        </div>
      </form>
      <style>{`.inp{width:100%;padding:.6rem .75rem;border:1px solid var(--color-input);border-radius:.6rem;background:var(--color-background);font-size:.9rem}.inp:focus{outline:2px solid var(--color-ring);outline-offset:1px}`}</style>
    </div>
  );
}
function F({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-1 block text-xs font-semibold">{label}</span>{children}</label>;
}
