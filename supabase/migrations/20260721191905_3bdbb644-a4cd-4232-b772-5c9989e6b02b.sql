
CREATE TYPE public.agenda_kind AS ENUM ('appointment','task','follow_up','call','visit');
CREATE TYPE public.agenda_status AS ENUM ('pending','done','snoozed','cancelled');

CREATE TABLE public.agenda_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  kind public.agenda_kind NOT NULL DEFAULT 'task',
  status public.agenda_status NOT NULL DEFAULT 'pending',
  due_at TIMESTAMPTZ NOT NULL,
  remind_at TIMESTAMPTZ,
  notified_at TIMESTAMPTZ,
  owner_id UUID REFERENCES public.owners(id) ON DELETE SET NULL,
  property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.agenda_items TO authenticated;
GRANT ALL ON public.agenda_items TO service_role;

ALTER TABLE public.agenda_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "agenda readable by authenticated" ON public.agenda_items
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "agenda insert by authenticated" ON public.agenda_items
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "agenda update by creator or assignee or admin" ON public.agenda_items
  FOR UPDATE TO authenticated USING (
    auth.uid() = created_by OR auth.uid() = assigned_to OR public.has_role(auth.uid(),'admin')
  );
CREATE POLICY "agenda delete by creator or admin" ON public.agenda_items
  FOR DELETE TO authenticated USING (
    auth.uid() = created_by OR public.has_role(auth.uid(),'admin')
  );

CREATE TRIGGER trg_agenda_updated_at BEFORE UPDATE ON public.agenda_items
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX idx_agenda_due ON public.agenda_items(due_at) WHERE status = 'pending';
CREATE INDEX idx_agenda_assigned ON public.agenda_items(assigned_to);
CREATE INDEX idx_agenda_customer ON public.agenda_items(customer_id);
CREATE INDEX idx_agenda_owner ON public.agenda_items(owner_id);
CREATE INDEX idx_agenda_property ON public.agenda_items(property_id);
