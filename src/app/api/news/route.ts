import { NextResponse } from 'next/server';

const RSS_URL =
  'https://news.google.com/rss/search?q=AI%E5%A4%B1%E6%A5%AD+OR+%E5%A4%B1%E6%A5%AD%E6%89%8B%E5%BD%93+OR+%E5%86%8D%E5%B0%B1%E8%81%B7+OR+%E3%82%AF%E3%83%93+OR+AI+%E4%BB%95%E4%BA%8B&hl=ja&gl=JP&ceid=JP%3Aja';

interface NewsItem {
  title: string;
  link: string;
  pubDate: string;
  source: string;
}

let cache: { data: NewsItem[]; ts: number } | null = null;
const CACHE_MS = 20 * 60 * 1000;

function extractText(tag: string, xml: string): string {
  const cdata = xml.match(new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>`));
  if (cdata) return cdata[1].trim();
  const plain = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`));
  return plain ? plain[1].replace(/<[^>]+>/g, '').trim() : '';
}

function parseRSS(xml: string): NewsItem[] {
  const items: NewsItem[] = [];
  const matches = Array.from(xml.matchAll(/<item>([\s\S]*?)<\/item>/g));
  for (const m of matches) {
    const block = m[1];
    const title = extractText('title', block);
    const link = block.match(/<link>(.*?)<\/link>/)?.[1]?.trim() ??
                 block.match(/<link\s+[^>]*href="([^"]+)"/)?.[1] ?? '';
    const pubDate = extractText('pubDate', block);
    const source = extractText('source', block);
    if (title && link) items.push({ title, link, pubDate, source });
    if (items.length >= 8) break;
  }
  return items;
}

export async function GET() {
  if (cache && Date.now() - cache.ts < CACHE_MS) {
    return NextResponse.json(cache.data);
  }
  try {
    const res = await fetch(RSS_URL, { next: { revalidate: 1200 } });
    const xml = await res.text();
    const items = parseRSS(xml);
    cache = { data: items, ts: Date.now() };
    return NextResponse.json(items);
  } catch {
    return NextResponse.json([]);
  }
}
