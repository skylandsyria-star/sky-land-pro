import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Search } from "lucide-react";
import { useState } from "react";
import { ContactButtons } from "@/components/ContactButtons";
import { formatPrice } from "@/lib/contact";

export const Route = createFileRoute("/_authenticated/customers/")({
  head: () => ({
    meta: [
      { title: "العملاء — سكاي لاند" },
      { name: "description", content: "قائمة العملاء وطلباتهم." },
      { property: "og:title", content: "العملاء" },
      { property: "og:description", content: "إدارة العملاء وطلباتهم." },
    ],
  }),
  component: List,
});

function List() {
  const [q, setQ] = useState("");
  const [type, setType] = useState("all");

  const { data, isLoading } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      const { data, error } = await supabase.from("customers").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const filtered = data?.filter((c) => {
    if (type !== "all" && c.request_type !== type) return false;
    if (!q) return true;
    return c.full_name.includes(q) || c.phone?.includes(q) || c.city?.includes(q);
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black">العملاء</h1>
          <p className="text-xs text-muted-foreground">{data?.length ?? 0} عميل</p>
        </div>
        <Link to="/customers/new" className="inline-flex items-center gap-1 rounded-xl bg-primary px-3 py-2 text-xs font-bold text-primary-foreground">
          <Plus className="h-4 w-4" /> إضافة
        </Link>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="بحث بالاسم أو الهاتف..." className="w-full rounded-xl border border-input bg-card px-3 py-2.5 pe-10 text-sm" />
      </div>

      <div className="flex gap-2">
        {[["all", "الكل"], ["buy", "شراء"], ["rent", "إيجار"]].map(([v, l]) => (
          <button key={v} onClick={() => setType(v)} className={`rounded-full px-3 py-1 text-xs font-semibold ${type === v ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>{l}</button>
        ))}
      </div>

      {isLoading && <div className="text-sm text-muted-foreground">جاري التحميل...</div>}
      {filtered?.length === 0 && (
        <div className="card-elevated p-8 text-center text-sm text-muted-foreground">لا يوجد عملاء مطابقون.</div>
      )}

      <div className="space-y-2">
        {filtered?.map((c) => (
          <Link key={c.id} to="/customers/$id" params={{ id: c.id }} className="card-elevated flex items-start justify-between gap-3 p-3 hover:bg-accent/50">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <div className="truncate font-semibold">{c.full_name}</div>
                <span className="status-chip">{c.request_type === "buy" ? "شراء" : "إيجار"}</span>
              </div>
              <div className="mt-0.5 text-xs text-muted-foreground" dir="ltr">{c.phone}</div>
              <div className="mt-1 text-[11px] text-muted-foreground">
                {[c.city, c.area].filter(Boolean).join(" · ")}
              </div>
              {(c.min_budget || c.max_budget) && (
                <div className="mt-1 text-[11px] text-muted-foreground">
                  الميزانية: {formatPrice(c.min_budget, c.currency ?? "SYP")} — {formatPrice(c.max_budget, c.currency ?? "SYP")}
                </div>
              )}
            </div>
            <ContactButtons phone={c.phone} whatsapp={c.whatsapp} size="sm" />
          </Link>
        ))}
      </div>
    </div>
  );
}
