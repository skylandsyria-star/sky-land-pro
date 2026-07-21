import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Search } from "lucide-react";
import { useState } from "react";
import { formatPrice } from "@/lib/contact";

export const Route = createFileRoute("/_authenticated/properties/")({
  head: () => ({
    meta: [
      { title: "العقارات — سكاي لاند" },
      { name: "description", content: "قائمة العقارات." },
      { property: "og:title", content: "العقارات" },
      { property: "og:description", content: "إدارة قائمة العقارات." },
    ],
  }),
  component: List,
});

const PURPOSE: Record<string, string> = { sale: "بيع", rent: "إيجار" };
const TYPE: Record<string, string> = {
  apartment: "شقة", villa: "فيلا", house: "منزل", land: "أرض",
  shop: "محل", office: "مكتب", warehouse: "مستودع", farm: "مزرعة",
  building: "بناء", chalet: "شاليه", other: "أخرى",
};

function List() {
  const [q, setQ] = useState("");
  const [purpose, setPurpose] = useState<string>("all");

  const { data, isLoading } = useQuery({
    queryKey: ["properties"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("properties")
        .select("id, title, city, area, purpose, property_type, status, price, currency, reference_code, bedrooms, total_area")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const filtered = data?.filter((p) => {
    if (purpose !== "all" && p.purpose !== purpose) return false;
    if (!q) return true;
    return (
      p.title.includes(q) ||
      p.reference_code?.includes(q) ||
      p.city?.includes(q) ||
      p.area?.includes(q)
    );
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black">العقارات</h1>
          <p className="text-xs text-muted-foreground">{data?.length ?? 0} عقار</p>
        </div>
        <Link to="/properties/new" className="inline-flex items-center gap-1 rounded-xl bg-primary px-3 py-2 text-xs font-bold text-primary-foreground">
          <Plus className="h-4 w-4" /> إضافة
        </Link>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="بحث بالعنوان أو الرقم المرجعي أو المدينة..."
          className="w-full rounded-xl border border-input bg-card px-3 py-2.5 pe-10 text-sm"
        />
      </div>

      <div className="flex gap-2">
        {[["all", "الكل"], ["sale", "بيع"], ["rent", "إيجار"]].map(([v, l]) => (
          <button
            key={v}
            onClick={() => setPurpose(v)}
            className={`rounded-full px-3 py-1 text-xs font-semibold ${purpose === v ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
          >
            {l}
          </button>
        ))}
      </div>

      {isLoading && <div className="text-sm text-muted-foreground">جاري التحميل...</div>}
      {filtered?.length === 0 && (
        <div className="card-elevated p-8 text-center text-sm text-muted-foreground">
          لا توجد عقارات مطابقة.
        </div>
      )}

      <div className="space-y-2">
        {filtered?.map((p) => (
          <Link key={p.id} to="/properties/$id" params={{ id: p.id }} className="card-elevated block p-3 hover:bg-accent/50">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="truncate font-semibold">{p.title}</div>
                <div className="mt-0.5 text-[11px] text-muted-foreground" dir="ltr">
                  {p.reference_code}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {[TYPE[p.property_type] ?? p.property_type, p.city, p.area].filter(Boolean).join(" · ")}
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                  {p.bedrooms != null && <span>🛏 {p.bedrooms}</span>}
                  {p.total_area != null && <span>📐 {p.total_area} م²</span>}
                </div>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <span className="status-chip">{PURPOSE[p.purpose]}</span>
                <div className="text-sm font-bold text-primary">{formatPrice(p.price, p.currency ?? "SYP")}</div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
