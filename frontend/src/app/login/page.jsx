"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, setToken } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@test.com");
  const [password, setPassword] = useState("123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await apiFetch("/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      setToken(res.access_token);
      router.push("/tasks");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="bg-white/95 backdrop-blur-lg p-8 rounded-3xl shadow-2xl border border-white/20">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">📋</div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Task Manager</h1>
            <p className="text-gray-600 text-sm">Silakan login untuk melanjutkan</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 text-sm text-red-700 bg-red-50 p-4 rounded-xl border-l-4 border-red-500 flex items-center gap-3">
              <span className="text-xl">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                📧 Email Address
              </label>
              <input
                type="email"
                className="w-full border-2 border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 rounded-xl px-4 py-3 transition-all outline-none text-gray-900 bg-white"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                🔒 Password
              </label>
              <input
                type="password"
                className="w-full border-2 border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 rounded-xl px-4 py-3 transition-all outline-none text-gray-900 bg-white"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-3.5 rounded-xl font-bold text-base shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? "🔄 Logging in..." : " Login "}
            </button>
          </form>

          {/* Footer Info */}
          <div className="mt-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
            <p className="text-xs text-gray-600 text-center mb-1 font-medium">
              Akun Demo
            </p>
            <p className="text-xs text-gray-700 text-center">
              <span className="font-semibold">Email:</span> admin@test.com<br/>
              <span className="font-semibold">Password:</span> 123
            </p>
          </div>
        </div>

        {/* Footer text */}
        <p className="text-center text-white/80 text-sm mt-6">
          © 2026 Task Manager App. Made with Kevin Gultom
        </p>
      </div>
    </div>
  );
}
