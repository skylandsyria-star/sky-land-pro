export type MatchReason = { label: string; ok: boolean };

export type MatchResult<T> = {
  property: T;
  score: number;
  percent: number;
  reasons: MatchReason[];
};

function txtIncludes(a?: string | null, b?: string | null) {
  if (!a || !b) return false;
  const x = a.trim();
  const y = b.trim();
  if (!x || !y) return false;
  return x.includes(y) || y.includes(x);
}

/**
 * Compares a customer request against a property.
 * Returns null when the property violates a hard requirement.
 */
export function matchProperty(customer: any, p: any): MatchResult<any> | null {
  const reasons: MatchReason[] = [];
  let score = 0;
  let max = 0;

  // --- hard filters ---
  if (p.pipeline_status === "sold" || p.status === "sold" || p.status === "archived") return null;

  const wantedPurpose = customer.request_type === "rent" ? "rent" : "sale";
  if (p.purpose !== wantedPurpose) return null;
  reasons.push({ label: wantedPurpose === "rent" ? "مطابق للإيجار" : "مطابق للبيع", ok: true });

  if (customer.desired_property_type && p.property_type !== customer.desired_property_type) return null;
  if (customer.desired_property_type) {
    max += 3; score += 3;
    reasons.push({ label: "مطابق لنوع العقار", ok: true });
  }

  if (customer.max_budget != null && p.price != null && Number(p.price) > Number(customer.max_budget) * 1.1) {
    return null; // outside budget beyond 10% tolerance
  }

  // --- scored criteria ---
  if (customer.max_budget != null || customer.min_budget != null) {
    max += 4;
    const price = p.price != null ? Number(p.price) : null;
    const inRange =
      price != null &&
      (customer.min_budget == null || price >= Number(customer.min_budget) * 0.9) &&
      (customer.max_budget == null || price <= Number(customer.max_budget));
    if (inRange) { score += 4; reasons.push({ label: "مطابق للميزانية", ok: true }); }
    else reasons.push({ label: "خارج الميزانية قليلاً", ok: false });
  }

  if (customer.city) {
    max += 3;
    if (txtIncludes(p.city, customer.city)) { score += 3; reasons.push({ label: "مطابق للمدينة", ok: true }); }
    else reasons.push({ label: "مدينة مختلفة", ok: false });
  }

  if (customer.area) {
    max += 3;
    if (txtIncludes(p.area, customer.area) || txtIncludes(p.address, customer.area)) {
      score += 3; reasons.push({ label: "مطابق للموقع/المنطقة", ok: true });
    } else reasons.push({ label: "منطقة مختلفة", ok: false });
  }

  if (customer.min_bedrooms != null) {
    max += 3;
    if (p.bedrooms != null && Number(p.bedrooms) >= Number(customer.min_bedrooms)) {
      score += 3; reasons.push({ label: "مطابق لعدد الغرف", ok: true });
    } else reasons.push({ label: "عدد الغرف أقل من المطلوب", ok: false });
  }

  // extra specs written in customer notes (floor / area / features)
  const notes: string = customer.notes ?? "";
  if (notes.trim()) {
    const keywords: Array<[RegExp, (prop: any) => boolean, string]> = [
      [/مصعد/, (x) => !!x.elevator, "يوجد مصعد"],
      [/موقف|كراج/, (x) => !!x.parking, "يوجد موقف"],
      [/مفروش/, (x) => !!x.furnished, "مفروش"],
      [/ارضي|أرضي/, (x) => x.floor === 0, "طابق أرضي"],
    ];
    for (const [re, test, label] of keywords) {
      if (re.test(notes)) {
        max += 2;
        if (test(p)) { score += 2; reasons.push({ label, ok: true }); }
        else reasons.push({ label: `غير متوفر: ${label}`, ok: false });
      }
    }
    const areaMatch = notes.match(/(\d{2,5})\s*(م2|م²|متر)/);
    if (areaMatch) {
      max += 2;
      const wanted = Number(areaMatch[1]);
      if (p.total_area != null && Number(p.total_area) >= wanted * 0.9) {
        score += 2; reasons.push({ label: "مطابق للمساحة", ok: true });
      } else reasons.push({ label: "المساحة أقل من المطلوب", ok: false });
    }
  }

  const percent = max === 0 ? 100 : Math.round((score / max) * 100);
  return { property: p, score, percent, reasons };
}

export function matchProperties(customer: any, properties: any[]): MatchResult<any>[] {
  return properties
    .map((p) => matchProperty(customer, p))
    .filter((r): r is MatchResult<any> => r !== null)
    .sort((a, b) => b.percent - a.percent || b.score - a.score);
}
