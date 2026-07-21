import { Phone, MessageCircle } from "lucide-react";
import { telHref, whatsappHref } from "@/lib/contact";

export function ContactButtons({
  phone,
  whatsapp,
  message,
  size = "md",
}: {
  phone?: string | null;
  whatsapp?: string | null;
  message?: string;
  size?: "sm" | "md";
}) {
  const wa = whatsapp || phone;
  const cls =
    size === "sm"
      ? "h-8 w-8 rounded-lg"
      : "h-10 px-3 rounded-xl gap-1 text-xs font-semibold";
  return (
    <div className="flex items-center gap-2">
      {phone && (
        <a
          href={telHref(phone)}
          onClick={(e) => e.stopPropagation()}
          className={`inline-flex items-center justify-center bg-success text-success-foreground hover:opacity-90 ${cls}`}
          aria-label="اتصال"
        >
          <Phone className="h-4 w-4" />
          {size === "md" && <span>اتصال</span>}
        </a>
      )}
      {wa && (
        <a
          href={whatsappHref(wa, message)}
          target="_blank"
          rel="noreferrer"
          onClick={(e) => e.stopPropagation()}
          className={`inline-flex items-center justify-center bg-[#25D366] text-white hover:opacity-90 ${cls}`}
          aria-label="واتساب"
        >
          <MessageCircle className="h-4 w-4" />
          {size === "md" && <span>واتساب</span>}
        </a>
      )}
    </div>
  );
}
