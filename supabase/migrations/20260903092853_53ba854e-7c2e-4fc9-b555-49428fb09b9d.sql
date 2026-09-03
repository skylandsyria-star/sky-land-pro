CREATE TABLE public.property_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE,
  sort_order integer NOT NULL DEFAULT 0,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.property_categories TO authenticated;
GRANT ALL ON public.property_categories TO service_role;

ALTER TABLE public.property_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "categories select" ON public.property_categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "categories insert" ON public.property_categories FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "categories update" ON public.property_categories FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "categories delete" ON public.property_categories FOR DELETE TO authenticated USING (true);

CREATE TRIGGER property_categories_updated_at BEFORE UPDATE ON public.property_categories
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.property_categories (name, slug, sort_order) VALUES
  ('طرطوس المدينة', 'tartous_city', 1),
  ('دوير الشيخ سعد والشيخ سعد', 'duwair_sheikh_saad', 2),
  ('الريف القريب', 'near_countryside', 3),
  ('معامل وشركات', 'factories_companies', 4),
  ('شاليهات', 'chalets', 5),
  ('شقق عامة', 'general_apartments', 6),
  ('غير مجدول', 'unscheduled', 99);

ALTER TABLE public.properties
  ADD COLUMN category_id uuid REFERENCES public.property_categories(id) ON DELETE SET NULL,
  ADD COLUMN pipeline_status text NOT NULL DEFAULT 'unscheduled';

CREATE INDEX properties_category_id_idx ON public.properties(category_id);
CREATE INDEX properties_pipeline_status_idx ON public.properties(pipeline_status);