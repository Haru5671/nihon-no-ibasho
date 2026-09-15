-- 2026-09-15 security hardening
-- 1) koukai_posts: anon UPDATE was wide open (any column, any row). Replace with a bounded RPC.
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT tablename, policyname FROM pg_policies
     WHERE schemaname = 'public' AND tablename IN ('koukai_posts', 'koukai_comments') AND cmd IN ('UPDATE', 'DELETE')
  LOOP
    EXECUTE format('DROP POLICY %I ON public.%I', r.policyname, r.tablename);
  END LOOP;
END $$;

CREATE OR REPLACE FUNCTION public.koukai_add_empathy(pid bigint, delta integer DEFAULT 1)
RETURNS integer
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.koukai_posts
     SET empathy = GREATEST(0, empathy + LEAST(1, GREATEST(-1, delta)))
   WHERE id = pid
  RETURNING empathy;
$$;
REVOKE ALL ON FUNCTION public.koukai_add_empathy(bigint, integer) FROM public;
GRANT EXECUTE ON FUNCTION public.koukai_add_empathy(bigint, integer) TO anon, authenticated;

-- 2) koukai_page_views: raw access log (ip_hash / ua / referrer) must not be readable with the public key.
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT policyname FROM pg_policies
     WHERE schemaname = 'public' AND tablename = 'koukai_page_views' AND cmd IN ('SELECT', 'UPDATE', 'DELETE')
  LOOP
    EXECUTE format('DROP POLICY %I ON public.koukai_page_views', r.policyname);
  END LOOP;
END $$;

-- 3) posts (ibasho): likes are now incremented server-side with the service role,
--    so no UPDATE/DELETE policy is needed for anon/authenticated.
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT policyname FROM pg_policies
     WHERE schemaname = 'public' AND tablename = 'posts' AND cmd IN ('UPDATE', 'DELETE')
  LOOP
    EXECUTE format('DROP POLICY %I ON public.posts', r.policyname);
  END LOOP;
END $$;

-- 4) Guard rails against spam: bound body length.
ALTER TABLE public.koukai_posts  DROP CONSTRAINT IF EXISTS koukai_posts_text_len;
ALTER TABLE public.koukai_posts  ADD  CONSTRAINT koukai_posts_text_len  CHECK (char_length(text) BETWEEN 1 AND 2000);
ALTER TABLE public.koukai_comments DROP CONSTRAINT IF EXISTS koukai_comments_text_len;
ALTER TABLE public.koukai_comments ADD  CONSTRAINT koukai_comments_text_len CHECK (char_length(text) BETWEEN 1 AND 1000);
