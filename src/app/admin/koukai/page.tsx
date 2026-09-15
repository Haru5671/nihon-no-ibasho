import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ADMIN_COOKIE, verifyAdminToken } from '@/lib/admin/session';

export const dynamic = 'force-dynamic';

// ko-kai.jp（みんなの後悔）の集計。以前は ko-kai.jp/admin.html が anon キーで
// アクセスログを直接読んでいたが、RLS を閉じたのでここ（service role）に集約。
function adminDb() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}

type KPost = { id: number; text: string; category: string; age: string; gender: string; empathy: number; created_at: string };

async function getKoukaiStats() {
  const db = adminDb();
  const JST = 9 * 60 * 60 * 1000;
  const nowJST = new Date(Date.now() + JST);
  const todayJST = new Date(Date.UTC(nowJST.getUTCFullYear(), nowJST.getUTCMonth(), nowJST.getUTCDate()) - JST);
  const d14 = new Date(todayJST.getTime() - 13 * 24 * 60 * 60 * 1000);

  const [pvTotal, pvToday, pv14, postsCount, commentsCount, recentPosts] = await Promise.all([
    db.from('koukai_page_views').select('*', { count: 'exact', head: true }),
    db.from('koukai_page_views').select('*', { count: 'exact', head: true }).gte('created_at', todayJST.toISOString()),
    db.from('koukai_page_views').select('ip_hash, referrer, created_at').gte('created_at', d14.toISOString()).limit(20000),
    db.from('koukai_posts').select('*', { count: 'exact', head: true }),
    db.from('koukai_comments').select('*', { count: 'exact', head: true }),
    db.from('koukai_posts').select('id, text, category, age, gender, empathy, created_at').order('created_at', { ascending: false }).limit(50),
  ]);

  const rows = pv14.data ?? [];
  const uniq14 = new Set(rows.map((r) => r.ip_hash).filter(Boolean)).size;
  const byDay = new Map<string, number>();
  for (let i = 0; i < 14; i++) {
    const d = new Date(d14.getTime() + i * 86400000 + JST);
    byDay.set(d.toISOString().slice(5, 10), 0);
  }
  for (const r of rows) {
    const k = new Date(new Date(r.created_at).getTime() + JST).toISOString().slice(5, 10);
    if (byDay.has(k)) byDay.set(k, (byDay.get(k) ?? 0) + 1);
  }
  const refs = new Map<string, number>();
  for (const r of rows) {
    let host = '(direct)';
    if (r.referrer) { try { host = new URL(r.referrer).hostname; } catch { host = r.referrer; } }
    refs.set(host, (refs.get(host) ?? 0) + 1);
  }
  return {
    pvTotal: pvTotal.count ?? 0,
    pvToday: pvToday.count ?? 0,
    uniq14,
    posts: postsCount.count ?? 0,
    comments: commentsCount.count ?? 0,
    byDay: Array.from(byDay.entries()),
    refs: Array.from(refs.entries()).sort((a, b) => b[1] - a[1]).slice(0, 10),
    recentPosts: (recentPosts.data ?? []) as KPost[],
  };
}

