import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import AdminLogout from './AdminLogout';
import { AI_BODIES } from '@/data/aiPosts';

export const dynamic = 'force-dynamic';

const TOPICS = ['なんでも', '仕事・AI', '孤独・さみしさ', '眠れない・不安', '家族・人間関係', '恋愛・パートナー', '体・こころ'];

// Supabase PostgREST の max-rows 制限（デフォルト1000）を超えて全件取得するためのヘルパ
// Supabase の QueryBuilder は PromiseLike（thenable）なので Promise 型ではなく
// PromiseLike で受ける。
type PageResult<T> = { data: T[] | null; error: unknown };
async function fetchAllRows<T>(
  query: (from: number, to: number) => PromiseLike<PageResult<T>>,
  pageSize = 1000,
): Promise<T[]> {
  const all: T[] = [];
  let from = 0;
  while (true) {
    const to = from + pageSize - 1;
    const { data } = await query(from, to);
    if (!data || data.length === 0) break;
    all.push(...data);
    if (data.length < pageSize) break;
    from += pageSize;
  }
  return all;
}

function adminDb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

async function getStats() {
  const db = adminDb();

  // JST基準の「今日」を計算（UTC+9）
  const JST = 9 * 60 * 60 * 1000;
  const nowJST = new Date(Date.now() + JST);
  // JSTの今日0時をUTCに変換
  const todayJST = new Date(
    Date.UTC(nowJST.getUTCFullYear(), nowJST.getUTCMonth(), nowJST.getUTCDate()) - JST
  );
  const fourteenDaysAgo = new Date(todayJST.getTime() - 13 * 24 * 60 * 60 * 1000);

  // posts/replies はページングで全件取得（PostgREST の1000件上限を回避）
  const [postsAll, repliesAll, pvCountRes, pvRecentRes, pvAllHashRes] = await Promise.all([
    fetchAllRows<{ id: string; body: string; topic: string; likes: number | null; created_at: string; name: string; user_id: string | null }>(
      (from, to) => db.from('posts').select('id, body, topic, likes, created_at, name, user_id').order('created_at', { ascending: false }).range(from, to)
    ),
    fetchAllRows<{ id: string; post_id: string; created_at: string; user_id: string | null }>(
      (from, to) => db.from('replies').select('id, post_id, created_at, user_id').range(from, to)
    ),
    // totalPVはカウントのみ取得（行データ不要 → 1000件上限を回避）
    db.from('page_views').select('*', { count: 'exact', head: true }),
    // チャート・流入元・デバイス用に直近14日分のみ取得
    db.from('page_views')
      .select('id, path, ip_hash, referrer, ua, created_at')
      .gte('created_at', fourteenDaysAgo.toISOString())
      .limit(20000),
    // 全期間のユニークユーザー数算出用（ip_hashのみ）
    db.from('page_views').select('ip_hash').limit(100000),
  ]);

  const posts = postsAll;
  const replies = repliesAll;
  const pvRows = (pvRecentRes.data ?? []) as { id: string; path: string; ip_hash: string; referrer: string | null; ua: string | null; created_at: string }[];

  // Referrer breakdown
  const referrerCounts: Record<string, number> = {};
  for (const r of pvRows) {
    const ref = r.referrer;
    let label = '直接アクセス';
    if (ref) {
      try {
        const host = new URL(ref).hostname.replace('www.', '');
        if (host.includes('google')) label = 'Google';
        else if (host.includes('yahoo')) label = 'Yahoo';
        else if (host.includes('bing')) label = 'Bing';
        else if (host.includes('twitter') || host.includes('x.com')) label = 'X (Twitter)';
        else if (host.includes('instagram')) label = 'Instagram';
        else if (host.includes('tiktok')) label = 'TikTok';
        else if (host.includes('line')) label = 'LINE';
        else if (host.includes('facebook')) label = 'Facebook';
        else label = host;
      } catch { label = '直接アクセス'; }
    }
    referrerCounts[label] = (referrerCounts[label] ?? 0) + 1;
  }
  const topReferrers = Object.entries(referrerCounts).sort((a, b) => b[1] - a[1]).slice(0, 8);

  // Device breakdown
  const deviceCounts = { スマホ: 0, PC: 0, タブレット: 0, 不明: 0 };
  for (const r of pvRows) {
    const ua = r.ua ?? '';
    if (/iPad|Tablet/i.test(ua)) deviceCounts['タブレット']++;
    else if (/iPhone|Android|Mobile/i.test(ua)) deviceCounts['スマホ']++;
    else if (ua) deviceCounts['PC']++;
    else deviceCounts['不明']++;
  }

  // AI判定: autopost cron が投稿する本文のマスターリスト(AI_BODIES)と照合。
  // 以前は name === 'にんげんさん' で判定していたが、これはニックネーム未設定時の
  // 人間のデフォルト名でもあるため、一般ユーザーの投稿がAIとして誤集計されていた。
  const isAIPost = (p: { body: string }) => AI_BODIES.has(p.body);
  const humanPosts = posts.filter((p) => !isAIPost(p));
  const aiPosts = posts.filter((p) => isAIPost(p));
  const aiPostIds = new Set(aiPosts.map((p) => p.id));

  const postsToday = posts.filter((p) => new Date(p.created_at) >= todayJST).length;
  const humanPostsToday = humanPosts.filter((p) => new Date(p.created_at) >= todayJST).length;

  // 投稿主体別のいいね・返信集計
  const humanLikes = humanPosts.reduce((sum: number, p) => sum + (p.likes ?? 0), 0);
  const aiLikes = aiPosts.reduce((sum: number, p) => sum + (p.likes ?? 0), 0);
  // 返信はすべて人間（AI返信の生成処理は存在しない）
  const repliesOnHumanPosts = replies.filter((r) => !aiPostIds.has(r.post_id)).length;
  const repliesOnAIPosts = replies.filter((r) => aiPostIds.has(r.post_id)).length;
  const repliesToday = replies.filter((r) => new Date(r.created_at) >= todayJST).length;

  // PV stats（totalPVはカウントAPIから取得）
  const totalPV = pvCountRes.count ?? 0;
  const uniqueUsers = new Set((pvAllHashRes.data ?? []).map((r: { ip_hash: string }) => r.ip_hash)).size;
  const pvToday = pvRows.filter((r) => new Date(r.created_at) >= todayJST).length;
  const uvToday = new Set(
    pvRows.filter((r) => new Date(r.created_at) >= todayJST).map((r) => r.ip_hash)
  ).size;

  // Top pages（直近14日）
  const pageCounts: Record<string, number> = {};
  for (const r of pvRows) {
    pageCounts[r.path] = (pageCounts[r.path] ?? 0) + 1;
  }
  const topPages = Object.entries(pageCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  // Daily stats (last 14 days, JST基準) — 人間とAIを分けて表示
  const dailyStats: { label: string; humanPosts: number; aiPosts: number; pv: number; uv: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(todayJST.getTime() - i * 24 * 60 * 60 * 1000);
    const next = new Date(d.getTime() + 24 * 60 * 60 * 1000);
    // ラベルはJST日付で表示
    const dJST = new Date(d.getTime() + JST);
    const inRange = (t: Date) => t >= d && t < next;
    const dayHumanPosts = humanPosts.filter((p) => inRange(new Date(p.created_at))).length;
    const dayAIPosts = aiPosts.filter((p) => inRange(new Date(p.created_at))).length;
    const dayPV = pvRows.filter((r) => inRange(new Date(r.created_at)));
    dailyStats.push({
      label: `${dJST.getUTCMonth() + 1}/${dJST.getUTCDate()}`,
      humanPosts: dayHumanPosts,
      aiPosts: dayAIPosts,
      pv: dayPV.length,
      uv: new Set(dayPV.map((r) => r.ip_hash)).size,
    });
  }

  // Topic counts
  const topicCounts: Record<string, number> = {};
  for (const topic of TOPICS) topicCounts[topic] = 0;
  for (const p of posts) {
    topicCounts[p.topic] = (topicCounts[p.topic] ?? 0) + 1;
  }

  // Reply counts per post
  const repliesPerPost: Record<string, number> = {};
  for (const r of replies) {
    repliesPerPost[r.post_id] = (repliesPerPost[r.post_id] ?? 0) + 1;
  }

  const decorated = posts
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .map((p) => ({ ...p, replyCount: repliesPerPost[p.id] ?? 0, isAI: isAIPost(p) }));
  const recentPosts = decorated.slice(0, 50);
  const recentHumanPosts = decorated.filter((p) => !p.isAI).slice(0, 50);
  const recentAIPosts = decorated.filter((p) => p.isAI).slice(0, 50);

  const maxPV = Math.max(...dailyStats.map((d) => d.pv), 1);
  const maxPosts = Math.max(...dailyStats.map((d) => d.humanPosts + d.aiPosts), 1);

  return {
    totalPosts: posts.length,
    humanPostCount: humanPosts.length,
    aiPostCount: aiPosts.length,
    totalReplies: replies.length,
    repliesOnHumanPosts,
    repliesOnAIPosts,
    repliesToday,
    postsToday,
    humanPostsToday,
    humanLikes,
    aiLikes,
    totalPV,
    uniqueUsers,
    pvToday,
    uvToday,
    topPages,
    dailyStats,
    maxPV,
    maxPosts,
    topicCounts,
    recentPosts,
    recentHumanPosts,
    recentAIPosts,
    topReferrers,
    deviceCounts,
  };
}

type ViewTab = 'all' | 'human' | 'ai';

export default async function AdminPage({ searchParams }: { searchParams?: { view?: string } }) {
  const rawView = searchParams?.view;
  const view: ViewTab = rawView === 'human' || rawView === 'ai' ? rawView : 'all';
  const s = await getStats();
  const now = new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' });

  const summaryCards = [
    { label: 'TOTAL PV', value: s.totalPV.toLocaleString(), sub: `今日 ${s.pvToday}`, color: '#00d4ff' },
    { label: 'UNIQUE USERS', value: s.uniqueUsers.toLocaleString(), sub: `今日 ${s.uvToday}`, color: '#39d353' },
    { label: 'POSTS (人間)', value: s.humanPostCount.toLocaleString(), sub: `AI: ${s.aiPostCount} / 今日(人間): ${s.humanPostsToday}`, color: '#39d353' },
    { label: 'REPLIES', value: s.totalReplies.toLocaleString(), sub: `人間投稿への返信: ${s.repliesOnHumanPosts} / 今日: ${s.repliesToday}`, color: '#fb923c' },
    { label: 'LIKES (人間)', value: s.humanLikes.toLocaleString(), sub: `AI投稿: ${s.aiLikes}`, color: '#f472b6' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#0d1117', color: '#e6edf3', fontFamily: "'Geist Mono', 'Fira Code', 'Consolas', monospace" }}>

      {/* Header */}
      <div style={{ borderBottom: '1px solid #21262d', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#161b22' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ color: '#39d353', fontSize: '13px', fontWeight: 700, letterSpacing: '0.1em' }}>◆ IBASHO ADMIN</span>
          <span style={{ color: '#484f58', fontSize: '11px' }}>dashboard v2</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ color: '#484f58', fontSize: '11px' }}>{now}</span>
          <Link href="/" style={{ color: '#00d4ff', fontSize: '11px', textDecoration: 'none' }}>← サイトへ</Link>
          <AdminLogout />
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>

        {/* Summary cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px', marginBottom: '24px' }}>
          {summaryCards.map((c) => (
            <div key={c.label} style={{ background: '#161b22', border: '1px solid #21262d', borderRadius: '6px', padding: '16px 20px' }}>
              <div style={{ fontSize: '10px', color: '#484f58', letterSpacing: '0.12em', marginBottom: '6px' }}>{c.label}</div>
              <div style={{ fontSize: '26px', fontWeight: 700, color: c.color, lineHeight: 1, marginBottom: '4px' }}>{c.value}</div>
              {c.sub && <div style={{ fontSize: '10px', color: '#6e7681' }}>{c.sub}</div>}
            </div>
          ))}
        </div>

        {/* PV chart + Posts chart (separate, side by side) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>

          {/* PV chart */}
          <div style={{ background: '#161b22', border: '1px solid #21262d', borderRadius: '6px', padding: '20px' }}>
            <div style={{ fontSize: '11px', color: '#484f58', letterSpacing: '0.1em', marginBottom: '4px' }}>PAGE VIEWS — LAST 14 DAYS</div>
            <div style={{ fontSize: '10px', color: '#6e7681', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ display: 'inline-block', width: '8px', height: '8px', background: '#00d4ff', borderRadius: '2px' }} />PV
              <span style={{ display: 'inline-block', width: '8px', height: '8px', background: '#39d353', borderRadius: '2px', marginLeft: '4px' }} />UV
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '80px' }}>
              {s.dailyStats.map((d) => (
                <div key={d.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                  <div style={{ width: '100%', display: 'flex', alignItems: 'flex-end', gap: '1px', height: '64px' }}>
                    <div style={{ flex: 1, background: '#00d4ff66', borderRadius: '2px 2px 0 0', height: `${Math.max((d.pv / s.maxPV) * 64, d.pv > 0 ? 2 : 0)}px` }} />
                    <div style={{ flex: 1, background: '#39d353', borderRadius: '2px 2px 0 0', height: `${Math.max((d.uv / s.maxPV) * 64, d.uv > 0 ? 2 : 0)}px` }} />
                  </div>
                  <span style={{ fontSize: '8px', color: '#484f58', whiteSpace: 'nowrap' }}>{d.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Posts chart — 人間 / AI を積み上げ */}
          <div style={{ background: '#161b22', border: '1px solid #21262d', borderRadius: '6px', padding: '20px' }}>
            <div style={{ fontSize: '11px', color: '#484f58', letterSpacing: '0.1em', marginBottom: '4px' }}>POSTS — LAST 14 DAYS</div>
            <div style={{ fontSize: '10px', color: '#6e7681', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ display: 'inline-block', width: '8px', height: '8px', background: '#39d353', borderRadius: '2px' }} />人間
              <span style={{ display: 'inline-block', width: '8px', height: '8px', background: '#f59e0b', borderRadius: '2px', marginLeft: '4px' }} />AI
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '80px' }}>
              {s.dailyStats.map((d) => {
                const total = d.humanPosts + d.aiPosts;
                const humanH = Math.max((d.humanPosts / s.maxPosts) * 56, d.humanPosts > 0 ? 2 : 0);
                const aiH = Math.max((d.aiPosts / s.maxPosts) * 56, d.aiPosts > 0 ? 2 : 0);
                return (
                  <div key={d.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                    <span style={{ fontSize: '8px', color: '#6e7681' }}>{total > 0 ? total : ''}</span>
                    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                      <div style={{ width: '100%', background: '#f59e0b', height: `${aiH}px`, borderRadius: d.humanPosts === 0 ? '2px 2px 0 0' : '0' }} />
                      <div style={{ width: '100%', background: '#39d353', height: `${humanH}px`, borderRadius: '2px 2px 0 0' }} />
                    </div>
                    <span style={{ fontSize: '8px', color: '#484f58', whiteSpace: 'nowrap' }}>{d.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Top pages + Topic breakdown */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>

          {/* Top pages */}
          <div style={{ background: '#161b22', border: '1px solid #21262d', borderRadius: '6px', padding: '20px' }}>
            <div style={{ fontSize: '11px', color: '#484f58', letterSpacing: '0.1em', marginBottom: '16px' }}>TOP PAGES</div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', color: '#6e7681', fontWeight: 400, paddingBottom: '8px', borderBottom: '1px solid #21262d' }}>PATH</th>
                  <th style={{ textAlign: 'right', color: '#6e7681', fontWeight: 400, paddingBottom: '8px', borderBottom: '1px solid #21262d' }}>PV</th>
                </tr>
              </thead>
              <tbody>
                {s.topPages.map(([path, count], i) => (
                  <tr key={path}>
                    <td style={{ padding: '7px 0', color: '#e6edf3', borderBottom: '1px solid #21262d', fontFamily: 'monospace' }}>
                      <span style={{ color: '#484f58', marginRight: '8px' }}>{String(i + 1).padStart(2, '0')}</span>
                      {path.length > 28 ? path.slice(0, 28) + '…' : path}
                    </td>
                    <td style={{ padding: '7px 0', textAlign: 'right', color: '#00d4ff', borderBottom: '1px solid #21262d' }}>{count}</td>
                  </tr>
                ))}
                {s.topPages.length === 0 && (
                  <tr><td colSpan={2} style={{ padding: '16px 0', color: '#484f58', fontSize: '12px' }}>データなし</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Topic breakdown */}
          <div style={{ background: '#161b22', border: '1px solid #21262d', borderRadius: '6px', padding: '20px' }}>
            <div style={{ fontSize: '11px', color: '#484f58', letterSpacing: '0.1em', marginBottom: '16px' }}>TOPIC BREAKDOWN</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {Object.entries(s.topicCounts)
                .sort((a, b) => b[1] - a[1])
                .map(([topic, count]) => {
                  const pct = s.totalPosts > 0 ? (count / s.totalPosts) * 100 : 0;
                  return (
                    <div key={topic}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontSize: '11px', color: '#8b949e' }}>{topic}</span>
                        <span style={{ fontSize: '11px', color: '#a78bfa' }}>{count}</span>
                      </div>
                      <div style={{ height: '3px', background: '#21262d', borderRadius: '99px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg, #a78bfa, #00d4ff)', borderRadius: '99px' }} />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>

        {/* Referrer + Device */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>

          {/* Referrer */}
          <div style={{ background: '#161b22', border: '1px solid #21262d', borderRadius: '6px', padding: '20px' }}>
            <div style={{ fontSize: '11px', color: '#484f58', letterSpacing: '0.1em', marginBottom: '16px' }}>TRAFFIC SOURCE</div>
            {s.topReferrers.length === 0 ? (
              <div style={{ color: '#484f58', fontSize: '12px' }}>データ収集中...</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {s.topReferrers.map(([label, count]) => {
                  const pct = s.totalPV > 0 ? (count / s.totalPV) * 100 : 0;
                  return (
                    <div key={label}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontSize: '11px', color: '#8b949e' }}>{label}</span>
                        <span style={{ fontSize: '11px', color: '#00d4ff' }}>{count} <span style={{ color: '#484f58' }}>({pct.toFixed(1)}%)</span></span>
                      </div>
                      <div style={{ height: '3px', background: '#21262d', borderRadius: '99px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg, #00d4ff, #39d353)', borderRadius: '99px' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Device */}
          <div style={{ background: '#161b22', border: '1px solid #21262d', borderRadius: '6px', padding: '20px' }}>
            <div style={{ fontSize: '11px', color: '#484f58', letterSpacing: '0.1em', marginBottom: '16px' }}>DEVICE</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {Object.entries(s.deviceCounts).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]).map(([label, count]) => {
                const pct = s.totalPV > 0 ? (count / s.totalPV) * 100 : 0;
                const color = label === 'スマホ' ? '#a78bfa' : label === 'PC' ? '#39d353' : label === 'タブレット' ? '#fb923c' : '#484f58';
                return (
                  <div key={label}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '11px', color: '#8b949e' }}>{label}</span>
                      <span style={{ fontSize: '11px', color }}>{count} <span style={{ color: '#484f58' }}>({pct.toFixed(1)}%)</span></span>
                    </div>
                    <div style={{ height: '3px', background: '#21262d', borderRadius: '99px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: '99px' }} />
                    </div>
                  </div>
                );
              })}
              {s.totalPV === 0 && <div style={{ color: '#484f58', fontSize: '12px' }}>データ収集中...</div>}
            </div>
          </div>
        </div>

        {/* Posts table */}
        <div style={{ background: '#161b22', border: '1px solid #21262d', borderRadius: '6px', overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid #21262d', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', color: '#484f58', letterSpacing: '0.1em', marginRight: '8px' }}>RECENT POSTS —</span>
              {([
                { k: 'all' as ViewTab, label: `ALL (${s.totalPosts})`, color: '#e6edf3' },
                { k: 'human' as ViewTab, label: `人間 (${s.humanPostCount})`, color: '#39d353' },
                { k: 'ai' as ViewTab, label: `AI (${s.aiPostCount})`, color: '#f59e0b' },
              ]).map((t) => {
                const active = view === t.k;
                return (
                  <Link
                    key={t.k}
                    href={t.k === 'all' ? '/admin' : `/admin?view=${t.k}`}
                    style={{
                      fontSize: '10px',
                      padding: '4px 10px',
                      borderRadius: '99px',
                      textDecoration: 'none',
                      background: active ? `${t.color}22` : 'transparent',
                      color: active ? t.color : '#6e7681',
                      border: `1px solid ${active ? t.color : '#21262d'}`,
                      letterSpacing: '0.06em',
                    }}
                  >
                    {t.label}
                  </Link>
                );
              })}
            </div>
            <span style={{ fontSize: '11px', color: '#6e7681' }}>
              {(view === 'human' ? s.recentHumanPosts.length : view === 'ai' ? s.recentAIPosts.length : s.recentPosts.length)} rows
            </span>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
            <thead>
              <tr style={{ background: '#0d1117' }}>
                {['CREATED_AT', 'TYPE', 'TOPIC', 'BODY', 'LIKES', 'REPLIES', ''].map((h) => (
                  <th key={h} style={{ padding: '8px 16px', textAlign: h === 'LIKES' || h === 'REPLIES' ? 'center' : 'left', color: '#6e7681', fontWeight: 400, fontSize: '10px', letterSpacing: '0.08em', borderBottom: '1px solid #21262d' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(view === 'human' ? s.recentHumanPosts : view === 'ai' ? s.recentAIPosts : s.recentPosts).map((post, i) => (
                <tr key={post.id} style={{ background: i % 2 === 0 ? 'transparent' : '#0d1117' }}>
                  <td style={{ padding: '9px 16px', color: '#6e7681', whiteSpace: 'nowrap', fontSize: '11px' }}>
                    {new Date(post.created_at).toLocaleString('ja-JP', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td style={{ padding: '9px 16px', whiteSpace: 'nowrap' }}>
                    {post.isAI
                      ? <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '99px', background: '#451a0320', color: '#f59e0b', border: '1px solid #92400e' }}>AI</span>
                      : <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '99px', background: '#05200a20', color: '#39d353', border: '1px solid #166534' }}>人間</span>
                    }
                  </td>
                  <td style={{ padding: '9px 16px', whiteSpace: 'nowrap' }}>
                    <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '99px', background: '#21262d', color: '#8b949e' }}>{post.topic}</span>
                  </td>
                  <td style={{ padding: '9px 16px', color: '#c9d1d9', maxWidth: '360px' }}>
                    <span style={{ display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' } as React.CSSProperties}>
                      {post.body}
                    </span>
                  </td>
                  <td style={{ padding: '9px 16px', textAlign: 'center', color: '#f472b6' }}>{post.likes ?? 0}</td>
                  <td style={{ padding: '9px 16px', textAlign: 'center', color: '#fb923c' }}>{post.replyCount}</td>
                  <td style={{ padding: '9px 16px' }}>
                    <Link href={`/posts/${post.id}`} target="_blank" style={{ color: '#00d4ff', fontSize: '11px', textDecoration: 'none' }}>↗</Link>
                  </td>
                </tr>
              ))}
              {(view === 'human' ? s.recentHumanPosts : view === 'ai' ? s.recentAIPosts : s.recentPosts).length === 0 && (
                <tr><td colSpan={7} style={{ padding: '32px', textAlign: 'center', color: '#484f58' }}>no data</td></tr>
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
