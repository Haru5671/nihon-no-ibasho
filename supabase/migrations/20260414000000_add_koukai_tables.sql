-- みんなの後悔: posts table
CREATE TABLE IF NOT EXISTS koukai_posts (
  id bigserial primary key,
  text text not null,
  category text not null default 'その他',
  age text not null default '不明',
  gender text not null default 'その他',
  empathy integer not null default 0,
  created_at timestamptz default now()
);
ALTER TABLE koukai_posts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anyone_read_koukai_posts" ON koukai_posts;
DROP POLICY IF EXISTS "anyone_insert_koukai_posts" ON koukai_posts;
CREATE POLICY "anyone_read_koukai_posts" ON koukai_posts FOR SELECT USING (true);
CREATE POLICY "anyone_insert_koukai_posts" ON koukai_posts FOR INSERT WITH CHECK (true);
CREATE POLICY "anyone_update_koukai_posts" ON koukai_posts FOR UPDATE USING (true);

-- みんなの後悔: comments table
CREATE TABLE IF NOT EXISTS koukai_comments (
  id bigserial primary key,
  post_id bigint not null references koukai_posts(id) on delete cascade,
  text text not null,
  created_at timestamptz default now()
);
ALTER TABLE koukai_comments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anyone_read_koukai_comments" ON koukai_comments;
DROP POLICY IF EXISTS "anyone_insert_koukai_comments" ON koukai_comments;
CREATE POLICY "anyone_read_koukai_comments" ON koukai_comments FOR SELECT USING (true);
CREATE POLICY "anyone_insert_koukai_comments" ON koukai_comments FOR INSERT WITH CHECK (true);

-- みんなの後悔: page_views table
CREATE TABLE IF NOT EXISTS koukai_page_views (
  id bigserial primary key,
  path text not null default '/',
  ip_hash text,
  referrer text,
  ua text,
  created_at timestamptz default now()
);
ALTER TABLE koukai_page_views ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anyone_insert_koukai_pv" ON koukai_page_views;
CREATE POLICY "anyone_insert_koukai_pv" ON koukai_page_views FOR INSERT WITH CHECK (true);
CREATE POLICY "service_read_koukai_pv" ON koukai_page_views FOR SELECT USING (true);
