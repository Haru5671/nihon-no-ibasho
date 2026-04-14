"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import Header from "@/components/Header";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetSent, setResetSent] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    window.location.href = "/";
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetLoading(true);
    await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: `${window.location.origin}/auth/update-password`,
    });
    setResetLoading(false);
    setResetSent(true);
  };

  const handleGoogleLogin = async () => {
    setError("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) setError(error.message);
  };

  return (
    <>
      <Header />
      <main className="bg-[#f8fafb] min-h-screen pt-24 pb-12 px-4">
        <div className="max-w-sm mx-auto">
          <h1 className="text-2xl font-bold text-gray-800 text-center mb-8">ログイン</h1>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">メールアドレス</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-teal-400 transition-colors"
                placeholder="email@example.com"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">パスワード</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-teal-400 transition-colors"
                placeholder="パスワード"
              />
            </div>

            {error && <p className="text-red-500 text-xs">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-teal-500 hover:bg-teal-600 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              {loading ? "ログイン中..." : "ログイン"}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400">または</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <button
            onClick={handleGoogleLogin}
            className="w-full py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Googleでログイン
          </button>

          <p className="text-center text-sm text-gray-400 mt-6">
            アカウントをお持ちでない方は{" "}
            <Link href="/auth/signup" className="text-teal-600 hover:underline">
              新規登録
            </Link>
          </p>

          <div className="mt-6 pt-6 border-t border-gray-100">
            {!showReset && (
              <button
                onClick={() => setShowReset(true)}
                className="w-full text-sm text-gray-400 hover:text-teal-600 transition-colors text-center"
              >
                パスワードをお忘れの場合
              </button>
            )}
            {showReset && !resetSent && (
              <form onSubmit={handleResetPassword} className="space-y-3">
                <p className="text-sm font-semibold text-gray-700">パスワード再設定メールを送信</p>
                <p className="text-xs text-gray-400">登録済みのメールアドレスを入力してください。</p>
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="email@example.com"
                  required
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-teal-400 transition-colors"
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="flex-1 py-2.5 bg-teal-500 hover:bg-teal-600 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    {resetLoading ? "送信中..." : "再設定メールを送る"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowReset(false)}
                    className="px-4 py-2.5 border border-gray-200 text-gray-400 text-sm rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    キャンセル
                  </button>
                </div>
              </form>
            )}
            {resetSent && (
              <div className="bg-teal-50 border border-teal-200 rounded-lg p-3 text-center">
                <p className="text-sm font-semibold text-teal-700">✓ 再設定メールを送信しました</p>
                <p className="text-xs text-teal-600 mt-1">メール内のリンクからパスワードを再設定してください。</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
