"use client";

import Image from "next/image";
import { useState, lazy, Suspense } from "react";
import { useRouter } from "next/navigation";
import type { LoginResponse } from "@/types/auth";

const LottieAnimation = lazy(() => import("@/components/LottieAnimation"));

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    remember: false,
  });
  const router = useRouter();

  const LOGO = "/logo/AaravPOS-Logo.png";
  const SYMBOL_BG = "/logo/Symbol_crop.svg";

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (error) setError(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.email.trim() || !formData.password.trim()) {
      setError("Please fill in all fields");
      return;
    }

    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        "https://prod.aaravpos.com/api/v1/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            email: formData.email.trim(),
            password: formData.password,
          }),
        },
      );

      const data: LoginResponse = await response.json();

      if (!response.ok) {
        if (data.errors) {
          const errorsArray = Object.values(data.errors);
          const firstError = errorsArray[0]?.[0];
          setError(firstError || "Validation failed");
        } else if (data.message) {
          setError(data.message);
        } else {
          setError("Login failed. Please try again.");
        }
        return;
      }

      if (data.success && data.data?.token) {
        const userData = {
          token: data.data.token,
          store: data.data.store,
          user: data.data.result,
          roles: data.data.roles,
        };

        const storage = formData.remember ? localStorage : sessionStorage;
        storage.setItem("auth_token", data.data.token);
        storage.setItem("user_data", JSON.stringify(userData));

        router.push("/customer");
      } else {
        setError(data.message || "Invalid credentials");
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      setError("Network error. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-white">
        <header className="px-6 py-5 md:px-10">
          <div className="flex items-center gap-3">
            <Image
              src={LOGO}
              alt="AaravPOS"
              width={200}
              height={60}
              priority
              className="h-auto w-auto"
              sizes="(max-width: 768px) 160px, 200px"
            />
          </div>
        </header>

        <main className="grid min-h-[calc(100vh-84px)] grid-cols-1 lg:grid-cols-[1.2fr_1fr]">
          <section className="hidden items-center justify-center px-6 py-6 lg:flex">
            <div className="w-full max-w-190">
              <Suspense
                fallback={
                  <div className="w-full h-130 xl:h-175 bg-linear-to-br from-gray-100 to-gray-200 rounded-lg" />
                }
              >
                <LottieAnimation />
              </Suspense>
            </div>
          </section>

          <section className="relative flex items-center justify-center px-6 py-10 lg:px-10 overflow-hidden">
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute bottom-0 right-0 opacity-[0.10] md:opacity-[0.12]">
                <Image
                  src={SYMBOL_BG}
                  alt="Background symbol"
                  width={650}
                  height={650}
                  className="select-none"
                  priority={false}
                  loading="lazy"
                  sizes="(max-width: 768px) 300px, 650px"
                />
              </div>
            </div>

            <div className="relative z-10 flex w-full max-w-130 flex-col">
              <div className="rounded-lg sm:p-7">
                <h1 className="text-[24px] sm:text-[26px] font-bold text-slate-900">
                  Welcome!
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                  Sign in to access your AaravPOS dashboard.
                </p>

                {error && (
                  <div className="mt-4 rounded-md bg-red-50 p-4 animate-fadeIn">
                    <div className="flex">
                      <div className="shrink-0">
                        <svg
                          className="h-5 w-5 text-red-400"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-red-800">
                          {error}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <form
                  className="mt-6 space-y-4"
                  onSubmit={handleLogin}
                  noValidate
                >
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-[13px] font-semibold text-slate-700"
                    >
                      Email
                    </label>

                    <div className="relative mt-2">
                      <input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Enter Email (e.g., user@example.com)"
                        className="h-10.5 w-full rounded-md border border-slate-300 bg-white px-3 pr-10 text-sm text-slate-900 outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-500/15 disabled:opacity-50"
                        autoComplete="email"
                        required
                        disabled={isLoading}
                        aria-describedby="email-error"
                      />

                      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <path
                            d="M4 6h16v12H4V6z"
                            stroke="currentColor"
                            strokeWidth="1.6"
                          />
                          <path
                            d="M4 7l8 6 8-6"
                            stroke="currentColor"
                            strokeWidth="1.6"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="password"
                      className="block text-[13px] font-semibold text-slate-700"
                    >
                      Password
                    </label>

                    <div className="relative mt-2">
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="Enter Password"
                        className="h-10.5 w-full rounded-md border border-slate-300 bg-white px-3 pr-16 text-sm text-slate-900 outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-500/15 disabled:opacity-50"
                        autoComplete="current-password"
                        required
                        disabled={isLoading}
                        aria-describedby="password-error"
                      />

                      <button
                        type="button"
                        onClick={() => setShowPassword((s) => !s)}
                        disabled={isLoading}
                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-slate-400 hover:text-slate-600 disabled:opacity-50 transition-colors"
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                      >
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <path
                            d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"
                            stroke="currentColor"
                            strokeWidth="1.6"
                          />
                          <path
                            d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"
                            stroke="currentColor"
                            strokeWidth="1.6"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    <label className="flex items-center gap-2 text-[13px] text-slate-700 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        name="remember"
                        checked={formData.remember}
                        onChange={handleInputChange}
                        className="h-4 w-4 rounded border-slate-300 accent-red-600 disabled:opacity-50 cursor-pointer"
                        disabled={isLoading}
                      />
                      Remember me
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="mt-3 h-10.5 w-full rounded-md bg-red-600 text-sm font-semibold text-white shadow-sm transition-all hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 active:scale-[0.98]"
                    aria-busy={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Signing In...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </button>
                </form>
              </div>

              <div className="mt-8 text-center text-xs text-slate-400 lg:mt-10">
                © {new Date().getFullYear()} Aaravpos. All Rights Reserved.
              </div>
            </div>
          </section>
        </main>
      </div>
    </>
  );
}
