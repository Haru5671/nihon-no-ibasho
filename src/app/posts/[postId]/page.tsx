import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AdSenseUnit from "@/components/AdSenseUnit";
import ThreadClient from "./ThreadClient";

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { postId: string } }) {
  const post = await getPost(params.postId);
  if (!post) return {};
  const snippet = post.body.length > 60 ? post.body.slice(0, 60) + '…' : post.body;
  return {
    title: `${snippet} | にほんのいばしょ`,
    description: `${post.body.slice(0, 120)} — AI失業・失業手当・再就職・クビなど誰にも相談できない悩みを匿名で話せるコミュニティ「にほんのいばしょ」`,
    openGraph: {
      title: snippet,
      description: post.body.slice(0, 120),
      url: `https://ibasho.co.jp/posts/${params.postId}`,
      siteName: 'にほんのいばしょ',
      locale: 'ja_JP',
      type: 'article',
    },
  };
}

async function getPost(postId: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://ibasho.co.jp';
  const res = await fetch(`${baseUrl}/api/posts/${postId}`, { cache: 'no-store' });
  if (!res.ok) return null;
  return res.json();
}

export default async function PostPage({ params }: { params: { postId: string } }) {
  const post = await getPost(params.postId);

  if (!post) {
    return (
      <>
        <Header />
        <main className="bg-[#f8fafb] min-h-screen pt-20 pb-12 px-4">
          <div className="max-w-2xl mx-auto text-center py-20 text-gray-400">投稿が見つかりません</div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="bg-[#f8fafb] min-h-screen pt-20 pb-12 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Back link */}
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm text-teal-600 hover:text-teal-700 mb-6 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            広場に戻る
          </Link>

          {/* Original post (large) */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm mb-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 text-sm font-bold">
                {post.name[0]}
              </div>
              <div>
                <span className="text-sm text-gray-700 font-medium">{post.name}</span>
              </div>
            </div>
            <p className="text-gray-700 text-base leading-relaxed mb-4">{post.body}</p>
            <div className="flex items-center gap-1.5 text-sm text-gray-400">
              <span>♡</span>
              <span>{post.likes ?? 0}</span>
            </div>
          </div>

          {/* Replies + reply form (client component) */}
          <ThreadClient postId={params.postId} body={post.body} />

          {/* AdSense ad below reply button area */}
          <AdSenseUnit className="mt-4" />
        </div>
      </main>
      <Footer />
    </>
  );
}
