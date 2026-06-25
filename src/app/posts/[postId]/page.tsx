import Link from "next/link";
import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ThreadClient from "./ThreadClient";
import TopicIcon from "@/components/TopicIcon";
import { getPost } from "@/lib/posts";
import { timeAgo } from "@/lib/utils";

// force-dynamic + 自己 HTTP fetch を廃止。Supabase 直クエリ + 5分 ISR でクロール効率を改善
export const revalidate = 300;

export async function generateMetadata({ params }: { params: { postId: string } }): Promise<Metadata> {
  const post = await getPost(params.postId);
  if (!post) {
    return { title: "投稿が見つかりません | にほんのいばしょ", robots: { index: false, follow: true } };
  }
  const snippet = post.body.length > 60 ? post.body.slice(0, 60) + "…" : post.body;
  const thin = post.body.trim().length < 30; // 薄い投稿は index させない
  return {
    title: `[${post.topic}] ${snippet} | にほんのいばしょ`,
    description: `${post.body.slice(0, 120)} — AI失業・失業手当・再就職・クビなど誰にも相談できない悩みを匿名で話せるコミュニティ「にほんのいばしょ」`,
    alternates: { canonical: `/posts/${params.postId}` },
    ...(thin ? { robots: { index: false, follow: true } } : {}),
    openGraph: {
      title: snippet,
      description: post.body.slice(0, 120),
      url: `/posts/${params.postId}`,
      siteName: "にほんのいばしょ",
      locale: "ja_JP",
      type: "article",
    },
  };
}

export default async function PostPage({ params }: { params: { postId: string } }) {
  const post = await getPost(params.postId);

  if (!post) {
    return (
      <>
        <Header />
        <main className="bg-surface min-h-screen pt-20 pb-12 px-4">
          <div className="max-w-2xl mx-auto text-center py-20 text-on-surface-variant">投稿が見つかりません</div>
        </main>
        <Footer />
      </>
    );
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "DiscussionForumPosting",
    headline: post.body.length > 60 ? post.body.slice(0, 60) + "…" : post.body,
    articleBody: post.body,
    datePublished: post.created_at,
    author: { "@type": "Person", name: post.name, url: "https://ibasho.co.jp" },
    interactionStatistic: [
      {
        "@type": "InteractionCounter",
        interactionType: "https://schema.org/LikeAction",
        userInteractionCount: post.likes ?? 0,
      },
    ],
    url: `https://ibasho.co.jp/posts/${params.postId}`,
    inLanguage: "ja",
    isPartOf: { "@type": "WebSite", name: "にほんのいばしょ", url: "https://ibasho.co.jp" },
  };
  // dangerouslySetInnerHTML 経由の </script> / U+2028 早期終了対策
  const jsonLdStr = JSON.stringify(jsonLd).replace(/</g, "\\u003c");

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdStr }} />
      <Header />
      <main className="bg-surface min-h-screen pt-20 pb-16 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Back link */}
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-primary hover:text-on-primary-container font-semibold mb-6 transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden focusable="false">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            広場に戻る
          </Link>

          {/* Original post */}
          <article className="bg-surface-container-lowest rounded-2xl p-6 sm:p-7 shadow-card mb-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center text-primary text-base font-bold shrink-0">
                {post.name?.[0] ?? "に"}
              </div>
              <div className="min-w-0">
                <span className="block text-sm text-on-surface font-semibold">{post.name}</span>
                <span className="inline-flex items-center gap-1 text-xs text-on-surface-variant mt-0.5">
                  <TopicIcon topic={post.topic} size={11} />
                  {post.topic}・{timeAgo(post.created_at)}
                </span>
              </div>
            </div>
            <p className="text-on-surface text-base leading-loose mb-5 whitespace-pre-line">{post.body}</p>
            <div className="flex items-center gap-1.5 text-sm text-on-surface-variant">
              <span className="text-tertiary">♥</span>
              <span>{post.likes ?? 0}</span>
            </div>
          </article>

          {/* Replies + reply form (client) */}
          <ThreadClient postId={params.postId} body={post.body} />
        </div>
      </main>
      <Footer />
    </>
  );
}
