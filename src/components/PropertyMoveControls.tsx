import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";
import { useCategories } from "@/hooks/useCategories";
import { PIPELINE_STAGES } from "@/lib/pipeline";
import { FolderInput, Workflow } from "lucide-react";

export function useRefreshProperties() {
  const qc = useQueryClient();
  return (id?: string) => {
    qc.invalidateQueries({ queryKey: ["properties"] });
    qc.invalidateQueries({ queryKey: ["property-category-counts"] });
    qc.invalidateQueries({ queryKey: ["pipeline"] });
    qc.invalidateQueries({ queryKey: ["count", "properties"] });
    if (id) qc.invalidateQueries({ queryKey: ["property", id] });
  };
}

export function PropertyMoveControls({
  propertyId,
  categoryId,
  pipelineStatus,
  compact,
}: {
  propertyId: string;
  categoryId: string | null;
  pipelineStatus: string | null;
  compact?: boolean;
}) {
  const cats = useCategories();
  const refresh = useRefreshProperties();
  const [busy, setBusy] = useState(false);

  async function update(patch: Record<string, any>, msg: string) {
    setBusy(true);
    const { error } = await supabase.from("properties").update(patch).eq("id", propertyId);
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success(msg);
    refresh(propertyId);
  }

  const cls =
    "w-full rounded-lg border border-input bg-background px-2 py-1.5 text-xs font-semibold disabled:opacity-60";

  return (
    <div className={compact ? "grid grid-cols-2 gap-2" : "grid gap-2 sm:grid-cols-2"}>
      <label className="block">
        <span className="mb-1 flex items-center gap-1 text-[11px] font-semibold text-muted-foreground">
          <FolderInput className="h-3 w-3" /> نقل إلى تصنيف...
        </span>
        <select
          disabled={busy}
          className={cls}
          value={categoryId ?? ""}
          onChange={(e) => update({ category_id: e.target.value || null }, "تم نقل العقار للتصنيف")}
        >
          <option value="">— بدون تصنيف —</option>
          {cats.data?.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="mb-1 flex items-center gap-1 text-[11px] font-semibold text-muted-foreground">
          <Workflow className="h-3 w-3" /> نقل إلى مرحلة...
        </span>
        <select
          disabled={busy}
          className={cls}
          value={pipelineStatus ?? "unscheduled"}
          onChange={(e) => update({ pipeline_status: e.target.value }, "تم تحديث مرحلة العقار")}
        >
          {PIPELINE_STAGES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </label>
    </div>
  );
}
