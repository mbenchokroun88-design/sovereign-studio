CREATE OR REPLACE FUNCTION public.tg_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

CREATE TABLE IF NOT EXISTS public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  client TEXT NOT NULL DEFAULT '',
  year TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'identity',
  summary TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  cover_url TEXT NOT NULL DEFAULT '',
  featured BOOLEAN NOT NULL DEFAULT false,
  tags TEXT[] NOT NULL DEFAULT '{}',
  media JSONB NOT NULL DEFAULT '[]'::jsonb,
  blocks JSONB NOT NULL DEFAULT '[]'::jsonb,
  position INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS blocks JSONB NOT NULL DEFAULT '[]'::jsonb;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.projects TO anon, authenticated;
GRANT ALL ON public.projects TO service_role;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can read projects" ON public.projects;
CREATE POLICY "Public can read projects" ON public.projects FOR SELECT USING (true);
DROP POLICY IF EXISTS "Open write projects" ON public.projects;
CREATE POLICY "Open write projects" ON public.projects FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Open update projects" ON public.projects;
CREATE POLICY "Open update projects" ON public.projects FOR UPDATE USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Open delete projects" ON public.projects;
CREATE POLICY "Open delete projects" ON public.projects FOR DELETE USING (true);
DROP TRIGGER IF EXISTS projects_set_updated_at ON public.projects;
CREATE TRIGGER projects_set_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
CREATE INDEX IF NOT EXISTS projects_position_idx ON public.projects(position, created_at DESC);

CREATE TABLE IF NOT EXISTS public.hero_slides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  eyebrow text NOT NULL DEFAULT '',
  title text NOT NULL DEFAULT '',
  subtitle text NOT NULL DEFAULT '',
  image_url text NOT NULL DEFAULT '',
  cta_label text NOT NULL DEFAULT '',
  cta_href text NOT NULL DEFAULT '',
  position integer NOT NULL DEFAULT 0,
  visible boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hero_slides TO anon, authenticated;
GRANT ALL ON public.hero_slides TO service_role;
ALTER TABLE public.hero_slides ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read hero_slides" ON public.hero_slides;
CREATE POLICY "Public read hero_slides" ON public.hero_slides FOR SELECT USING (true);
DROP POLICY IF EXISTS "Open write hero" ON public.hero_slides;
CREATE POLICY "Open write hero" ON public.hero_slides FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Open update hero" ON public.hero_slides;
CREATE POLICY "Open update hero" ON public.hero_slides FOR UPDATE USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Open delete hero" ON public.hero_slides;
CREATE POLICY "Open delete hero" ON public.hero_slides FOR DELETE USING (true);
DROP TRIGGER IF EXISTS tg_hero_slides_updated ON public.hero_slides;
CREATE TRIGGER tg_hero_slides_updated BEFORE UPDATE ON public.hero_slides FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

CREATE TABLE IF NOT EXISTS public.clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT '',
  logo_url text NOT NULL DEFAULT '',
  href text NOT NULL DEFAULT '',
  position integer NOT NULL DEFAULT 0,
  visible boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.clients TO anon, authenticated;
GRANT ALL ON public.clients TO service_role;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read clients" ON public.clients;
CREATE POLICY "Public read clients" ON public.clients FOR SELECT USING (true);
DROP POLICY IF EXISTS "Open write clients" ON public.clients;
CREATE POLICY "Open write clients" ON public.clients FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Open update clients" ON public.clients;
CREATE POLICY "Open update clients" ON public.clients FOR UPDATE USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Open delete clients" ON public.clients;
CREATE POLICY "Open delete clients" ON public.clients FOR DELETE USING (true);
DROP TRIGGER IF EXISTS tg_clients_updated ON public.clients;
CREATE TRIGGER tg_clients_updated BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();