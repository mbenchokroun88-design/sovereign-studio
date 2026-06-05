
CREATE TABLE public.hero_slides (
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
CREATE POLICY "Public read hero_slides" ON public.hero_slides FOR SELECT USING (true);
CREATE POLICY "Open write hero_slides (admin)" ON public.hero_slides FOR INSERT WITH CHECK (true);
CREATE POLICY "Open update hero_slides (admin)" ON public.hero_slides FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Open delete hero_slides (admin)" ON public.hero_slides FOR DELETE USING (true);
CREATE TRIGGER tg_hero_slides_updated BEFORE UPDATE ON public.hero_slides FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

CREATE TABLE public.clients (
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
CREATE POLICY "Public read clients" ON public.clients FOR SELECT USING (true);
CREATE POLICY "Open write clients (admin)" ON public.clients FOR INSERT WITH CHECK (true);
CREATE POLICY "Open update clients (admin)" ON public.clients FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Open delete clients (admin)" ON public.clients FOR DELETE USING (true);
CREATE TRIGGER tg_clients_updated BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- Seed clients with the existing list
INSERT INTO public.clients (name, position) VALUES
 ('World Bank / IFC', 1),
 ('BEI', 2),
 ('Cluster ENR', 3),
 ('Min. Finances', 4),
 ('Min. Artisanat', 5),
 ('Min. Industrie', 6),
 ('Min. Transition Énergétique', 7);

-- Seed one default hero slide so the homepage renders nicely from the start
INSERT INTO public.hero_slides (eyebrow, title, subtitle, image_url, cta_label, cta_href, position) VALUES
 ('Rabat · Paris · Washington · 2026 Portfolio',
  'Design institutionnel de classe mondiale.',
  'Mohamed Benchokroun — concepteur d''identités, rapports et expériences visuelles pour les institutions financières, ministères et organisations internationales.',
  'https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?w=2000&q=80',
  'Voir le portfolio', '/portfolio', 1),
 ('Editorial Design',
  'Des rapports qui se lisent comme un livre.',
  'Direction artistique pour rapports d''impact, publications institutionnelles et flipbooks digitaux.',
  'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=2000&q=80',
  'Explorer l''édition', '/services', 2),
 ('Event Coverage',
  'Forums et sommets — couverture complète.',
  'Identité événementielle, signalétique, captation et livrables pour décideurs économiques.',
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=2000&q=80',
  'Voir les événements', '/portfolio', 3);
