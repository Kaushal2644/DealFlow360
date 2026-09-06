import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginRequest } from "../../api/auth.api";
import useAuthStore from "../../app/authStore";
import AuthLayout from "./AuthLayout";

function MailIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <rect x="4" y="10" width="16" height="10" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

function EyeIcon({ hidden = false }) {
  return hidden ? (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M3 3l18 18" />
      <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
      <path d="M9.9 4.3A10.7 10.7 0 0 1 12 4c7 0 10 8 10 8a17 17 0 0 1-3.1 4.2" />
      <path d="M6.6 6.6C3.8 8.5 2 12 2 12s3 8 10 8a10.5 10.5 0 0 0 4-.8" />
    </svg>
  ) : (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M2 12s3-8 10-8 10 8 10 8-3 8-10 8S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const res = await loginRequest(email, password);

      login(res.data.token, res.data.user);

      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to sign in. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <main className="min-h-screen flex items-center justify-center px-5 py-10">
        <div className="w-full max-w-[1040px] grid lg:grid-cols-[1.05fr_0.95fr] gap-6">
          {/* LEFT BRAND PANEL */}
          <section className="hidden lg:flex relative min-h-[620px] overflow-hidden rounded-[28px] border border-white/[0.08] bg-[#081020] p-10 flex-col justify-between">
            <div
              className="absolute inset-0 opacity-40"
              style={{
                background:
                  "radial-gradient(circle at 20% 20%, rgba(40,116,255,.16), transparent 35%), radial-gradient(circle at 90% 80%, rgba(96,64,255,.12), transparent 35%)",
              }}
            />

            <div className="relative">
              <div className="flex items-center gap-3">
                <img
                  src="/logo.png"
                  alt="DealFlow360"
                  className="w-11 h-11 object-contain"
                />

                <div>
                  <div className="text-xl font-bold text-white tracking-tight">
                    DealFlow<span className="text-[#2874ff]">360</span>
                  </div>

                  <div className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
                    Deal intelligence
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="max-w-md">
                <p className="text-[#2874ff] text-sm font-semibold mb-4">
                  YOUR DEALS. ONE FLOW.
                </p>

                <h2 className="text-5xl font-bold leading-[1.05] tracking-[-2px] text-white">
                  See every deal
                  <br />
                  from every angle.
                </h2>

                <p className="mt-6 text-slate-400 leading-7 text-sm max-w-sm">
                  DealFlow360 brings your pipeline, activities, approvals and
                  revenue signals into one connected workspace.
                </p>
              </div>

              <div className="mt-10 flex gap-2">
                <span className="h-1 w-16 rounded-full bg-[#2874ff]" />
                <span className="h-1 w-8 rounded-full bg-[#6040ff]" />
                <span className="h-1 w-5 rounded-full bg-[#ff8b1a]" />
              </div>
            </div>

            <div className="relative text-xs text-slate-600">
              DealFlow360 · 360° visibility across your sales flow
            </div>
          </section>

          {/* LOGIN CARD */}
          <section className="relative rounded-[28px] border border-white/[0.09] bg-[#080d1b] shadow-2xl shadow-black/30 px-7 py-9 sm:px-10 flex items-center">
            <div className="w-full max-w-[430px] mx-auto">
              {/* Mobile logo */}
              <div className="flex lg:hidden justify-center mb-7">
                <img
                  src="/logo.png"
                  alt="DealFlow360"
                  className="w-16 h-16 object-contain"
                />
              </div>

              <div className="mb-8">
                <p className="text-[#2874ff] text-xs font-semibold uppercase tracking-[0.18em] mb-3">
                  Welcome back
                </p>

                <h1 className="text-3xl font-bold tracking-tight text-white">
                  Sign in to DealFlow360
                </h1>

                <p className="mt-2 text-sm text-slate-500">
                  Continue where your deals left off.
                </p>
              </div>

              {error && (
                <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/[0.08] px-4 py-3 text-sm text-red-300">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* EMAIL */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-2">
                    Work email
                  </label>

                  <div className="relative">
                    <MailIcon />

                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                      placeholder="you@company.com"
                      className="w-full h-12 rounded-xl border border-white/[0.10] bg-[#0d1425] pl-11 pr-4 text-sm text-white placeholder:text-slate-600 outline-none transition focus:border-[#2874ff] focus:ring-4 focus:ring-[#2874ff]/10"
                    />
                  </div>
                </div>

                {/* PASSWORD */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-medium text-slate-300">
                      Password
                    </label>

                    <button
                      type="button"
                      className="text-xs text-[#5791ff] hover:text-white transition"
                    >
                      Forgot password?
                    </button>
                  </div>

                  <div className="relative">
                    <LockIcon />

                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                      placeholder="Enter your password"
                      className="w-full h-12 rounded-xl border border-white/[0.10] bg-[#0d1425] pl-11 pr-12 text-sm text-white placeholder:text-slate-600 outline-none transition focus:border-[#2874ff] focus:ring-4 focus:ring-[#2874ff]/10"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((value) => !value)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      <EyeIcon hidden={showPassword} />
                    </button>
                  </div>
                </div>

                {/* REMEMBER */}
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="accent-[#2874ff]"
                  />

                  <span className="text-xs text-slate-500">
                    Keep me signed in
                  </span>
                </label>

                {/* SUBMIT */}
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full h-12 overflow-hidden rounded-xl bg-[#2874ff] text-sm font-semibold text-white shadow-lg shadow-[#2874ff]/20 transition hover:bg-[#3b80ff] hover:shadow-[#2874ff]/30 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span className="relative z-10">
                    {loading ? "Signing in..." : "Sign in"}
                  </span>

                  {!loading && (
                    <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                  )}
                </button>
              </form>

              {/* DIVIDER */}
              <div className="flex items-center gap-4 my-7">
                <div className="h-px flex-1 bg-white/[0.07]" />
                <span className="text-[11px] text-slate-600">
                  NEW TO DEALFLOW360?
                </span>
                <div className="h-px flex-1 bg-white/[0.07]" />
              </div>

              <div className="space-y-3">
                <Link
                  to="/signup"
                  className="flex items-center justify-center w-full h-11 rounded-xl border border-white/[0.10] bg-white/[0.02] text-sm font-medium text-slate-300 transition hover:bg-white/[0.05] hover:text-white hover:border-white/[0.18]"
                >
                  Create your account
                </Link>

                <Link
                  to="/portal/login"
                  className="flex items-center justify-center w-full h-11 rounded-xl border border-[#2874ff]/30 bg-[#2874ff]/[0.06] text-sm font-medium text-[#5791ff] transition hover:bg-[#2874ff]/[0.12] hover:text-white hover:border-[#2874ff]/50"
                >
                  Customer Portal →
                </Link>
              </div>

              <p className="text-center text-[11px] text-slate-600 mt-7">
                By continuing, you agree to our terms and privacy policy.
              </p>
            </div>
          </section>
        </div>
      </main>
    </AuthLayout>
  );
}