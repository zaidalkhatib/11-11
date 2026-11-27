/** Launch scope (D-017): Dinner only. Legacy labels retained on the union for in-session preview cards. */
export const dateTypes = ["Dinner"] as const;
export type DateType = typeof dateTypes[number] | "Coffee" | "A little adventure" | "Something creative";
export type DatePlan = {
  type: DateType;
  itineraryId: string;
  day?: string;
  date?: string;
  time?: string;
  area?: string;
  waiting: boolean;
  notify: boolean;
  demoMatched: boolean;
  confirmed?: boolean;
};

const WEEKDAY_INDEX: Record<string, number> = {
  sun: 0,
  mon: 1,
  tue: 2,
  wed: 3,
  thu: 4,
  fri: 5,
  sat: 6,
};

const WEEKDAY_LABEL: Record<string, string> = {
  sun: "Sun",
  mon: "Mon",
  tue: "Tue",
  wed: "Wed",
  thu: "Thu",
  fri: "Fri",
  sat: "Sat",
};

/** Title-case each word. Leaves an already-cased phrase readable. */
export function sentenceWords(value: string): string {
  return value.replace(/(^|[\s-])([a-z])/g, (lead, sep: string, letter: string) => sep + letter.toUpperCase());
}

/** "7:00pm" or "7:00 PM" → "7:00 pm". */
export function formatClock(time: string): string {
  const normalized = time.trim().replace(/\u202f/g, " ").replace(/\s+/g, " ");
  const match = normalized.match(/^(\d{1,2})(?::(\d{2}))?\s*(a\.?m\.?|p\.?m\.?)$/i);
  if (!match) return normalized;
  const minute = match[2] ?? "00";
  const suffix = match[3].replace(/\./g, "").toLowerCase();
  return `${match[1]}:${minute} ${suffix}`;
}

/** Next calendar date label for a weekday key, e.g. fri → "Nov 28". */
export function nextDateLabelForWeekday(
  weekday: string,
  timeZone = "America/Los_Angeles",
  from = new Date(),
): string {
  const target = WEEKDAY_INDEX[weekday.toLowerCase().slice(0, 3)];
  if (target === undefined) return "";
  const cursor = new Date(from);
  for (let guard = 0; guard < 14; guard++) {
    const label = cursor
      .toLocaleDateString("en-US", { weekday: "short", timeZone })
      .toLowerCase()
      .slice(0, 3);
    if (WEEKDAY_INDEX[label] === target) {
      return cursor
        .toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone })
        .replace(",", "");
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return "";
}

export function formatEventWhen(parts: {
  day?: string | null;
  date?: string | null;
  time?: string | null;
}): string {
  const dayKey = parts.day?.toLowerCase().slice(0, 3) ?? "";
  const day = parts.day ? (WEEKDAY_LABEL[dayKey] ?? sentenceWords(parts.day)) : "";
  const date = parts.date ? sentenceWords(parts.date) : "";
  const time = parts.time ? formatClock(parts.time) : "";
  const head = [day, date].filter(Boolean).join(", ");
  const line = [head, time].filter(Boolean).join(" · ");
  return line || "Timing to be arranged";
}

function previewSlot(
  id: string,
  day: string,
  time: string,
  area: string,
): {
  id: string;
  day: string;
  date: string;
  time: string;
  area: string;
  title: string;
} {
  return {
    id,
    day,
    date: nextDateLabelForWeekday(day),
    time,
    area: sentenceWords(area),
    title: `Dinner in ${sentenceWords(area)}`,
  };
}

/** Preview dinner itineraries — used when the API is offline; live Events use experience UUIDs. */
export const dinnerItineraries = [
  previewSlot("fri-gaslamp", "fri", "7:00pm", "gaslamp"),
  previewSlot("sat-little-italy", "sat", "6:30pm", "little italy"),
  previewSlot("sat-north-park", "sat", "8:00pm", "north park"),
  previewSlot("sun-la-jolla", "sun", "5:30pm", "la jolla"),
  previewSlot("sun-hillcrest", "sun", "7:30pm", "hillcrest"),
] as const;

export type DinnerItinerary = {
  id: string;
  day: string;
  date: string;
  time: string;
  area: string;
  title: string;
};
export type PlanAction =
  | {
      type: "add";
      dateType: DateType;
      itineraryId: string;
      day?: string;
      date?: string;
      time?: string;
      area?: string;
    }
  | { type: "patch"; itineraryId: string; patch: Partial<Omit<DatePlan, "type" | "itineraryId">> }
  | { type: "remove"; itineraryId: string }
  | { type: "reset" };
/** Active invite after sliding to join — drives Events availability and Invites cards. */
export const hasActiveInvite = (plan: DatePlan) => plan.waiting || plan.demoMatched;
export const availableDinnerItineraries = (
  plans: DatePlan[],
  slots: readonly DinnerItinerary[] = dinnerItineraries,
) =>
  slots.filter(
    (slot) => !plans.some((plan) => plan.itineraryId === slot.id && hasActiveInvite(plan)),
  );

/** Map a public API event into the Events card shape. */
export function eventToItinerary(event: {
  id: string;
  title: string;
  neighborhood: string;
  startsAt: string;
  timeZone?: string | null;
}): DinnerItinerary {
  const zone = event.timeZone ?? "America/Los_Angeles";
  const starts = new Date(event.startsAt);
  const dayKey = starts
    .toLocaleDateString("en-US", { weekday: "short", timeZone: zone })
    .toLowerCase()
    .slice(0, 3);
  const day = WEEKDAY_LABEL[dayKey] ?? sentenceWords(dayKey);
  const date = starts
    .toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: zone })
    .replace(",", "");
  const time = formatClock(
    starts.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: zone,
    }),
  );
  const rawArea = event.neighborhood.split(",")[0]?.trim() || event.neighborhood;
  const area = sentenceWords(rawArea);
  return {
    id: event.id,
    day,
    date,
    time,
    area,
    title: /dinner/i.test(event.title) ? `Dinner in ${area}` : sentenceWords(event.title),
  };
}
export function plansReducer(plans: DatePlan[], action: PlanAction): DatePlan[] {
  if (action.type === "reset") return [];
  if (action.type === "add") {
    const existing = plans.find((plan) => plan.itineraryId === action.itineraryId);
    if (existing) {
      if (hasActiveInvite(existing)) return plans;
      return plans.map((plan) =>
        plan.itineraryId === action.itineraryId
          ? {
              ...plan,
              type: action.dateType,
              day: action.day ?? plan.day,
              date: action.date ?? plan.date,
              time: action.time ?? plan.time,
              area: action.area ?? plan.area,
            }
          : plan,
      );
    }
    return [
      ...plans,
      {
        type: action.dateType,
        itineraryId: action.itineraryId,
        day: action.day,
        date: action.date,
        time: action.time,
        area: action.area,
        waiting: false,
        notify: true,
        demoMatched: false,
      },
    ];
  }
  if (action.type === "remove") return plans.filter((plan) => plan.itineraryId !== action.itineraryId);
  return plans.map((plan) => {
    if (plan.itineraryId !== action.itineraryId) return plan;
    const next = { ...plan, ...action.patch };
    // Interest (waiting) must not force demoMatched — server interest ≠ match.
    if (!hasActiveInvite(next)) next.confirmed = false;
    return next;
  });
}
