CREATE POLICY "Public read project-media" ON storage.objects FOR SELECT USING (bucket_id = 'project-media');
CREATE POLICY "Public write project-media" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'project-media');
CREATE POLICY "Public update project-media" ON storage.objects FOR UPDATE USING (bucket_id = 'project-media') WITH CHECK (bucket_id = 'project-media');
CREATE POLICY "Public delete project-media" ON storage.objects FOR DELETE USING (bucket_id = 'project-media');