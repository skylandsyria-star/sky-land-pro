import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ContactButtons } from "@/components/ContactButtons";
import { formatPrice } from "@/lib/contact";
import { toast } from "sonner";
import { Trash2, ArrowRight, Pencil } from "lucide-react";
import { MediaGallery, type MediaItem } from "@/components/MediaUploader";

export const Route = createFileRoute("/_authenticated/properties/$id")({
  head: () => ({
    meta: [
      { title: "تفاصيل العقار — سكاي لاند" },
      { name: "description", content: "تفاصيل العقار الكاملة." },
      { property: "og:title", content: "تفاصيل العقار" },
      { property: "og:description", content: "تفاصيل العقار الكاملة." },
    ],
  }),
  component: Detail,
});

const TYPE: Record<string, string> = { apartment: "شقة", villa: "فيلا", house: "منزل", land: "أرض", shop: "محل", office: "مكتب", warehouse: "مستودع", farm: "مزرعة", building: "بناء", chalet: "شاليه", other: "أخرى" };
const STATUS: Record<string, string> = { available: "متاح", new: "جديد", reserved: "محجوز", sold: "مباع", rented: "مؤجر", archived: "مؤرشف" };

function Detail() {
  const { id } = Route.useParams();
  const router = useRouter();
  const qc = useQueryClient();

  const q = useQuery({
    queryKey: ["property", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("properties")
        .select("*, owner:owners(id, full_name, phone, whatsapp)")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  async function del() {
    if (!confirm("حذف هذا العقار؟")) return;
    const { error } = await supabase.from("properties").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("تم الحذف");
    qc.invalidateQueries({ queryKey: ["properties"] });
    router.navigate({ to: "/properties" });
  }

  if (q.isLoading) return <div className="text-sm text-muted-foreground">جاري التحميل...</div>;
  if (!q.data) return <div className="text-sm">غير موجود.</div>;
  const p: any = q.data;

  return (
    <div className="space-y-4">
      <button onClick={() => router.history.back()} className="inline-flex items-center gap-1 text-xs text-muted-foreground">
        <ArrowRight className="h-4 w-4" /> رجوع
      </button>

      <div className="card-elevated p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h1 className="text-lg font-black">{p.title}</h1>
            <div className="mt-0.5 text-[11px] text-muted-foreground" dir="ltr">{p.reference_code}</div>
          </div>
          <span className="status-chip shrink-0">{p.purpose === "sale" ? "بيع" : "إيجار"}</span>
        </div>
        <div className="mt-3 text-2xl font-black text-primary">{formatPrice(p.price, p.currency)}</div>
        <div className="mt-1 text-xs text-muted-foreground">
          {[TYPE[p.property_type] ?? p.property_type, p.city, p.area].filter(Boolean).join(" · ")}
        </div>
        {p.address && <div className="mt-1 text-xs text-muted-foreground">{p.address}</div>}
        <div className="mt-3">
          <span className="status-chip">{STATUS[p.status] ?? p.status}</span>
        </div>
      </div>

      {Array.isArray(p.media) && p.media.length > 0 && (
        <div className="card-elevated p-4">
          <div className="mb-2 text-xs font-bold text-muted-foreground">الصور والفيديوهات</div>
          <MediaGallery items={p.media as MediaItem[]} />
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 text-xs">
        <Fact label="المساحة" value={p.total_area ? `${p.total_area} م²` : "—"} />
        <Fact label="غرف النوم" value={p.bedrooms ?? "—"} />
        <Fact label="الحمامات" value={p.bathrooms ?? "—"} />
        <Fact label="الطابق" value={p.floor ?? "—"} />
        <Fact label="مصعد" value={p.elevator ? "نعم" : "لا"} />
        <Fact label="موقف" value={p.parking ? "نعم" : "لا"} />
        <Fact label="مفروش" value={p.furnished ? "نعم" : "لا"} />
      </div>

      {p.description && (
        <div className="card-elevated p-4">
          <div className="mb-1 text-xs font-bold text-muted-foreground">الوصف</div>
          <div className="whitespace-pre-wrap text-sm">{p.description}</div>
        </div>
      )}
      {p.notes && (
        <div className="card-elevated p-4">
          <div className="mb-1 text-xs font-bold text-muted-foreground">ملاحظات داخلية</div>
          <div className="whitespace-pre-wrap text-sm">{p.notes}</div>
        </div>
      )}

      {p.owner && (
        <div className="card-elevated p-4">
          <div className="mb-2 text-xs font-bold text-muted-foreground">المالك</div>
          <div className="flex items-center justify-between gap-3">
            <Link to="/owners/$id" params={{ id: p.owner.id }} className="min-w-0">
              <div className="truncate font-semibold">{p.owner.full_name}</div>
              <div className="mt-0.5 text-xs text-muted-foreground" dir="ltr">{p.owner.phone}</div>
            </Link>
            <ContactButtons phone={p.owner.phone} whatsapp={p.owner.whatsapp} size="sm" />
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <Link to="/properties/$id/edit" params={{ id }} className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg bg-primary px-3 py-2 text-xs font-bold text-primary-foreground">
          <Pencil className="h-4 w-4" /> تعديل العقار
        </Link>
        <button onClick={del} className="inline-flex items-center gap-1 rounded-lg border border-destructive/40 px-3 py-2 text-xs font-semibold text-destructive">
          <Trash2 className="h-4 w-4" /> حذف
        </button>
      </div>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: any }) {
  return (
    <div className="card-elevated p-3">
      <div className="text-[11px] font-semibold text-muted-foreground">{label}</div>
      <div className="mt-1 text-sm font-bold">{value}</div>
    </div>
  );
}
