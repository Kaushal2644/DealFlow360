import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signupRequest } from "../../api/auth.api";
import useAuthStore from "../../app/authStore";
import AuthLayout from "./AuthLayout";

export default function SignupPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "rep",
    team: "",
  });

  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const handleChange = (e) => {
    setForm((current) => ({
      ...current,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (form.password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      const res = await signupRequest(form);

      login(res.data.token, res.data.user);

      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to create your account."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <main className="min-h-screen flex items-center justify-center px-5 py-8">

        <div className="w-full max-w-[1050px] grid lg:grid-cols-[0.9fr_1.1fr] gap-6">

          {/* BRAND SIDE */}
          <section className="hidden lg:flex relative min-h-[680px] rounded-[28px] overflow-hidden border border-white/[0.08] bg-[#081020] p-10 flex-col justify-between">

            <div
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(circle at 80% 15%, rgba(40,116,255,.15), transparent 32%), radial-gradient(circle at 20% 85%, rgba(96,64,255,.13), transparent 35%)",
              }}
            />

            <div className="relative flex items-center gap-3">
              <img
                src="/logo.png"
                alt="DealFlow360"
                className="w-11 h-11 object-contain"
              />

              <div>
                <div className="text-xl font-bold text-white">
                  DealFlow<span className="text-[#2874ff]">360</span>
                </div>

                <div className="text-[10px] text-slate-500 uppercase tracking-[0.18em]">
                  Deal intelligence
                </div>
              </div>
            </div>

            <div className="relative">

              <p className="text-[#19cddd] text-xs font-semibold uppercase tracking-[0.18em] mb-4">
                Start your flow
              </p>

              <h2 className="text-5xl font-bold tracking-[-2px] leading-[1.05] text-white">
                Turn every
                <br />
                opportunity
                <br />
                into momentum.
              </h2>

              <p className="mt-6 text-sm leading-7 text-slate-400 max-w-sm">
                Connect your sales team, pipeline and
                decision-making process in one intelligent
                workspace.
              </p>

              <div className="mt-9 grid grid-cols-3 gap-2 max-w-sm">

                <div className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-3">
                  <div className="text-lg font-bold text-white">
                    360°
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">
                    Visibility
                  </div>
                </div>

                <div className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-3">
                  <div className="text-lg font-bold text-white">
                    1
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">
                    Connected flow
                  </div>
                </div>

                <div className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-3">
                  <div className="text-lg font-bold text-white">
                    ∞
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">
                    Opportunities
                  </div>
                </div>

              </div>
            </div>

            <div className="relative text-xs text-slate-600">
              DealFlow360 · Built around your deal flow
            </div>
          </section>

          {/* SIGNUP */}
          <section className="rounded-[28px] border border-white/[0.09] bg-[#080d1b] shadow-2xl shadow-black/30 px-7 py-8 sm:px-10">

            <div className="max-w-[450px] mx-auto">

              <div className="flex lg:hidden justify-center mb-6">
                <img
                  src="/logo.png"
                  alt="DealFlow360"
                  className="w-14 h-14 object-contain"
                />
              </div>

              <div className="mb-7">
                <p className="text-[#2874ff] text-xs font-semibold uppercase tracking-[0.18em] mb-3">
                  Get started
                </p>

                <h1 className="text-3xl font-bold tracking-tight text-white">
                  Create your account
                </h1>

                <p className="mt-2 text-sm text-slate-500">
                  Set up your workspace and start managing deals.
                </p>
              </div>

              {error && (
                <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/[0.08] px-4 py-3 text-sm text-red-300">
                  {error}
                </div>
              )}

              <form
                onSubmit={handleSubmit}
                className="space-y-4"
              >

                {/* NAME */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-2">
                    Full name
                  </label>

                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    autoComplete="name"
                    placeholder="Your full name"
                    className="w-full h-11 rounded-xl border border-white/[0.10] bg-[#0d1425] px-4 text-sm text-white placeholder:text-slate-600 outline-none transition focus:border-[#2874ff] focus:ring-4 focus:ring-[#2874ff]/10"
                  />
                </div>

                {/* EMAIL */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-2">
                    Work email
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    autoComplete="email"
                    placeholder="you@company.com"
                    className="w-full h-11 rounded-xl border border-white/[0.10] bg-[#0d1425] px-4 text-sm text-white placeholder:text-slate-600 outline-none transition focus:border-[#2874ff] focus:ring-4 focus:ring-[#2874ff]/10"
                  />
                </div>

                {/* PASSWORD */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-2">
                    Password
                  </label>

                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      required
                      autoComplete="new-password"
                      placeholder="At least 6 characters"
                      className="w-full h-11 rounded-xl border border-white/[0.10] bg-[#0d1425] px-4 pr-20 text-sm text-white placeholder:text-slate-600 outline-none transition focus:border-[#2874ff] focus:ring-4 focus:ring-[#2874ff]/10"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword((value) => !value)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-white"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                {/* CONFIRM */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-2">
                    Confirm password
                  </label>

                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) =>
                      setConfirmPassword(e.target.value)
                    }
                    required
                    autoComplete="new-password"
                    placeholder="Repeat your password"
                    className="w-full h-11 rounded-xl border border-white/[0.10] bg-[#0d1425] px-4 text-sm text-white placeholder:text-slate-600 outline-none transition focus:border-[#2874ff] focus:ring-4 focus:ring-[#2874ff]/10"
                  />
                </div>

                {/* ROLE */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-2">
                    Your role
                  </label>

                  <select
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                    className="w-full h-11 rounded-xl border border-white/[0.10] bg-[#0d1425] px-4 text-sm text-white outline-none transition focus:border-[#2874ff] focus:ring-4 focus:ring-[#2874ff]/10"
                  >
                    <option value="rep">Sales Representative</option>
                    <option value="sales_manager">
                      Sales Manager
                    </option>
                    <option value="finance">Finance</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>

                {/* TEAM */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-2">
                    Team
                    <span className="text-slate-600 ml-1">
                      (optional)
                    </span>
                  </label>

                  <input
                    name="team"
                    value={form.team}
                    onChange={handleChange}
                    placeholder="e.g. Enterprise Sales"
                    className="w-full h-11 rounded-xl border border-white/[0.10] bg-[#0d1425] px-4 text-sm text-white placeholder:text-slate-600 outline-none transition focus:border-[#2874ff] focus:ring-4 focus:ring-[#2874ff]/10"
                  />
                </div>

                {/* SUBMIT */}
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full h-12 mt-2 overflow-hidden rounded-xl bg-[#2874ff] text-sm font-semibold text-white shadow-lg shadow-[#2874ff]/20 transition hover:bg-[#3b80ff] disabled:opacity-50"
                >
                  <span className="relative z-10">
                    {loading
                      ? "Creating account..."
                      : "Create account"}
                  </span>

                  {!loading && (
                    <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                  )}
                </button>
              </form>

              <div className="flex items-center gap-4 my-6">
                <div className="h-px flex-1 bg-white/[0.07]" />
                <span className="text-[11px] text-slate-600">
                  ALREADY A MEMBER?
                </span>
                <div className="h-px flex-1 bg-white/[0.07]" />
              </div>

              <Link
                to="/login"
                className="flex items-center justify-center w-full h-11 rounded-xl border border-white/[0.10] bg-white/[0.02] text-sm font-medium text-slate-300 transition hover:bg-white/[0.05] hover:text-white"
              >
                Sign in instead
              </Link>

              <p className="text-center text-[11px] text-slate-600 mt-6">
                Your account gives you access to the DealFlow360
                workspace.
              </p>

            </div>
          </section>

        </div>
      </main>
    </AuthLayout>
  );
}