export default async function KoukaiAdminPage() {
  const authed = await verifyAdminToken(cookies().get(ADMIN_COOKIE)?.value, process.env.ADMIN_PASSWORD);
  if (!authed) redirect('/admin/login');
  const s = await getKoukaiStats();
  const max = Math.max(1, ...s.byDay.map(([, v]) => v));
  const card = { background: '#161b22', border: '1px solid #21262d', borderRadius: '6px', padding: '16px 20px' } as const;
  const cards = [
    { label: 'TOTAL PV', value: s.pvTotal, sub: `今日 ${s.pvToday}`, color: '#00d4ff' },
    { label: 'UNIQUE (14d)', value: s.uniq14, sub: 'ip_hash ベース', color: '#39d353' },
    { label: 'POSTS', value: s.posts, sub: '後悔の投稿', color: '#f472b6' },
    { label: 'COMMENTS', value: s.comments, sub: '', color: '#fb923c' },
  ];
  return (
    <div style={{ minHeight: '100vh', background: '#0d1117', color: '#e6edf3', fontFamily: "'Geist Mono', 'Fira Code', 'Consolas', monospace" }}>
      <div style={{ borderBottom: '1px solid #21262d', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#161b22' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ color: '#f472b6', fontSize: '13px', fontWeight: 700, letterSpacing: '0.1em' }}>◆ KO-KAI ADMIN</span>
          <span style={{ color: '#484f58', fontSize: '11px' }}>ko-kai.jp / みんなの後悔</span>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <Link href="/admin" style={{ color: '#00d4ff', fontSize: '11px', textDecoration: 'none' }}>← IBASHO ADMIN</Link>
          <a href="https://ko-kai.jp" style={{ color: '#00d4ff', fontSize: '11px', textDecoration: 'none' }}>サイトへ ↗</a>
        </div>
      </div>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
          {cards.map((c) => (
            <div key={c.label} style={card}>
              <div style={{ fontSize: '10px', color: '#484f58', letterSpacing: '0.12em', marginBottom: '6px' }}>{c.label}</div>
              <div style={{ fontSize: '26px', fontWeight: 700, color: c.color, lineHeight: 1, marginBottom: '4px' }}>{c.value.toLocaleString()}</div>
              <div style={{ fontSize: '10px', color: '#8b949e' }}>{c.sub}</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px', marginBottom: '24px' }}>
          <div style={card}>
            <div style={{ fontSize: '10px', color: '#484f58', letterSpacing: '0.12em', marginBottom: '12px' }}>PV / DAY (14d)</div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '120px' }}>
              {s.byDay.map(([d, v]) => (
                <div key={d} style={{ flex: 1, textAlign: 'center' }}>
                  <div style={{ background: '#00d4ff', height: `${Math.round((v / max) * 100)}px`, borderRadius: '2px 2px 0 0' }} title={`${d}: ${v}`} />
                  <div style={{ fontSize: '8px', color: '#484f58', marginTop: '4px' }}>{d.slice(3)}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={card}>
            <div style={{ fontSize: '10px', color: '#484f58', letterSpacing: '0.12em', marginBottom: '12px' }}>REFERRERS (14d)</div>
            {s.refs.map(([h, n]) => (
              <div key={h} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', padding: '3px 0', borderBottom: '1px solid #21262d' }}>
                <span style={{ color: '#8b949e', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h}</span><span>{n}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={card}>
          <div style={{ fontSize: '10px', color: '#484f58', letterSpacing: '0.12em', marginBottom: '12px' }}>RECENT POSTS</div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
            <thead><tr style={{ color: '#484f58', textAlign: 'left' }}><th style={{ padding: '4px' }}>日時</th><th style={{ padding: '4px' }}>カテゴリ</th><th style={{ padding: '4px' }}>属性</th><th style={{ padding: '4px' }}>共感</th><th style={{ padding: '4px' }}>本文</th></tr></thead>
            <tbody>
              {s.recentPosts.map((p) => (
                <tr key={p.id} style={{ borderTop: '1px solid #21262d' }}>
                  <td style={{ padding: '6px 4px', whiteSpace: 'nowrap', color: '#8b949e' }}>{new Date(p.created_at).toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })}</td>
                  <td style={{ padding: '6px 4px', whiteSpace: 'nowrap' }}>{p.category}</td>
                  <td style={{ padding: '6px 4px', whiteSpace: 'nowrap', color: '#8b949e' }}>{p.age} / {p.gender}</td>
                  <td style={{ padding: '6px 4px', color: '#f472b6' }}>{p.empathy}</td>
                  <td style={{ padding: '6px 4px', color: '#c9d1d9' }}>{p.text.slice(0, 120)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
