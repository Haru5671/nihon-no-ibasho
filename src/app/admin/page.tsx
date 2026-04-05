import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import AdminLogout from './AdminLogout';

export const dynamic = 'force-dynamic';

const TOPICS = ['なんでも', '仕事', '人間関係', '恋愛', '家族', '将来', '健康', '趣味'];

function adminDb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

async function getStats() {
  const db = adminDb();

  const [postsResult, repliesResult] = await Promise.all([
    db.from('posts').select('id, body, topic, likes, created_at, name'),
    db.from('replies').select('id, post_id, created_at'),
  ]);

  const posts = postsResult.data ?? [];
  const replies = repliesResult.data ?? [];

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const postsToday = posts.filter((p) => new Date(p.created_at) >= today).length;
  const totalLikes = posts.reduce((sum: number, p) => sum + (p.likes ?? 0), 0);

  // Posts per topic
  const topicCounts: Record<string, number> = {};
  for (const topic of TOPICS) topicCounts[topic] = 0;
  for (const p of posts) {
    if (topicCounts[p.topic] !== undefined) topicCounts[p.topic]++;
    else topicCounts[p.topic] = (topicCounts[p.topic] ?? 0) + 1;
  }

  // Daily post counts (last 7 days)
  const dailyCounts: { label: string; count: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
    const next = new Date(d.getTime() + 24 * 60 * 60 * 1000);
    const count = posts.filter((p) => {
      const t = new Date(p.created_at);
      return t >= d && t < next;
    }).length;
    dailyCounts.push({ label: `${d.getMonth() + 1}/${d.getDate()}`, count });
  }

  // Reply counts per post
  const repliesPerPost: Record<string, number> = {};
  for (const r of replies) {
    repliesPerPost[r.post_id] = (repliesPerPost[r.post_id] ?? 0) + 1;
  }

  // Recent posts with reply count
  const recentPosts = posts
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 50)
    .map((p) => ({ ...p, replyCount: repliesPerPost[p.id] ?? 0 }));

  const maxDaily = Math.max(...dailyCounts.map((d) => d.count), 1);

  return {
    totalPosts: posts.length,
    totalReplies: replies.length,
    postsToday,
    totalLikes,
    topicCounts,
    dailyCounts,
    maxDaily,
    recentPosts,
  };
}

export default async function AdminPage() {
  const stats = await getStats();

  return (
    <div className="min-h-screen bg-[#f0f4f8]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div>
          <p className="font-bold text-gray-900">管理画面</p>
          <p className="text-xs text-gray-400">にほんのいばしょ</p>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/" className="text-xs text-teal-600 hover:underline">サイトを見る</Link>
          <AdminLogout />
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">

        {/* Summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: '総投稿数', value: stats.totalPosts, color: 'text-teal-600' },
            { label: '総返信数', value: stats.totalReplies, color: 'text-blue-600' },
            { label: '今日の投稿', value: stats.postsToday, color: 'text-purple-600' },
            { label: '総いいね数', value: stats.totalLikes, color: 'text-rose-500' },
          ].map((card) => (
            <div key={card.label} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <p className="text-xs text-gray-400 mb-1">{card.label}</p>
              <p className={`text-3xl font-bold ${card.color}`}>{card.value}</p>
            </div>
          ))}
        </div>

        {/* Daily chart + topic breakdown */}
        <div className="grid sm:grid-cols-2 gap-6">
          {/* Daily posts (last 7 days) */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <p className="text-sm font-semibold text-gray-700 mb-4">投稿数（直近7日間）</p>
            <div className="flex items-end gap-2 h-28">
              {stats.dailyCounts.map((d) => (
                <div key={d.label} className="flex flex-col items-center flex-1 gap-1">
                  <span className="text-[10px] text-gray-500">{d.count}</span>
                  <div
                    className="w-full bg-teal-400 rounded-t"
                    style={{ height: `${Math.max((d.count / stats.maxDaily) * 80, d.count > 0 ? 4 : 0)}px` }}
                  />
                  <span className="text-[9px] text-gray-400">{d.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Topic breakdown */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <p className="text-sm font-semibold text-gray-700 mb-4">トピック別投稿数</p>
            <div className="space-y-2">
              {Object.entries(stats.topicCounts)
                .sort((a, b) => b[1] - a[1])
                .map(([topic, count]) => (
                  <div key={topic} className="flex items-center gap-2">
                    <span className="text-[12px] text-gray-600 w-20 shrink-0">{topic}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-2 bg-teal-400 rounded-full"
                        style={{ width: `${stats.totalPosts > 0 ? (count / stats.totalPosts) * 100 : 0}%` }}
                      />
                    </div>
                    <span className="text-[11px] text-gray-400 w-5 text-right">{count}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Posts list */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-700">投稿一覧（最新50件）</p>
          </div>
          <div className="divide-y divide-gray-100">
            {stats.recentPosts.map((post) => (
              <div key={post.id} className="px-5 py-3 hover:bg-gray-50 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">{post.topic}</span>
                      <span className="text-[10px] text-gray-400">
                        {new Date(post.created_at).toLocaleString('ja-JP', {
                          month: 'numeric', day: 'numeric',
                          hour: '2-digit', minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="text-[13px] text-gray-700 line-clamp-2 leading-relaxed">{post.body}</p>
                  </div>
                  <div className="shrink-0 flex flex-col items-end gap-1 text-[10px] text-gray-400">
                    <span>♡ {post.likes ?? 0}</span>
                    <span>返信 {post.replyCount}</span>
                    <Link
                      href={`/posts/${post.id}`}
                      target="_blank"
                      className="text-teal-500 hover:underline"
                    >
                      表示
                    </Link>
                  </div>
                </div>
              </div>
            ))}
            {stats.recentPosts.length === 0 && (
              <p className="px-5 py-8 text-center text-gray-400 text-sm">投稿がありません</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
