import type { Metadata } from "next";
import HomeClient from "@/components/HomeClient";
import { getPosts } from "@/lib/posts";

// 60 秒 ISR：初期 HTML に投稿本文を埋め込みつつ、定期的に再生成して鮮度を保つ
export const revalidate = 60;

// トップ自身を正規URLに（?q= 等のパラメータ付きを / に集約）
export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default async function Home() {
  const initialPosts = await getPosts(50);
  return <HomeClient initialPosts={initialPosts} />;
}
