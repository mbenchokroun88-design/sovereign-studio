
INSERT INTO public.projects (slug, title, client, year, category, summary, description, cover_url, featured, tags, media, position)
SELECT * FROM (VALUES
  ('cluster-enr-identite', 'Cluster ENR — Identité institutionnelle', 'Cluster ENR Maroc', '2025', 'identity',
   'Refonte complète du système d''identité visuelle du Cluster Énergies Renouvelables.',
   'Système d''identité bilingue (FR/AR) déployé sur l''ensemble des supports institutionnels du Cluster ENR : logotype, charte graphique, papeterie, gabarits éditoriaux et signalétique événementielle.',
   'https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?w=1600&q=80', true, ARRAY['Identité','Bilingue','Énergie'], '[]'::jsonb, 1),

  ('ifc-rapport-impact', 'IFC — Rapport d''impact MENA 2024', 'International Finance Corporation', '2024', 'report',
   'Direction artistique et mise en page du rapport d''impact régional de l''IFC.',
   'Conception éditoriale d''un rapport de 120 pages : infographies, datavisualisation, photographie de terrain et flipbook digital pour diffusion auprès des partenaires institutionnels.',
   'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1600&q=80', true, ARRAY['Édition','Datavisualisation','Finance'], '[]'::jsonb, 2),

  ('bei-forum-mediterranee', 'BEI — Forum Méditerranée', 'Banque Européenne d''Investissement', '2024', 'event',
   'Couverture visuelle complète du forum BEI à Marrakech.',
   'Identité événementielle, signalétique, supports imprimés, badges, photocalls, programmes et captation vidéo pour le forum BEI réunissant 600 décideurs économiques.',
   'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1600&q=80', true, ARRAY['Événement','Institutionnel'], '[]'::jsonb, 3),

  ('mtedd-film-institutionnel', 'Ministère de la Transition Énergétique — Film institutionnel', 'Ministère Transition Énergétique & Développement Durable', '2025', 'video',
   'Film institutionnel 4 minutes sur la stratégie nationale bas-carbone.',
   'Écriture, réalisation, motion design et étalonnage d''un film bilingue présentant la feuille de route énergétique du Maroc à l''horizon 2030.',
   'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=1600&q=80', false, ARRAY['Vidéo','Motion','Institutionnel'], '[]'::jsonb, 4),

  ('artisanat-pavillon-3d', 'Ministère de l''Artisanat — Pavillon 3D Expo', 'Ministère de l''Artisanat', '2024', '3d',
   'Conception 3D et visite virtuelle du pavillon marocain.',
   'Modélisation architecturale, rendus photoréalistes et visite immersive 360° du pavillon marocain présenté lors du salon international de l''artisanat.',
   'https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=1600&q=80', false, ARRAY['3D','Architecture','Exposition'], '[]'::jsonb, 5),

  ('worldbank-plateforme', 'World Bank — Plateforme MENA Data', 'World Bank', '2025', 'web',
   'Design produit d''une plateforme de visualisation de données régionales.',
   'UX/UI, design system, prototypage et accompagnement développement d''une plateforme web dédiée à la diffusion de données socio-économiques en MENA.',
   'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1600&q=80', true, ARRAY['Web','Datavisualisation','Produit'], '[]'::jsonb, 6)
) AS v(slug,title,client,year,category,summary,description,cover_url,featured,tags,media,position)
WHERE NOT EXISTS (SELECT 1 FROM public.projects p WHERE p.slug = v.slug);
