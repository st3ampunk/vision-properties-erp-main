import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import ThemeToggle from "@/components/ThemeToggle";
import LoginForm from "./LoginForm";

export default async function LoginPage() {
  const session = await getSession();
  if (session) redirect("/dashboard");

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-6">
      {/* Ambient accent glow */}
      <div
        className="pointer-events-none absolute -top-40 left-1/2 h-[420px] w-[620px] -translate-x-1/2 rounded-full opacity-30 blur-[120px]"
        style={{ background: "radial-gradient(circle, var(--accent) 0%, transparent 70%)" }}
      />
      <div className="absolute right-6 top-6">
        <ThemeToggle />
      </div>

      <div className="relative w-full max-w-sm">
        <div className="mb-8 text-center">
          <div
            className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl text-xl font-bold shadow-lg"
            style={{ background: "var(--accent)", color: "var(--accent-contrast)" }}
          >
            VP
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Vision Properties</h1>
          <p className="mt-1.5 text-sm text-[var(--muted)]">
            Plot Booking &amp; Inventory Management
          </p>
        </div>

        <div className="card" style={{ padding: "28px", boxShadow: "var(--shadow-lg)" }}>
          <div className="mb-5">
            <h2 className="text-base font-semibold">Sign in to your account</h2>
            <p className="mt-1 text-xs text-[var(--muted)]">
              Enter your credentials to continue.
            </p>
          </div>
          <LoginForm />
        </div>

        <p className="mt-6 text-center text-xs text-[var(--muted)]">
          © {new Date().getFullYear()} Vision Properties. All rights reserved.
        </p>
      </div>
    </div>
  );
}
