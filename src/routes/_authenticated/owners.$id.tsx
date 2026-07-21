import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ContactButtons } from "@/components/ContactButtons";
import { toast } from "sonner";
import { Trash2, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/_authenticated/owners/$id")({
  head: () => ({
    meta: [
      { title: "ملف المالك — سكاي لاند" },
      { name: "description", content: "تفاصيل صاحب العقار." },
      { property: "og:title", content: "ملف المالك" },
      { property: "og:description", content: "تفاصيل صاحب العقار." },
    ],
  }),
  component: OwnerDetail,
});

const STATUS_LABEL: Record<string, string> = {
  new: "جديد",
  contacted: "تم التواصل",
  active: "نشط",
  waiting: "في الانتظار",
  not_responding: "لا يرد",
  archived: "مؤرشف",
};

function OwnerDetail() {
  const { id } = Route.useParams();
  const router = useRouter();
  const qc = useQueryClient();

  const owner = useQuery({
    queryKey: ["owner", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("owners").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const properties = useQuery({
    queryKey: ["owner-properties", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("properties")
        .select("id, title, city, area, purpose, status, price, currency")
        .eq("owner_id", id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  async function del() {
    if (!confirm("هل تريد حذف هذا المالك نهائياً؟")) return;
    const { error } = await supabase.from("owners").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("تم الحذف");
    qc.invalidateQueries({ queryKey: ["owners"] });
    router.navigate({ to: "/owners" });
  }

  if (owner.isLoading) return <div className="text-sm text-muted-foreground">جاري التحميل...</div>;
  if (!owner.data) return <div className="text-sm">غير موجود.</div>;
  const o = owner.data;

  return (
    <div className="space-y-4">
      <button onClick={() => router.history.back()} className="inline-flex items-center gap-1 text-xs text-muted-foreground">
        <ArrowRight className="h-4 w-4" /> رجوع
      </button>

      <div className="card-elevated p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="truncate text-lg font-black">{o.full_name}</h1>
            <div className="mt-1 text-sm text-muted-foreground" dir="ltr">{o.phone}</div>
            {(o.city || o.area) && (
              <div className="mt-0.5 text-xs text-muted-foreground">
                {[o.city, o.area].filter(Boolean).join(" · ")}
              </div>
            )}
            <span className="status-chip mt-2">{STATUS_LABEL[o.status] ?? o.status}</span>
          </div>
        </div>
        <div className="mt-4">
          <ContactButtons phone={o.phone} whatsapp={o.whatsapp} />
        </div>
      </div>

      {o.notes && (
        <div className="card-elevated p-4">
          <div className="mb-1 text-xs font-bold text-muted-foreground">ملاحظات</div>
          <div className="whitespace-pre-wrap text-sm">{o.notes}</div>
        </div>
      )}

      <div>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-bold">عقارات هذا المالك ({properties.data?.length ?? 0})</h2>
          <Link to="/properties/new" search={{ owner: id } as any} className="text-xs font-semibold text-primary">
            + إضافة عقار
          </Link>
        </div>
        <div className="space-y-2">
          {properties.data?.length === 0 && (
            <div className="card-elevated p-4 text-center text-xs text-muted-foreground">لا توجد عقارات مسجلة.</div>
          )}
          {properties.data?.map((p) => (
            <Link key={p.id} to="/properties/$id" params={{ id: p.id }} className="card-elevated block p-3 hover:bg-accent/50">
              <div className="flex items-center justify-between gap-2">
                <div className="truncate font-semibold">{p.title}</div>
                <span className="status-chip shrink-0">{p.purpose === "sale" ? "بيع" : "إيجار"}</span>
              </div>
              <div className="mt-0.5 text-xs text-muted-foreground">
                {[p.city, p.area].filter(Boolean).join(" · ") || "بدون موقع"}
              </div>
            </Link>
          ))}
        </div>
      </div>

      <button onClick={del} className="inline-flex items-center gap-1 rounded-lg border border-destructive/40 px-3 py-2 text-xs font-semibold text-destructive">
        <Trash2 className="h-4 w-4" /> حذف المالك
      </button>
    </div>
  );
}
