import { createClient } from "@supabase/supabase-js";
import { cache } from "react";
import type { Topic } from "@/data/posts";

/** サーバー側で投稿を直接取得するためのデータアクセス層。
 *  これまで page / 投稿詳細が `/api/posts` を自己 HTTP fetch していたのを廃止し、
 *  Supabase を直叩きして初期 HTML に本文を埋め込めるようにする（SEO 対策）。 */

function anonDb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export interface DbPost {
  id: string;
  name: string;
  body: string;
  topic: Topic;
  likes: number;
  created_at: string;
  replies: { count: number }[];
}

/** 広場用：最新投稿を取得（初期 SSR 用に件数を絞る）。 */
export const getPosts = cache(async (limit = 50): Promise<DbPost[]> => {
  const { data, error } = await anonDb()
    .from("posts")
    .select("*, replies(count)")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error || !data) return [];
  return data as DbPost[];
});

/** 投稿詳細用：1 件取得。React.cache で generateMetadata と本体の二重取得を 1 クエリに集約。 */
export const getPost = cache(async (id: string): Promise<DbPost | null> => {
  const { data, error } = await anonDb()
    .from("posts")
    .select("*, replies(count)")
    .eq("id", id)
    .single();
  if (error || !data) return null;
  return data as DbPost;
});
