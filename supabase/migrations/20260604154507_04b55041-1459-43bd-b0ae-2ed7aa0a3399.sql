
CREATE POLICY "Public read project pdfs"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'project-pdfs');
