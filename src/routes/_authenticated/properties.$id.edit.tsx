import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { MediaUploader, type MediaItem } from "@/components/MediaUploader";

export const Route = createFileRoute("/_authenticated/properties/$id/edit")({
  head: () => ({
    meta: [
      { title: "تعديل العقار — سكاي لاند" },
      { name: "description", content: "تعديل بيانات العقار." },
      { property: "og:title", content: "تعديل العقار" },
      { property: "og:description", content: "تعديل بيانات العقار." },
    ],
  }),
  component: EditProp,
});

function EditProp() {
  const { id } = Route.useParams();
  const router = useRouter();
  const qc = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<any>(null);
  const [media, setMedia] = useState<MediaItem[]>([]);

  const owners = useQuery({
    queryKey: ["owners-select"],
    queryFn: async () => {
      const { data, error } = await supabase.from("owners").select("id, full_name").order("full_name");
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.from("properties").select("*").eq("id", id).maybeSingle();
      if (error) return toast.error(error.message);
      if (!data) return;
      setForm({
        title: data.title ?? "",
        owner_id: data.owner_id ?? "",
        purpose: data.purpose ?? "sale",
        property_type: data.property_type ?? "apartment",
        status: data.status ?? "available",
        price: data.price ?? "",
        currency: data.currency ?? "SYP",
        city: data.city ?? "",
        area: data.area ?? "",
        address: data.address ?? "",
        total_area: data.total_area ?? "",
        bedrooms: data.bedrooms ?? "",
        bathrooms: data.bathrooms ?? "",
        floor: data.floor ?? "",
        elevator: !!data.elevator,
        parking: !!data.parking,
        furnished: !!data.furnished,
        description: data.description ?? "",
        notes: data.notes ?? "",
      });
      setMedia(Array.isArray((data as any).media) ? (data as any).media : []);
    })();
  }, [id]);

  function upd(k: string, v: any) {
    setForm({ ...form, [k]: v });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const payload: any = {
        ...form,
        owner_id: form.owner_id || null,
        price: form.price ? Number(form.price) : null,
        total_area: form.total_area ? Number(form.total_area) : null,
        bedrooms: form.bedrooms ? Number(form.bedrooms) : null,
        bathrooms: form.bathrooms ? Number(form.bathrooms) : null,
        floor: form.floor ? Number(form.floor) : null,
        media,
      };
      const { error } = await supabase.from("properties").update(payload).eq("id", id);
      if (error) throw error;
      toast.success("تم تحديث العقار");
      qc.invalidateQueries({ queryKey: ["properties"] });
      qc.invalidateQueries({ queryKey: ["property", id] });
      router.navigate({ to: "/properties/$id", params: { id } });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "فشل الحفظ");
    } finally {
      setLoading(false);
    }
  }

  if (!form) return <div className="text-sm text-muted-foreground">جاري التحميل...</div>;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-black">تعديل العقار</h1>
      <form onSubmit={submit} className="card-elevated space-y-3 p-4">
        <F label="عنوان العقار *">
          <input required className="inp" value={form.title} onChange={(e) => upd("title", e.target.value)} />
        </F>

        <div className="grid grid-cols-2 gap-3">
          <F label="الغرض">
            <select className="inp" value={form.purpose} onChange={(e) => upd("purpose", e.target.value)}>
              <option value="sale">بيع</option>
              <option value="rent">إيجار</option>
            </select>
          </F>
          <F label="نوع العقار">
            <select className="inp" value={form.property_type} onChange={(e) => upd("property_type", e.target.value)}>
              <option value="apartment">شقة</option><option value="villa">فيلا</option><option value="house">منزل</option>
              <option value="land">أرض</option><option value="shop">محل</option><option value="office">مكتب</option>
              <option value="warehouse">مستودع</option><option value="farm">مزرعة</option><option value="building">بناء</option>
              <option value="chalet">شاليه</option><option value="other">أخرى</option>
            </select>
          </F>
        </div>

        <F label="المالك">
          <select className="inp" value={form.owner_id} onChange={(e) => upd("owner_id", e.target.value)}>
            <option value="">— بدون —</option>
            {owners.data?.map((o) => (<option key={o.id} value={o.id}>{o.full_name}</option>))}
          </select>
        </F>

        <div className="grid grid-cols-3 gap-3">
          <F label="السعر"><input type="number" className="inp" value={form.price} onChange={(e) => upd("price", e.target.value)} /></F>
          <F label="العملة">
            <select className="inp" value={form.currency} onChange={(e) => upd("currency", e.target.value)}>
              <option value="SYP">ل.س</option><option value="USD">USD</option><option value="EUR">EUR</option><option value="TRY">TRY</option>
            </select>
          </F>
          <F label="الحالة">
            <select className="inp" value={form.status} onChange={(e) => upd("status", e.target.value)}>
              <option value="available">متاح</option><option value="new">جديد</option><option value="reserved">محجوز</option>
              <option value="sold">مباع</option><option value="rented">مؤجر</option><option value="archived">مؤرشف</option>
            </select>
          </F>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <F label="المحافظة/المدينة"><input className="inp" value={form.city} onChange={(e) => upd("city", e.target.value)} /></F>
          <F label="المنطقة"><input className="inp" value={form.area} onChange={(e) => upd("area", e.target.value)} /></F>
        </div>
        <F label="العنوان التفصيلي"><input className="inp" value={form.address} onChange={(e) => upd("address", e.target.value)} /></F>

        <div className="grid grid-cols-4 gap-3">
          <F label="المساحة م²"><input type="number" className="inp" value={form.total_area} onChange={(e) => upd("total_area", e.target.value)} /></F>
          <F label="غرف نوم"><input type="number" className="inp" value={form.bedrooms} onChange={(e) => upd("bedrooms", e.target.value)} /></F>
          <F label="حمامات"><input type="number" className="inp" value={form.bathrooms} onChange={(e) => upd("bathrooms", e.target.value)} /></F>
          <F label="الطابق"><input type="number" className="inp" value={form.floor} onChange={(e) => upd("floor", e.target.value)} /></F>
        </div>

        <div className="flex flex-wrap gap-3 text-sm">
          <Chk label="مصعد" checked={form.elevator} onChange={(v) => upd("elevator", v)} />
          <Chk label="موقف" checked={form.parking} onChange={(v) => upd("parking", v)} />
          <Chk label="مفروش" checked={form.furnished} onChange={(v) => upd("furnished", v)} />
        </div>

        <F label="الوصف"><textarea rows={3} className="inp" value={form.description} onChange={(e) => upd("description", e.target.value)} /></F>
        <F label="ملاحظات داخلية"><textarea rows={2} className="inp" value={form.notes} onChange={(e) => upd("notes", e.target.value)} /></F>

        <div>
          <div className="mb-1 text-xs font-semibold">الصور والفيديوهات</div>
          <MediaUploader value={media} onChange={setMedia} folder={id} />
        </div>

        <div className="flex gap-2 pt-2">
          <button type="button" onClick={() => router.history.back()} className="flex-1 rounded-xl border border-border py-3 text-sm font-semibold">إلغاء</button>
          <button type="submit" disabled={loading} className="flex-1 rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground disabled:opacity-60">
            {loading ? "جاري..." : "حفظ التعديلات"}
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
function Chk({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-semibold">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      {label}
    </label>
  );
}
