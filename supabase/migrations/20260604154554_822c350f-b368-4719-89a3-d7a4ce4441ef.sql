
CREATE POLICY "Open write projects (admin)"
  ON public.projects FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Open update projects (admin)"
  ON public.projects FOR UPDATE
  USING (true) WITH CHECK (true);

CREATE POLICY "Open delete projects (admin)"
  ON public.projects FOR DELETE
  USING (true);

GRANT INSERT, UPDATE, DELETE ON public.projects TO anon;

CREATE POLICY "Open insert project pdfs"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'project-pdfs');

CREATE POLICY "Open update project pdfs"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'project-pdfs');

CREATE POLICY "Open delete project pdfs"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'project-pdfs');
