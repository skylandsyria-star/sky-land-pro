import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Building2 } from "lucide-react";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "تسجيل الدخول — سكاي لاند" },
      { name: "description", content: "دخول لمكتب سكاي لاند العقاري." },
      { property: "og:title", content: "تسجيل الدخول — سكاي لاند" },
      { property: "og:description", content: "دخول لمكتب سكاي لاند العقاري." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) router.navigate({ to: "/dashboard", replace: true });
    });
  }, [router]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: fullName, phone },
          },
        });
        if (error) throw error;
        toast.success("تم إنشاء الحساب بنجاح");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("تم تسجيل الدخول");
      }
      router.navigate({ to: "/dashboard", replace: true });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "حدث خطأ";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary text-primary-foreground">
            <Building2 className="h-7 w-7" />
          </div>
          <h1 className="mt-3 text-2xl font-black">سكاي لاند</h1>
          <p className="text-sm text-muted-foreground">إدارة المكتب العقاري</p>
        </div>

        <div className="card-elevated p-5">
          <div className="mb-4 flex rounded-lg bg-muted p-1 text-sm font-semibold">
            <button
              type="button"
              onClick={() => setMode("signin")}
              className={`flex-1 rounded-md py-2 ${mode === "signin" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"}`}
            >
              تسجيل الدخول
            </button>
            <button
              type="button"
              onClick={() => setMode("signup")}
              className={`flex-1 rounded-md py-2 ${mode === "signup" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"}`}
            >
              حساب جديد
            </button>
          </div>

          <form onSubmit={submit} className="space-y-3">
            {mode === "signup" && (
              <>
                <Field label="الاسم الكامل">
                  <input required value={fullName} onChange={(e) => setFullName(e.target.value)} className="input" />
                </Field>
                <Field label="رقم الهاتف">
                  <input value={phone} onChange={(e) => setPhone(e.target.value)} className="input" placeholder="+963..." />
                </Field>
              </>
            )}
            <Field label="البريد الإلكتروني">
              <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input" dir="ltr" />
            </Field>
            <Field label="كلمة المرور">
              <input required type="password" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="input" dir="ltr" />
            </Field>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground disabled:opacity-60"
            >
              {loading ? "جاري..." : mode === "signup" ? "إنشاء الحساب" : "دخول"}
            </button>
          </form>

          {mode === "signup" && (
            <p className="mt-3 text-center text-[11px] text-muted-foreground">
              أول حساب يتم إنشاؤه يصبح المدير تلقائياً.
            </p>
          )}
        </div>
      </div>
      <style>{`
        .input { width:100%; padding: 0.6rem 0.75rem; border: 1px solid var(--color-input); border-radius: 0.6rem; background: var(--color-background); font-size: 0.9rem; }
        .input:focus { outline: 2px solid var(--color-ring); outline-offset: 1px; }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-foreground">{label}</span>
      {children}
    </label>
  );
}
