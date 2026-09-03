export const PIPELINE_STAGES = [
  { value: "shoot_booked", label: "تم حجز موعد التصوير" },
  { value: "shot", label: "تم التصوير" },
  { value: "edited_ready", label: "تم المونتاج جاهز للنشر" },
  { value: "sold", label: "تم البيع" },
  { value: "unscheduled", label: "غير مجدول" },
] as const;

export type PipelineStage = (typeof PIPELINE_STAGES)[number]["value"];

export function stageLabel(value: string | null | undefined) {
  return PIPELINE_STAGES.find((s) => s.value === value)?.label ?? "غير مجدول";
}
