import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Search, Folder, ArrowRight, Settings2, Trash2, Check, X } from "lucide-react";
import { useState } from "react";
import { formatPrice } from "@/lib/contact";
import { useCategories, useCategoryCounts } from "@/hooks/useCategories";
import { PropertyMoveControls, useRefreshProperties } from "@/components/PropertyMoveControls";
import { stageLabel } from "@/lib/pipeline";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/properties/")({
  head: () => ({
    meta: [
      { title: "العقارات — سكاي لاند" },
      { name: "description", content: "تصنيفات ومجلدات العقارات." },
      { property: "og:title", content: "العقارات" },
      { property: "og:description", content: "إدارة العقارات ضمن تصنيفات." },
    ],
  }),
  validateSearch: (s: Record<string, unknown>) => ({
    cat: typeof s.cat === "string" ? s.cat : undefined,
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
  const { cat } = Route.useSearch();
  const navigate = Route.useNavigate();
  const [q, setQ] = useState("");
  const [purpose, setPurpose] = useState<string>("all");
  const [manage, setManage] = useState(false);

  const cats = useCategories();
  const counts = useCategoryCounts();

  const { data, isLoading } = useQuery({
    queryKey: ["properties"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("properties")
        .select("id, title, city, area, purpose, property_type, status, price, currency, reference_code, bedrooms, total_area, category_id, pipeline_status")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const currentCat = cats.data?.find((c) => c.id === cat);

  const filtered = data?.filter((p) => {
    if (cat) {
      if (cat === "__none__" ? p.category_id != null : p.category_id !== cat) return false;
    }
    if (purpose !== "all" && p.purpose !== purpose) return false;
    if (!q) return true;
    return (
      p.title.includes(q) ||
      p.reference_code?.includes(q) ||
      p.city?.includes(q) ||
      p.area?.includes(q)
    );
  });

  // ---------- Categories grid ----------
  if (!cat) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black">العقارات</h1>
            <p className="text-xs text-muted-foreground">{counts.data?.total ?? 0} عقار ضمن {cats.data?.length ?? 0} تصنيف</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setManage((m) => !m)} className="inline-flex items-center gap-1 rounded-xl border border-border px-3 py-2 text-xs font-bold">
              <Settings2 className="h-4 w-4" /> التصنيفات
            </button>
            <Link to="/properties/new" className="inline-flex items-center gap-1 rounded-xl bg-primary px-3 py-2 text-xs font-bold text-primary-foreground">
              <Plus className="h-4 w-4" /> إضافة
            </Link>
          </div>
        </div>

        {manage && <CategoryManager />}

        <div className="grid grid-cols-2 gap-3">
          {cats.data?.map((c) => (
            <button
              key={c.id}
              onClick={() => navigate({ search: { cat: c.id } })}
              className="card-elevated flex flex-col items-start gap-2 p-4 text-right hover:bg-accent/50"
            >
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary">
                <Folder className="h-5 w-5" />
              </span>
              <span className="line-clamp-2 text-sm font-bold">{c.name}</span>
              <span className="text-[11px] font-semibold text-muted-foreground">
                {counts.data?.counts[c.id] ?? 0} عقار
              </span>
            </button>
          ))}
          {(counts.data?.none ?? 0) > 0 && (
            <button
              onClick={() => navigate({ search: { cat: "__none__" } })}
              className="card-elevated flex flex-col items-start gap-2 p-4 text-right hover:bg-accent/50"
            >
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-muted text-muted-foreground">
                <Folder className="h-5 w-5" />
              </span>
              <span className="text-sm font-bold">بدون تصنيف</span>
              <span className="text-[11px] font-semibold text-muted-foreground">{counts.data?.none} عقار</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  // ---------- Properties inside a category ----------
  return (
    <div className="space-y-4">
      <button onClick={() => navigate({ search: {} })} className="inline-flex items-center gap-1 text-xs text-muted-foreground">
        <ArrowRight className="h-4 w-4" /> كل التصنيفات
      </button>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black">{cat === "__none__" ? "بدون تصنيف" : currentCat?.name ?? "التصنيف"}</h1>
          <p className="text-xs text-muted-foreground">{filtered?.length ?? 0} عقار</p>
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
        <div className="card-elevated p-8 text-center text-sm text-muted-foreground">لا توجد عقارات في هذا التصنيف.</div>
      )}

      <div className="space-y-2">
        {filtered?.map((p) => (
          <div key={p.id} className="card-elevated p-3">
            <Link to="/properties/$id" params={{ id: p.id }} className="block">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="truncate font-semibold">{p.title}</div>
                  <div className="mt-0.5 text-[11px] text-muted-foreground" dir="ltr">{p.reference_code}</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {[TYPE[p.property_type] ?? p.property_type, p.city, p.area].filter(Boolean).join(" · ")}
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                    {p.bedrooms != null && <span>🛏 {p.bedrooms}</span>}
                    {p.total_area != null && <span>📐 {p.total_area} م²</span>}
                    <span className="status-chip">{stageLabel(p.pipeline_status)}</span>
                  </div>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <span className="status-chip">{PURPOSE[p.purpose]}</span>
                  <div className="text-sm font-bold text-primary">{formatPrice(p.price, p.currency ?? "SYP")}</div>
                </div>
              </div>
            </Link>
            <div className="mt-3 border-t border-border pt-3">
              <PropertyMoveControls propertyId={p.id} categoryId={p.category_id} pipelineStatus={p.pipeline_status} compact />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CategoryManager() {
  const cats = useCategories();
  const qc = useQueryClient();
  const refresh = useRefreshProperties();
  const [name, setName] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  function done() {
    qc.invalidateQueries({ queryKey: ["property-categories"] });
    refresh();
  }

  async function add() {
    if (!name.trim()) return;
    const { error } = await supabase.from("property_categories").insert({ name: name.trim(), sort_order: (cats.data?.length ?? 0) + 1 });
    if (error) return toast.error(error.message);
    setName("");
    toast.success("تمت إضافة التصنيف");
    done();
  }

  async function save(id: string) {
    if (!editName.trim()) return;
    const { error } = await supabase.from("property_categories").update({ name: editName.trim() }).eq("id", id);
    if (error) return toast.error(error.message);
    setEditing(null);
    toast.success("تم تعديل الاسم");
    done();
  }

  async function remove(id: string) {
    if (!confirm("حذف هذا التصنيف؟ العقارات لن تُحذف وستصبح بدون تصنيف.")) return;
    const { error } = await supabase.from("property_categories").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("تم حذف التصنيف");
    done();
  }

  return (
    <div className="card-elevated space-y-3 p-4">
      <div className="text-xs font-bold text-muted-foreground">إدارة التصنيفات</div>
      <div className="flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="اسم تصنيف جديد"
          className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm"
        />
        <button onClick={add} className="rounded-lg bg-primary px-3 py-2 text-xs font-bold text-primary-foreground">إضافة</button>
      </div>
      <div className="space-y-1">
        {cats.data?.map((c) => (
          <div key={c.id} className="flex items-center gap-2 rounded-lg border border-border px-2 py-1.5">
            {editing === c.id ? (
              <>
                <input value={editName} onChange={(e) => setEditName(e.target.value)} className="flex-1 rounded-md border border-input bg-background px-2 py-1 text-sm" />
                <button onClick={() => save(c.id)} className="text-success"><Check className="h-4 w-4" /></button>
                <button onClick={() => setEditing(null)} className="text-muted-foreground"><X className="h-4 w-4" /></button>
              </>
            ) : (
              <>
                <span className="flex-1 truncate text-sm font-semibold">{c.name}</span>
                <button onClick={() => { setEditing(c.id); setEditName(c.name); }} className="text-xs font-semibold text-primary">تعديل</button>
                <button onClick={() => remove(c.id)} className="text-destructive"><Trash2 className="h-4 w-4" /></button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
