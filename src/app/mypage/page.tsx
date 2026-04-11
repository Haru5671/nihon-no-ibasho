"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import Header from "@/components/Header";

interface SavedPost {
  id: number;
  post_id: number;
  created_at: string;
  posts: {
    id: number;
    body: string;
    topic: string;
    likes: number;
    created_at: string;
  } | null;
}

export default function MyPage() {
  const supabase = createClient();
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [saved, setSaved] = useState<SavedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const u = data.user;
      if (!u) {
        setLoading(false);
        return;
      }
      setUser({ id: u.id, email: u.email });
      supabase
        .from('saved_posts')
        .select('id, post_id, created_at, posts(id, body, topic, likes, created_at)')
        .eq('user_id', u.id)
        .order('created_at', { ascending: false })
        .then(({ data: rows }) => {
          setSaved((rows ?? []) as unknown as SavedPost[]);
          setLoading(false);
        });
    });
  }, []);

  const unsave = async (savedId: number) => {
    await supabase.from('saved_posts').delete().eq('id', savedId);
    setSaved((prev) => prev.filter((s) => s.id !== savedId));
  };

  const loginWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback?next=/mypage` },
    });
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSaved([]);
  };

  return (
    <>
      <Header searchQuery={searchQuery} onSearch={setSearchQuery} />
      <main className="bg-[#f8fafb] min-h-screen pt-24 pb-12 px-4">
        <div className="max-w-xl mx-auto">

          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-[20px] font-bold text-gray-800">マイページ</h1>
            <Link href="/" className="text-[12px] text-teal-600 hover:underline">← 広場へ</Link>
          </div>

          {/* Not logged in */}
          {!loading && !user && (
            <div className="bg-white rounded-2xl p-8 text-center border border-gray-200">
              <div className="text-4xl mb-3">🔖</div>
              <h2 className="text-[16px] font-bold text-gray-800 mb-2">ログインしてマイページを使う</h2>
              <p className="text-[12px] text-gray-500 mb-5 leading-relaxed">
                気になった投稿を保存して後で見返せます。<br />
                Googleアカウントで無料で利用できます。
              </p>
              <button
                onClick={loginWithGoogle}
                className="w-full max-w-xs mx-auto py-2.5 border border-gray-200 rounded-xl text-[13px] text-gray-600 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Googleでログイン
              </button>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="text-center py-12 text-gray-400 text-[13px]">読み込み中...</div>
          )}

          {/* Logged in */}
          {!loading && user && (
            <>
              {/* User info */}
              <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-4 flex items-center justify-between">
                <div>
                  <div className="text-[13px] font-semibold text-gray-700">{user.email ?? 'ログイン済み'}</div>
                  <div className="text-[11px] text-gray-400 mt-0.5">保存済み {saved.length}件</div>
                </div>
                <button
                  onClick={logout}
                  className="text-[12px] text-gray-400 hover:text-gray-600 border border-gray-200 px-3 py-1.5 rounded-lg transition-colors"
                >
                  ログアウト
                </button>
              </div>

              {/* Saved posts */}
              <div className="space-y-2">
                <h2 className="text-[13px] font-bold text-gray-600 mb-3">保存した投稿</h2>
                {saved.length === 0 && (
                  <div className="bg-white rounded-xl border border-gray-200 p-6 text-center text-gray-400 text-[13px]">
                    まだ保存した投稿がありません。<br />
                    投稿の 🔖 ボタンから保存できます。
                  </div>
                )}
                {saved.map((s) => (
                  <div key={s.id} className="bg-white rounded-xl border border-gray-200 p-4 hover:border-teal-200 transition-colors">
                    {s.posts ? (
                      <>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded">{s.posts.topic}</span>
                          <button
                            onClick={() => unsave(s.id)}
                            className="text-[10px] text-gray-300 hover:text-red-400 transition-colors shrink-0"
                          >
                            削除
                          </button>
                        </div>
                        <Link href={`/posts/${s.posts.id}`}>
                          <p className="text-[13px] text-gray-700 leading-relaxed line-clamp-3 hover:text-teal-700 transition-colors">{s.posts.body}</p>
                        </Link>
                        <div className="text-[10px] text-gray-400 mt-2">
                          ♥ {s.posts.likes} · {new Date(s.posts.created_at).toLocaleDateString('ja-JP')}
                        </div>
                      </>
                    ) : (
                      <p className="text-[12px] text-gray-400">削除された投稿</p>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </main>
    </>
  );
}
