import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ContactButtons } from "@/components/ContactButtons";
import { formatPrice } from "@/lib/contact";
import { toast } from "sonner";
import { Trash2, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/_authenticated/customers/$id")({
  head: () => ({
    meta: [
      { title: "ملف العميل — سكاي لاند" },
      { name: "description", content: "تفاصيل العميل وطلبه." },
      { property: "og:title", content: "ملف العميل" },
      { property: "og:description", content: "تفاصيل العميل وطلبه." },
    ],
  }),
  component: Detail,
});

const STATUS: Record<string, string> = { new: "جديد", contacted: "تم التواصل", searching: "قيد البحث", negotiating: "تفاوض", closed: "مغلق" };
const URG: Record<string, string> = { low: "منخفضة", normal: "عادية", high: "عالية", urgent: "عاجلة" };

function Detail() {
  const { id } = Route.useParams();
  const router = useRouter();
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["customer", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("customers").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  async function del() {
    if (!confirm("حذف هذا العميل؟")) return;
    const { error } = await supabase.from("customers").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("تم الحذف");
    qc.invalidateQueries({ queryKey: ["customers"] });
    router.navigate({ to: "/customers" });
  }

  if (q.isLoading) return <div className="text-sm text-muted-foreground">جاري التحميل...</div>;
  if (!q.data) return <div className="text-sm">غير موجود.</div>;
  const c = q.data;

  return (
    <div className="space-y-4">
      <button onClick={() => router.history.back()} className="inline-flex items-center gap-1 text-xs text-muted-foreground">
        <ArrowRight className="h-4 w-4" /> رجوع
      </button>

      <div className="card-elevated p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="truncate text-lg font-black">{c.full_name}</h1>
            <div className="mt-1 text-sm text-muted-foreground" dir="ltr">{c.phone}</div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <span className="status-chip">{c.request_type === "buy" ? "شراء" : "إيجار"}</span>
              <span className="status-chip">{STATUS[c.status] ?? c.status}</span>
              <span className="status-chip">أولوية: {URG[c.urgency ?? "normal"]}</span>
            </div>
          </div>
        </div>
        <div className="mt-4">
          <ContactButtons phone={c.phone} whatsapp={c.whatsapp} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs">
        <Fact label="نوع العقار" value={c.desired_property_type ?? "—"} />
        <Fact label="المدينة" value={c.city ?? "—"} />
        <Fact label="المنطقة" value={c.area ?? "—"} />
        <Fact label="الحد الأدنى للغرف" value={c.min_bedrooms ?? "—"} />
        <Fact label="أدنى ميزانية" value={formatPrice(c.min_budget, c.currency ?? "SYP")} />
        <Fact label="أقصى ميزانية" value={formatPrice(c.max_budget, c.currency ?? "SYP")} />
      </div>

      {c.notes && (
        <div className="card-elevated p-4">
          <div className="mb-1 text-xs font-bold text-muted-foreground">ملاحظات</div>
          <div className="whitespace-pre-wrap text-sm">{c.notes}</div>
        </div>
      )}

      <button onClick={del} className="inline-flex items-center gap-1 rounded-lg border border-destructive/40 px-3 py-2 text-xs font-semibold text-destructive">
        <Trash2 className="h-4 w-4" /> حذف العميل
      </button>
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
