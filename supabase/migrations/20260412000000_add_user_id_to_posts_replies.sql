-- Add user_id to posts (nullable — keeps anonymous posts intact)
ALTER TABLE posts ADD COLUMN IF NOT EXISTS user_id uuid references auth.users(id) on delete set null;
CREATE INDEX IF NOT EXISTS posts_user_id_idx ON posts(user_id);

-- Add user_id to replies
ALTER TABLE replies ADD COLUMN IF NOT EXISTS user_id uuid references auth.users(id) on delete set null;
CREATE INDEX IF NOT EXISTS replies_user_id_idx ON replies(user_id);
