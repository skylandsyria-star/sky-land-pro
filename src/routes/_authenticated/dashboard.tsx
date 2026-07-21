import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Building2, UserCheck, Users, Plus } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "الرئيسية — سكاي لاند" },
      { name: "description", content: "نظرة عامة على العقارات والملاك والعملاء." },
      { property: "og:title", content: "الرئيسية — سكاي لاند" },
      { property: "og:description", content: "نظرة عامة على المكتب العقاري." },
    ],
  }),
  component: Dashboard,
});

function useCount(table: "owners" | "properties" | "customers", filter?: (q: any) => any) {
  return useQuery({
    queryKey: ["count", table, filter?.toString()],
    queryFn: async () => {
      let q = supabase.from(table).select("*", { count: "exact", head: true });
      if (filter) q = filter(q);
      const { count, error } = await q;
      if (error) throw error;
      return count ?? 0;
    },
  });
}

function Dashboard() {
  const owners = useCount("owners");
  const properties = useCount("properties");
  const available = useCount("properties", (q) => q.eq("status", "available"));
  const customers = useCount("customers");
  const buyers = useCount("customers", (q) => q.eq("request_type", "buy"));
  const renters = useCount("customers", (q) => q.eq("request_type", "rent"));

  const recent = useQuery({
    queryKey: ["recent-properties"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("properties")
        .select("id, title, city, area, price, currency, purpose, status, created_at")
        .order("created_at", { ascending: false })
        .limit(5);
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="space-y-5">
      <section>
        <h1 className="text-xl font-black">مرحباً بك</h1>
        <p className="text-sm text-muted-foreground">لوحة تحكم مكتب سكاي لاند العقاري</p>
      </section>

      <section className="grid grid-cols-2 gap-3">
        <StatCard label="إجمالي العقارات" value={properties.data} icon={<Building2 className="h-5 w-5" />} tone="primary" />
        <StatCard label="عقارات متاحة" value={available.data} icon={<Building2 className="h-5 w-5" />} tone="success" />
        <StatCard label="أصحاب العقارات" value={owners.data} icon={<UserCheck className="h-5 w-5" />} />
        <StatCard label="العملاء" value={customers.data} icon={<Users className="h-5 w-5" />} />
        <StatCard label="طلبات شراء" value={buyers.data} icon={<Users className="h-5 w-5" />} />
        <StatCard label="طلبات إيجار" value={renters.data} icon={<Users className="h-5 w-5" />} />
      </section>

      <section>
        <h2 className="mb-2 text-sm font-bold">إجراءات سريعة</h2>
        <div className="grid grid-cols-3 gap-2">
          <QuickAction to="/properties/new" label="عقار جديد" />
          <QuickAction to="/owners/new" label="مالك جديد" />
          <QuickAction to="/customers/new" label="عميل جديد" />
        </div>
      </section>

      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-bold">أحدث العقارات</h2>
          <Link to="/properties" className="text-xs font-semibold text-primary">عرض الكل</Link>
        </div>
        <div className="space-y-2">
          {recent.isLoading && <div className="text-sm text-muted-foreground">جاري التحميل...</div>}
          {recent.data?.length === 0 && (
            <div className="card-elevated p-6 text-center text-sm text-muted-foreground">
              لا توجد عقارات بعد. ابدأ بإضافة عقار جديد.
            </div>
          )}
          {recent.data?.map((p) => (
            <Link
              key={p.id}
              to="/properties/$id"
              params={{ id: p.id }}
              className="card-elevated flex items-center justify-between p-3 hover:bg-accent/50"
            >
              <div className="min-w-0">
                <div className="truncate font-semibold">{p.title}</div>
                <div className="mt-0.5 text-xs text-muted-foreground">
                  {[p.city, p.area].filter(Boolean).join(" · ") || "بدون موقع"}
                </div>
              </div>
              <span className="status-chip shrink-0">
                {p.purpose === "sale" ? "بيع" : "إيجار"}
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: number | undefined;
  icon: React.ReactNode;
  tone?: "primary" | "success";
}) {
  const bg = tone === "primary" ? "bg-primary text-primary-foreground" : tone === "success" ? "bg-success text-success-foreground" : "bg-muted text-muted-foreground";
  return (
    <div className="card-elevated p-3">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold text-muted-foreground">{label}</span>
        <span className={`grid h-8 w-8 place-items-center rounded-lg ${bg}`}>{icon}</span>
      </div>
      <div className="mt-2 text-2xl font-black">{value ?? "—"}</div>
    </div>
  );
}

function QuickAction({ to, label }: { to: string; label: string }) {
  return (
    <Link
      to={to}
      className="card-elevated flex flex-col items-center justify-center gap-1 py-3 text-xs font-semibold hover:bg-accent/50"
    >
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground">
        <Plus className="h-4 w-4" />
      </span>
      {label}
    </Link>
  );
}
