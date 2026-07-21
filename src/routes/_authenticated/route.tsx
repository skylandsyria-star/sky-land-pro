import { createFileRoute, Outlet, redirect, Link, useRouter } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Home, Building2, Users, UserCheck, LogOut, Plus, Bell } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useReminders } from "@/hooks/useReminders";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  component: AuthedLayout,
});

function AuthedLayout() {
  const router = useRouter();
  const qc = useQueryClient();
  useReminders(true);



  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    router.navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground font-black">
              SL
            </div>
            <div className="min-w-0">
              <div className="text-sm font-bold leading-tight">سكاي لاند</div>
              <div className="text-[11px] text-muted-foreground leading-tight">إدارة العقارات</div>
            </div>
          </div>
          <button
            onClick={signOut}
            className="inline-flex items-center gap-1 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-accent"
          >
            <LogOut className="h-3.5 w-3.5" />
            خروج
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-4">
        <Outlet />
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur">
        <div className="mx-auto grid max-w-5xl grid-cols-5">
          <NavItem to="/dashboard" icon={<Home className="h-4 w-4" />} label="الرئيسية" />
          <NavItem to="/properties" icon={<Building2 className="h-4 w-4" />} label="العقارات" />
          <NavItem to="/agenda" icon={<Bell className="h-4 w-4" />} label="الأجندة" />
          <NavItem to="/owners" icon={<UserCheck className="h-4 w-4" />} label="الملاك" />
          <NavItem to="/customers" icon={<Users className="h-4 w-4" />} label="العملاء" />
        </div>
      </nav>
    </div>
  );
}

function NavItem({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      to={to}
      className="flex flex-col items-center justify-center gap-1 py-3 text-[11px] font-medium text-muted-foreground [&.active]:text-primary"
      activeProps={{ className: "active" }}
    >
      {icon}
      {label}
    </Link>
  );
}

export { Plus };
