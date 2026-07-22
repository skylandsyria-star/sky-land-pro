
CREATE POLICY "auth read property-media" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'property-media');
CREATE POLICY "auth upload property-media" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'property-media');
CREATE POLICY "auth update property-media" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'property-media');
CREATE POLICY "auth delete property-media" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'property-media');
