"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Header from "@/components/Header";

export default function UpdatePasswordPage() {
  const supabase = createClient();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Supabase puts the session tokens in the URL hash after redirect
    supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setReady(true);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { setError("パスワードが一致しません"); return; }
    if (password.length < 8) { setError("パスワードは8文字以上で入力してください"); return; }
    setError("");
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) { setError(error.message); return; }
    setDone(true);
    setTimeout(() => router.push("/mypage"), 2500);
  };

  return (
    <>
      <Header />
      <main className="bg-[#f8fafb] min-h-screen pt-24 pb-12 px-4">
        <div className="max-w-sm mx-auto">
          <div className="text-center mb-8">
            <div className="text-4xl mb-3">🔑</div>
            <h1 className="text-[20px] font-bold text-gray-800">パスワードの再設定</h1>
            <p className="text-[12px] text-gray-400 mt-2">にほんのいばしょ — パスワード再設定</p>
          </div>

          {done ? (
            <div className="bg-teal-50 border border-teal-200 rounded-2xl p-6 text-center">
              <p className="text-[14px] font-bold text-teal-700 mb-1">✓ パスワードを更新しました</p>
              <p className="text-[12px] text-teal-600">マイページに移動します...</p>
            </div>
          ) : !ready ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-6 text-center">
              <p className="text-[13px] text-gray-500">リンクを確認中...</p>
              <p className="text-[11px] text-gray-400 mt-2">
                メール内のリンクからこのページを開いてください。
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
              <div>
                <label className="block text-[12px] text-gray-600 mb-1.5 font-semibold">新しいパスワード</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  placeholder="8文字以上"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-[13px] outline-none focus:border-teal-400 transition-colors"
                />
              </div>
              <div>
                <label className="block text-[12px] text-gray-600 mb-1.5 font-semibold">新しいパスワード（確認）</label>
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  placeholder="もう一度入力"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-[13px] outline-none focus:border-teal-400 transition-colors"
                />
              </div>
              {error && <p className="text-[12px] text-red-500">{error}</p>}
              <button
                type="submit"
                disabled={loading || !password || !confirm}
                className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-[13px] font-bold rounded-xl transition-colors disabled:opacity-40"
              >
                {loading ? "更新中..." : "パスワードを更新する"}
              </button>
            </form>
          )}
        </div>
      </main>
    </>
  );
}
