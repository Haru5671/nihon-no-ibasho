"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Header from "@/components/Header";
import { timeAgo } from "@/lib/utils";

interface PostRow {
  id: string;
  body: string;
  topic: string;
  likes: number;
  created_at: string;
  replies: { count: number }[];
}

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

type TabId = 'saved' | 'myposts' | 'commented';

export default function MyPage() {
  const supabase = createClient();
  const router = useRouter();
  const [user, setUser] = useState<{ id: string; email?: string; name?: string } | null>(null);
  const [saved, setSaved] = useState<SavedPost[]>([]);
  const [myPosts, setMyPosts] = useState<PostRow[]>([]);
  const [commented, setCommented] = useState<PostRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabId>('saved');
  const [searchQuery, setSearchQuery] = useState("");
  const [emailForm, setEmailForm] = useState({ email: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const u = data.user;
      if (!u) { setLoading(false); return; }
      const name = u.user_metadata?.display_name ?? u.user_metadata?.full_name ?? u.email?.split('@')[0] ?? '';
      setUser({ id: u.id, email: u.email, name });
      loadUserData(u.id);
    });
  }, []);

  const loadUserData = async (uid: string) => {
    const [savedRes, postsRes, commentedRes] = await Promise.all([
      supabase
        .from('saved_posts')
        .select('id, post_id, created_at, posts(id, body, topic, likes, created_at)')
        .eq('user_id', uid)
        .order('created_at', { ascending: false }),
      fetch('/api/user/posts').then((r) => r.ok ? r.json() : []),
      fetch('/api/user/commented').then((r) => r.ok ? r.json() : []),
    ]);
    setSaved((savedRes.data ?? []) as unknown as SavedPost[]);
    setMyPosts(Array.isArray(postsRes) ? postsRes : []);
    setCommented(Array.isArray(commentedRes) ? commentedRes : []);
    setLoading(false);
  };

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

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: emailForm.email,
      password: emailForm.password,
    });
    setLoginLoading(false);
    if (error) { setLoginError('メールアドレスまたはパスワードが正しくありません'); return; }
    if (data.user) {
      const u = data.user;
      const name = u.user_metadata?.display_name ?? u.user_metadata?.full_name ?? u.email?.split('@')[0] ?? '';
      setUser({ id: u.id, email: u.email, name });
      setLoading(true);
      loadUserData(u.id);
    }
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

  const logout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const handleDeleteAccount = async () => {
    if (!deleteConfirm) { setDeleteConfirm(true); return; }
    setDeleteLoading(true);
    const res = await fetch('/api/user/delete', { method: 'DELETE' });
    if (res.ok) {
      await supabase.auth.signOut();
      router.push('/');
    } else {
      setDeleteLoading(false);
      setDeleteConfirm(false);
      alert('退会処理に失敗しました。しばらく経ってから再試行してください。');
    }
  };

  const tabs: { id: TabId; label: string; count: number }[] = [
    { id: 'saved', label: '保存した投稿', count: saved.length },
    { id: 'myposts', label: '自分の投稿', count: myPosts.length },
    { id: 'commented', label: 'コメントした投稿', count: commented.length },
  ];

  const PostCard = ({ post, onUnsave, savedId }: { post: PostRow | SavedPost['posts']; onUnsave?: () => void; savedId?: number }) => {
    if (!post) return <p className="text-[12px] text-gray-400">削除された投稿</p>;
    const replyCount = 'replies' in post ? (post as PostRow).replies?.[0]?.count ?? 0 : 0;
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-4 hover:border-teal-200 transition-colors">
        <div className="flex items-start justify-between gap-2 mb-2">
          <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded">{post.topic}</span>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-gray-400">{timeAgo(post.created_at)}</span>
            {onUnsave && savedId && (
              <button onClick={() => onUnsave()} className="text-[10px] text-gray-300 hover:text-red-400 transition-colors">削除</button>
            )}
          </div>
        </div>
        <Link href={`/posts/${post.id}`}>
          <p className="text-[13px] text-gray-700 leading-relaxed line-clamp-3 hover:text-teal-700 transition-colors">{post.body}</p>
        </Link>
        <div className="text-[10px] text-gray-400 mt-2 flex items-center gap-3">
          <span>♥ {post.likes}</span>
          {replyCount > 0 && <span>💬 {replyCount}</span>}
        </div>
      </div>
    );
  };

  return (
    <>
      <Header searchQuery={searchQuery} onSearch={setSearchQuery} />
      <main className="bg-[#f8fafb] min-h-screen pt-24 pb-12 px-4">
        <div className="max-w-xl mx-auto">

          <div className="flex items-center justify-between mb-6">
            <h1 className="text-[20px] font-bold text-gray-800">マイページ</h1>
            <Link href="/" className="text-[12px] text-teal-600 hover:underline">← 広場へ</Link>
          </div>

          {/* Not logged in */}
          {!loading && !user && (
            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <div className="text-center mb-5">
                <div className="text-4xl mb-3">🔖</div>
                <h2 className="text-[16px] font-bold text-gray-800 mb-2">ログインしてマイページを使う</h2>
                <p className="text-[12px] text-gray-500 leading-relaxed">気になった投稿を保存して後で見返せます。</p>
              </div>

              <form onSubmit={handleEmailLogin} className="space-y-2 mb-4">
                <input
                  type="email"
                  value={emailForm.email}
                  onChange={(e) => setEmailForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="メールアドレス"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-[13px] outline-none focus:border-teal-400 transition-colors"
                  required
                />
                <input
                  type="password"
                  value={emailForm.password}
                  onChange={(e) => setEmailForm((f) => ({ ...f, password: e.target.value }))}
                  placeholder="パスワード"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-[13px] outline-none focus:border-teal-400 transition-colors"
                  required
                />
                {loginError && <p className="text-[11px] text-red-500">{loginError}</p>}
                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-[13px] font-bold rounded-xl transition-colors disabled:opacity-40"
                >
                  {loginLoading ? 'ログイン中...' : 'ログイン'}
                </button>
              </form>

              <div className="flex items-center gap-2 mb-4">
                <div className="flex-1 h-px bg-gray-100" />
                <span className="text-[11px] text-gray-400">または</span>
                <div className="flex-1 h-px bg-gray-100" />
              </div>

              <button
                onClick={loginWithGoogle}
                className="w-full py-2.5 border border-gray-200 rounded-xl text-[13px] text-gray-600 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 mb-3"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Googleでログイン
              </button>

              <p className="text-center text-[12px] text-gray-400">
                アカウントをお持ちでない方は
                <a href="/auth/signup" className="text-teal-600 hover:underline ml-1">新規登録</a>
              </p>

              {/* Password reset */}
              <div className="mt-5 pt-5 border-t border-gray-100">
                {!showReset && (
                  <button
                    onClick={() => setShowReset(true)}
                    className="w-full text-[12px] text-gray-400 hover:text-teal-600 transition-colors text-center"
                  >
                    パスワードをお忘れの場合
                  </button>
                )}
                {showReset && !resetSent && (
                  <form onSubmit={handleResetPassword} className="space-y-2">
                    <p className="text-[12px] text-gray-600 font-semibold">パスワード再設定メールを送信</p>
                    <p className="text-[11px] text-gray-400">登録済みのメールアドレスを入力してください。再設定用のリンクをお送りします。</p>
                    <input
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="email@example.com"
                      required
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-[13px] outline-none focus:border-teal-400 transition-colors"
                    />
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={resetLoading}
                        className="flex-1 py-2 bg-teal-600 hover:bg-teal-700 text-white text-[12px] font-bold rounded-xl transition-colors disabled:opacity-40"
                      >
                        {resetLoading ? '送信中...' : '再設定メールを送る'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowReset(false)}
                        className="px-4 py-2 border border-gray-200 text-gray-400 text-[12px] rounded-xl hover:bg-gray-50 transition-colors"
                      >
                        キャンセル
                      </button>
                    </div>
                  </form>
                )}
                {resetSent && (
                  <div className="bg-teal-50 border border-teal-200 rounded-xl p-3 text-center">
                    <p className="text-[12px] text-teal-700 font-semibold">✓ 再設定メールを送信しました</p>
                    <p className="text-[11px] text-teal-600 mt-1">メール内のリンクからパスワードを再設定してください。</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {loading && (
            <div className="text-center py-12 text-gray-400 text-[13px]">読み込み中...</div>
          )}

          {/* Logged in */}
          {!loading && user && (
            <>
              {/* User info card */}
              <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-4 flex items-center justify-between">
                <div>
                  <div className="text-[13px] font-semibold text-gray-700">{user.name || user.email || 'ログイン済み'}</div>
                  <div className="text-[11px] text-gray-400 mt-0.5">{user.email}</div>
                </div>
                <button
                  onClick={logout}
                  className="text-[12px] text-gray-400 hover:text-gray-600 border border-gray-200 px-3 py-1.5 rounded-lg transition-colors"
                >
                  ログアウト
                </button>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-gray-200 mb-4 bg-white rounded-t-xl overflow-hidden">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 py-3 text-[12px] font-semibold transition-colors border-b-2 ${
                      activeTab === tab.id
                        ? 'text-teal-600 border-teal-600'
                        : 'text-gray-400 border-transparent hover:text-gray-600'
                    }`}
                  >
                    {tab.label}
                    {tab.count > 0 && (
                      <span className="ml-1 text-[10px] text-gray-400">({tab.count})</span>
                    )}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              <div className="space-y-2">
                {activeTab === 'saved' && (
                  <>
                    {saved.length === 0 && (
                      <div className="bg-white rounded-xl border border-gray-200 p-6 text-center text-gray-400 text-[13px]">
                        まだ保存した投稿がありません。<br />投稿の 🔖 ボタンから保存できます。
                      </div>
                    )}
                    {saved.map((s) => (
                      <PostCard
                        key={s.id}
                        post={s.posts as unknown as PostRow}
                        onUnsave={() => unsave(s.id)}
                        savedId={s.id}
                      />
                    ))}
                  </>
                )}

                {activeTab === 'myposts' && (
                  <>
                    {myPosts.length === 0 && (
                      <div className="bg-white rounded-xl border border-gray-200 p-6 text-center text-gray-400 text-[13px]">
                        ログイン後に投稿した記事がここに表示されます。
                      </div>
                    )}
                    {myPosts.map((p) => (
                      <PostCard key={p.id} post={p} />
                    ))}
                  </>
                )}

                {activeTab === 'commented' && (
                  <>
                    {commented.length === 0 && (
                      <div className="bg-white rounded-xl border border-gray-200 p-6 text-center text-gray-400 text-[13px]">
                        コメントした投稿がここに表示されます。
                      </div>
                    )}
                    {commented.map((p) => (
                      <PostCard key={p.id} post={p} />
                    ))}
                  </>
                )}
              </div>

              {/* Withdrawal section */}
              <div className="mt-12 pt-6 border-t border-gray-100">
                <p className="text-[11px] text-gray-400 mb-2">アカウント管理</p>
                {!deleteConfirm ? (
                  <button
                    onClick={() => setDeleteConfirm(true)}
                    className="text-[11px] text-gray-400 hover:text-red-500 transition-colors underline"
                  >
                    退会する
                  </button>
                ) : (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <p className="text-[13px] font-bold text-red-700 mb-1">本当に退会しますか？</p>
                    <p className="text-[11px] text-red-600 mb-3">保存データはすべて削除されます。この操作は取り消せません。</p>
                    <div className="flex gap-2">
                      <button
                        onClick={handleDeleteAccount}
                        disabled={deleteLoading}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-[12px] font-bold rounded-lg transition-colors disabled:opacity-40"
                      >
                        {deleteLoading ? '処理中...' : '退会する'}
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(false)}
                        className="px-4 py-2 border border-gray-200 text-gray-500 text-[12px] rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        キャンセル
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </main>
    </>
  );
}
