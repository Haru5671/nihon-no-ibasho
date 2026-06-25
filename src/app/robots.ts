import type { MetadataRoute } from 'next';

const DISALLOW = ['/admin', '/admin/', '/api/', '/mypage', '/auth/update-password'];

// AI検索/学習クローラーを明示的に歓迎（AIO: ChatGPT/Claude/Perplexity/Google AI等に引用されやすく）
const AI_BOTS = [
  'GPTBot', 'OAI-SearchBot', 'ChatGPT-User',
  'ClaudeBot', 'Claude-Web', 'anthropic-ai', 'Claude-SearchBot',
  'PerplexityBot', 'Perplexity-User',
  'Google-Extended', 'Applebot', 'Applebot-Extended',
  'Bingbot', 'CCBot', 'Bytespider', 'Amazonbot', 'Meta-ExternalAgent',
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: DISALLOW },
      ...AI_BOTS.map((bot) => ({ userAgent: bot, allow: '/', disallow: DISALLOW })),
    ],
    sitemap: 'https://ibasho.co.jp/sitemap.xml',
    host: 'https://ibasho.co.jp',
  };
}
