import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Upload, X, Video as VideoIcon, Loader2 } from "lucide-react";

export type MediaItem = { path: string; type: "image" | "video" };

export function MediaUploader({
  value,
  onChange,
  folder = "misc",
}: {
  value: MediaItem[];
  onChange: (next: MediaItem[]) => void;
  folder?: string;
}) {
  const [uploading, setUploading] = useState(false);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user?.id ?? "anon";
      const uploaded: MediaItem[] = [];
      for (const file of Array.from(files)) {
        const isVideo = file.type.startsWith("video/");
        const isImage = file.type.startsWith("image/");
        if (!isVideo && !isImage) {
          toast.error(`نوع غير مدعوم: ${file.name}`);
          continue;
        }
        const ext = file.name.split(".").pop() || (isVideo ? "mp4" : "jpg");
        const path = `${uid}/${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
        const { error } = await supabase.storage
          .from("property-media")
          .upload(path, file, { cacheControl: "3600", upsert: false, contentType: file.type });
        if (error) {
          toast.error(error.message);
          continue;
        }
        uploaded.push({ path, type: isVideo ? "video" : "image" });
      }
      if (uploaded.length) {
        onChange([...value, ...uploaded]);
        toast.success(`تم رفع ${uploaded.length} ملف`);
      }
    } finally {
      setUploading(false);
    }
  }

  async function remove(idx: number) {
    const item = value[idx];
    try {
      await supabase.storage.from("property-media").remove([item.path]);
    } catch {
      // ignore
    }
    onChange(value.filter((_, i) => i !== idx));
  }

  return (
    <div className="space-y-2">
      <label className="flex cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-input bg-muted/30 p-4 text-center text-xs font-semibold text-muted-foreground hover:bg-muted/50">
        {uploading ? (
          <><Loader2 className="h-5 w-5 animate-spin" /> جاري الرفع...</>
        ) : (
          <><Upload className="h-5 w-5" /> اضغط لإضافة صور أو فيديو<span className="text-[10px] font-normal">يمكن اختيار عدة ملفات</span></>
        )}
        <input
          type="file"
          multiple
          accept="image/*,video/*"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
          disabled={uploading}
        />
      </label>
      {value.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {value.map((m, i) => (
            <MediaThumb key={m.path} item={m} onRemove={() => remove(i)} />
          ))}
        </div>
      )}
    </div>
  );
}

function MediaThumb({ item, onRemove }: { item: MediaItem; onRemove: () => void }) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    supabase.storage.from("property-media").createSignedUrl(item.path, 3600).then(({ data }) => {
      if (data?.signedUrl) setUrl(data.signedUrl);
    });
  }, [item.path]);
  return (
    <div className="relative aspect-square overflow-hidden rounded-lg border border-border bg-muted">
      {url ? (
        item.type === "video" ? (
          <video src={url} className="h-full w-full object-cover" muted />
        ) : (
          <img src={url} alt="" className="h-full w-full object-cover" />
        )
      ) : (
        <div className="flex h-full items-center justify-center"><Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /></div>
      )}
      {item.type === "video" && (
        <div className="absolute bottom-1 start-1 rounded bg-black/60 p-1"><VideoIcon className="h-3 w-3 text-white" /></div>
      )}
      <button
        type="button"
        onClick={onRemove}
        className="absolute top-1 end-1 rounded-full bg-destructive p-1 text-destructive-foreground shadow"
        aria-label="حذف"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
}

export function MediaGallery({ items }: { items: MediaItem[] }) {
  const [urls, setUrls] = useState<Record<string, string>>({});
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const paths = items.map((i) => i.path);
      if (!paths.length) return;
      const { data } = await supabase.storage.from("property-media").createSignedUrls(paths, 3600);
      if (cancelled || !data) return;
      const map: Record<string, string> = {};
      data.forEach((d, i) => { if (d.signedUrl) map[paths[i]] = d.signedUrl; });
      setUrls(map);
    })();
    return () => { cancelled = true; };
  }, [items]);
  if (!items.length) return null;
  return (
    <div className="grid grid-cols-2 gap-2">
      {items.map((m) => {
        const u = urls[m.path];
        return (
          <a key={m.path} href={u} target="_blank" rel="noreferrer" className="relative block aspect-square overflow-hidden rounded-lg border border-border bg-muted">
            {u && (m.type === "video" ? (
              <video src={u} className="h-full w-full object-cover" controls />
            ) : (
              <img src={u} alt="" className="h-full w-full object-cover" />
            ))}
            {m.type === "video" && (
              <div className="pointer-events-none absolute bottom-1 start-1 rounded bg-black/60 p-1"><VideoIcon className="h-3 w-3 text-white" /></div>
            )}
          </a>
        );
      })}
    </div>
  );
}
