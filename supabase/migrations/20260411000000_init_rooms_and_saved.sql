-- rooms table
CREATE TABLE IF NOT EXISTS rooms (
  id bigserial primary key,
  topic text not null default 'なんでも',
  name text not null,
  description text default '',
  created_at timestamptz default now()
);
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anyone_read_rooms" ON rooms;
DROP POLICY IF EXISTS "anyone_insert_rooms" ON rooms;
CREATE POLICY "anyone_read_rooms" ON rooms FOR SELECT USING (true);
CREATE POLICY "anyone_insert_rooms" ON rooms FOR INSERT WITH CHECK (true);

-- room_messages table
CREATE TABLE IF NOT EXISTS room_messages (
  id bigserial primary key,
  room_id bigint not null,
  body text not null,
  name text not null default 'にんげんさん',
  created_at timestamptz default now()
);
ALTER TABLE room_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anyone_read_messages" ON room_messages;
DROP POLICY IF EXISTS "anyone_insert_messages" ON room_messages;
CREATE POLICY "anyone_read_messages" ON room_messages FOR SELECT USING (true);
CREATE POLICY "anyone_insert_messages" ON room_messages FOR INSERT WITH CHECK (true);

-- Enable Realtime for room_messages
ALTER PUBLICATION supabase_realtime ADD TABLE room_messages;

-- saved_posts table
CREATE TABLE IF NOT EXISTS saved_posts (
  id bigserial primary key,
  user_id uuid references auth.users(id) on delete cascade,
  post_id bigint not null,
  created_at timestamptz default now(),
  unique(user_id, post_id)
);
ALTER TABLE saved_posts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "users_own_saved" ON saved_posts;
DROP POLICY IF EXISTS "users_insert_saved" ON saved_posts;
DROP POLICY IF EXISTS "users_delete_saved" ON saved_posts;
CREATE POLICY "users_own_saved" ON saved_posts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "users_insert_saved" ON saved_posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users_delete_saved" ON saved_posts FOR DELETE USING (auth.uid() = user_id);
