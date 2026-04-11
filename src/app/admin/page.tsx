import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import AdminLogout from './AdminLogout';

export const dynamic = 'force-dynamic';

const TOPICS = ['なんでも', '仕事・AI', '孤独・さみしさ', '眠れない・不安', '家族・人間関係', '恋愛・パートナー', '体・こころ'];
const AI_NAME = 'にんげんさん';

function adminDb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

async function getStats() {
  const db = adminDb();

  const [postsResult, repliesResult, pvResult] = await Promise.all([
    db.from('posts').select('id, body, topic, likes, created_at, name'),
    db.from('replies').select('id, post_id, created_at'),
    db.from('page_views').select('id, path, ip_hash, created_at'),
  ]);

  const posts = postsResult.data ?? [];
  const replies = repliesResult.data ?? [];
  const pvRows = (pvResult.data ?? []) as { id: string; path: string; ip_hash: string; referrer: string | null; ua: string | null; created_at: string }[];

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

  const humanPosts = posts.filter((p) => p.name !== AI_NAME);
  const aiPosts = posts.filter((p) => p.name === AI_NAME);
  const aiPostIds = new Set(aiPosts.map((p) => p.id));

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const postsToday = posts.filter((p) => new Date(p.created_at) >= today).length;

  // Human-only likes/replies
  const humanLikes = humanPosts.reduce((sum: number, p) => sum + (p.likes ?? 0), 0);
  const humanReplies = replies.filter((r) => !aiPostIds.has(r.post_id)).length;

  // PV stats
  const totalPV = pvRows.length;
  const uniqueUsers = new Set(pvRows.map((r) => r.ip_hash)).size;
  const pvToday = pvRows.filter((r) => new Date(r.created_at) >= today).length;
  const uvToday = new Set(
    pvRows.filter((r) => new Date(r.created_at) >= today).map((r) => r.ip_hash)
  ).size;

  // Top pages
  const pageCounts: Record<string, number> = {};
  for (const r of pvRows) {
    pageCounts[r.path] = (pageCounts[r.path] ?? 0) + 1;
  }
  const topPages = Object.entries(pageCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  // Daily stats (last 14 days)
  const dailyStats: { label: string; posts: number; pv: number; uv: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
    const next = new Date(d.getTime() + 24 * 60 * 60 * 1000);
    const dayPosts = posts.filter((p) => {
      const t = new Date(p.created_at);
      return t >= d && t < next;
    }).length;
    const dayPV = pvRows.filter((r) => {
      const t = new Date(r.created_at);
      return t >= d && t < next;
    });
    dailyStats.push({
      label: `${d.getMonth() + 1}/${d.getDate()}`,
      posts: dayPosts,
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

  const recentPosts = posts
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 50)
    .map((p) => ({ ...p, replyCount: repliesPerPost[p.id] ?? 0, isAI: p.name === AI_NAME }));

  const maxPV = Math.max(...dailyStats.map((d) => d.pv), 1);
  const maxPosts = Math.max(...dailyStats.map((d) => d.posts), 1);

  return {
    totalPosts: posts.length,
    humanPostCount: humanPosts.length,
    aiPostCount: aiPosts.length,
    totalReplies: replies.length,
    humanReplies,
    postsToday,
    humanLikes,
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
    topReferrers,
    deviceCounts,
  };
}

export default async function AdminPage() {
  const s = await getStats();
  const now = new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' });

  const summaryCards = [
    { label: 'TOTAL PV', value: s.totalPV.toLocaleString(), sub: `今日 ${s.pvToday}`, color: '#00d4ff' },
    { label: 'UNIQUE USERS', value: s.uniqueUsers.toLocaleString(), sub: `今日 ${s.uvToday}`, color: '#39d353' },
    { label: 'POSTS (human)', value: s.humanPostCount.toLocaleString(), sub: `AI: ${s.aiPostCount} / 今日: ${s.postsToday}`, color: '#a78bfa' },
    { label: 'REPLIES (human)', value: s.humanReplies.toLocaleString(), sub: `全体: ${s.totalReplies}`, color: '#fb923c' },
    { label: 'LIKES (human)', value: s.humanLikes.toLocaleString(), sub: 'AI投稿除く', color: '#f472b6' },
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

          {/* Posts chart */}
          <div style={{ background: '#161b22', border: '1px solid #21262d', borderRadius: '6px', padding: '20px' }}>
            <div style={{ fontSize: '11px', color: '#484f58', letterSpacing: '0.1em', marginBottom: '4px' }}>POSTS — LAST 14 DAYS</div>
            <div style={{ fontSize: '10px', color: '#6e7681', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ display: 'inline-block', width: '8px', height: '8px', background: '#a78bfa', borderRadius: '2px' }} />投稿数
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '80px' }}>
              {s.dailyStats.map((d) => (
                <div key={d.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                  <span style={{ fontSize: '8px', color: '#6e7681' }}>{d.posts > 0 ? d.posts : ''}</span>
                  <div style={{ width: '100%', background: '#a78bfa', borderRadius: '2px 2px 0 0', height: `${Math.max((d.posts / s.maxPosts) * 56, d.posts > 0 ? 2 : 0)}px` }} />
                  <span style={{ fontSize: '8px', color: '#484f58', whiteSpace: 'nowrap' }}>{d.label}</span>
                </div>
              ))}
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
            <span style={{ fontSize: '11px', color: '#484f58', letterSpacing: '0.1em' }}>RECENT POSTS — TOP 50</span>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <span style={{ fontSize: '10px', color: '#39d353' }}>人間 {s.humanPostCount}</span>
              <span style={{ fontSize: '10px', color: '#f59e0b' }}>AI {s.aiPostCount}</span>
              <span style={{ fontSize: '11px', color: '#6e7681' }}>{s.recentPosts.length} rows</span>
            </div>
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
              {s.recentPosts.map((post, i) => (
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
              {s.recentPosts.length === 0 && (
                <tr><td colSpan={7} style={{ padding: '32px', textAlign: 'center', color: '#484f58' }}>no data</td></tr>
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
