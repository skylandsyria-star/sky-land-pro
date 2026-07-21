import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Search } from "lucide-react";
import { useState } from "react";
import { ContactButtons } from "@/components/ContactButtons";

export const Route = createFileRoute("/_authenticated/owners/")({
  head: () => ({
    meta: [
      { title: "أصحاب العقارات — سكاي لاند" },
      { name: "description", content: "قائمة أصحاب العقارات." },
      { property: "og:title", content: "أصحاب العقارات" },
      { property: "og:description", content: "إدارة ملاك العقارات." },
    ],
  }),
  component: OwnersList,
});

function OwnersList() {
  const [q, setQ] = useState("");
  const { data, isLoading } = useQuery({
    queryKey: ["owners"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("owners")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const filtered = data?.filter(
    (o) =>
      !q ||
      o.full_name.includes(q) ||
      o.phone?.includes(q) ||
      o.city?.includes(q) ||
      o.area?.includes(q),
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black">أصحاب العقارات</h1>
          <p className="text-xs text-muted-foreground">{data?.length ?? 0} مالك</p>
        </div>
        <Link
          to="/owners/new"
          className="inline-flex items-center gap-1 rounded-xl bg-primary px-3 py-2 text-xs font-bold text-primary-foreground"
        >
          <Plus className="h-4 w-4" /> إضافة
        </Link>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="بحث بالاسم أو الهاتف أو المدينة..."
          className="w-full rounded-xl border border-input bg-card px-3 py-2.5 pe-10 text-sm"
        />
      </div>

      {isLoading && <div className="text-sm text-muted-foreground">جاري التحميل...</div>}
      {filtered?.length === 0 && (
        <div className="card-elevated p-8 text-center text-sm text-muted-foreground">
          لا يوجد ملاك مطابقون.
        </div>
      )}

      <div className="space-y-2">
        {filtered?.map((o) => (
          <Link
            key={o.id}
            to="/owners/$id"
            params={{ id: o.id }}
            className="card-elevated flex items-center justify-between gap-3 p-3 hover:bg-accent/50"
          >
            <div className="min-w-0 flex-1">
              <div className="truncate font-semibold">{o.full_name}</div>
              <div className="mt-0.5 text-xs text-muted-foreground" dir="ltr">
                {o.phone}
              </div>
              {(o.city || o.area) && (
                <div className="mt-0.5 text-[11px] text-muted-foreground">
                  {[o.city, o.area].filter(Boolean).join(" · ")}
                </div>
              )}
            </div>
            <ContactButtons phone={o.phone} whatsapp={o.whatsapp} size="sm" />
          </Link>
        ))}
      </div>
    </div>
  );
}
