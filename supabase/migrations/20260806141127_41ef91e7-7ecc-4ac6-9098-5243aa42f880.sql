ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS settings jsonb NOT NULL DEFAULT '{}'::jsonb;

CREATE TABLE IF NOT EXISTS public.page_layouts (
  page text PRIMARY KEY,
  blocks jsonb NOT NULL DEFAULT '[]'::jsonb,
  enabled boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.page_layouts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.page_layouts TO anon;
GRANT ALL ON public.page_layouts TO service_role;
ALTER TABLE public.page_layouts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read page_layouts" ON public.page_layouts FOR SELECT USING (true);
CREATE POLICY "Open write page_layouts" ON public.page_layouts FOR INSERT WITH CHECK (true);
CREATE POLICY "Open update page_layouts" ON public.page_layouts FOR UPDATE USING (true);
CREATE POLICY "Open delete page_layouts" ON public.page_layouts FOR DELETE USING (true);

CREATE TABLE IF NOT EXISTS public.site_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_settings TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_settings TO anon;
GRANT ALL ON public.site_settings TO service_role;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read site_settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Open write site_settings" ON public.site_settings FOR INSERT WITH CHECK (true);
CREATE POLICY "Open update site_settings" ON public.site_settings FOR UPDATE USING (true);
CREATE POLICY "Open delete site_settings" ON public.site_settings FOR DELETE USING (true);

INSERT INTO public.site_settings (key, value) VALUES ('global', '{"chronological": false}'::jsonb) ON CONFLICT (key) DO NOTHING;