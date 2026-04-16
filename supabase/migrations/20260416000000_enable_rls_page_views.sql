-- page_views: RLS有効化 + INSERTのみanonに許可（SELECT/UPDATE/DELETEはservice_roleのみ）
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anyone_insert_page_views" ON public.page_views;
CREATE POLICY "anyone_insert_page_views"
  ON public.page_views
  FOR INSERT
  WITH CHECK (true);
