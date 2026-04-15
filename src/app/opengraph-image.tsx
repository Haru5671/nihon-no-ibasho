import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'にほんのいばしょ — AI失業・失業手当・再就職の悩みを匿名で話せる場所';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

async function loadJpFont() {
  const css = await (
    await fetch(
      'https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@700&display=swap',
      { headers: { 'User-Agent': 'Mozilla/5.0' } }
    )
  ).text();
  const match = css.match(/src: url\((https:\/\/[^)]+)\) format\('woff2'\)/);
  if (!match) return null;
  return await (await fetch(match[1])).arrayBuffer();
}

export default async function Image() {
  const font = await loadJpFont();
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '80px',
          background: 'linear-gradient(135deg, #fdf6f0 0%, #f0ebe3 50%, #e8dcc8 100%)',
          fontFamily: 'NotoJP, sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: '#14b8a6',
            }}
          />
          <div style={{ fontSize: '28px', color: '#5a5147', fontWeight: 700 }}>
            にほんのいばしょ
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ fontSize: '72px', fontWeight: 700, color: '#2d2a26', lineHeight: 1.2 }}>
            誰にも話せない悩みを、
          </div>
          <div style={{ fontSize: '72px', fontWeight: 700, color: '#b85c3c', lineHeight: 1.2 }}>
            ここで、そっと。
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div style={{ fontSize: '24px', color: '#7a6f60' }}>
            AI失業・失業手当・再就職 / 匿名・登録不要
          </div>
          <div style={{ fontSize: '22px', color: '#9a8f80' }}>ibasho.co.jp</div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: font
        ? [{ name: 'NotoJP', data: font, style: 'normal', weight: 700 }]
        : [],
    }
  );
}
