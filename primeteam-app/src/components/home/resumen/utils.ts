import type { Itinerary, NormalizedItinerary } from "./types";

export const CALENDAR_STYLES = `
  .no-scrollbar::-webkit-scrollbar {
    display: none;
  }
  .no-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }

  .rdp {
    --rdp-cell-size: 18px;
    --rdp-accent-color: #f59e0b;
    --rdp-background-color: #fde68a;
    --rdp-day-border-radius: 9999px;
    --rdp-day-font-weight: 700;
    margin: 0;
    font-size: 0.56rem;
  }

  .rdp button {
    cursor: pointer;
  }

  .rdp-months {
    gap: 0;
  }

  .rdp-month {
    width: auto;
  }

  .rdp-caption {
    padding: 0 0 0.15rem 0;
    margin-bottom: 0.05rem;
  }

  .rdp-caption_label {
    font-size: 0.64rem;
    font-weight: 800;
  }

  .rdp-nav {
    gap: 0;
  }

  .rdp-button_previous,
  .rdp-button_next {
    width: 18px;
    height: 18px;
    min-width: 18px;
    min-height: 18px;
    cursor: pointer;
  }

  .rdp-head_row,
  .rdp-row {
    height: 19px;
  }

  .rdp-head_cell {
    font-size: 0.5rem;
    font-weight: 700;
    padding: 0;
  }

  .rdp-day {
    width: 18px;
    height: 18px;
    font-size: 0.56rem;
    padding: 0;
  }

  .rdp-day_button {
    cursor: pointer;
  }

  .rdp-table,
  .rdp-month_grid {
    width: auto;
  }

  .rdp-weekday {
    opacity: 0.75;
  }
`;

export const FORM_INPUT_CLASS =
  "w-full bg-slate-50 border border-slate-100 rounded-[12px] px-4 py-3 text-sm font-medium outline-none focus:border-[#f59e0b] focus:bg-white transition-all";

export function clsx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function getItineraryId(it: Itinerary, idx: number) {
  return String(it?._id ?? it?.id ?? it?.itineraryId ?? it?.uuid ?? idx);
}

export function pickFirst<T = any>(...values: any[]): T | undefined {
  for (const value of values) {
    if (value !== undefined && value !== null && value !== "") {
      return value as T;
    }
  }
  return undefined;
}

export function cleanLooseString(value: any) {
  const text = String(value ?? "").trim();
  if (!text) return "";
  const lowered = text.toLowerCase();
  if (lowered === "undefined" || lowered === "null") return "";
  return text;
}

export function getImoDisplayValue(value: string) {
  return cleanLooseString(value) || "N/A";
}

export function createLocalDate(year: number, monthIndex: number, day: number) {
  return new Date(year, monthIndex, day, 12, 0, 0, 0);
}

export function toLocalDay(date: Date) {
  return createLocalDate(date.getFullYear(), date.getMonth(), date.getDate());
}

export function addLocalDays(date: Date, days: number) {
  const next = toLocalDay(date);
  next.setDate(next.getDate() + days);
  return toLocalDay(next);
}

export function isSameOrAfterLocalDay(date: Date, minDate: Date) {
  return toLocalDay(date).getTime() >= toLocalDay(minDate).getTime();
}

export function isWithinLocalRange(date: Date, from: Date, to: Date) {
  const time = toLocalDay(date).getTime();
  const fromTime = toLocalDay(from).getTime();
  const toTime = toLocalDay(to).getTime();
  return time >= fromTime && time <= toTime;
}

export function getDateSortTime(date: Date | null) {
  return date ? toLocalDay(date).getTime() : Number.MAX_SAFE_INTEGER;
}

export function parseDateMaybe(value: any): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;

  if (typeof value === "number") {
    const parsed = new Date(value);
    return isNaN(parsed.getTime()) ? null : parsed;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return null;

    const isoDateOnly = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (isoDateOnly) {
      const year = Number(isoDateOnly[1]);
      const month = Number(isoDateOnly[2]) - 1;
      const day = Number(isoDateOnly[3]);
      const parsedLocal = createLocalDate(year, month, day);
      return isNaN(parsedLocal.getTime()) ? null : parsedLocal;
    }

    const dayFirstMatch = trimmed.match(
      /^(\d{1,2})[\/\-](\d{1,2})(?:[\/\-](\d{2,4}))?$/
    );
    if (dayFirstMatch) {
      const day = Number(dayFirstMatch[1]);
      const month = Number(dayFirstMatch[2]) - 1;
      const year = dayFirstMatch[3]
        ? Number(
            dayFirstMatch[3].length === 2
              ? `20${dayFirstMatch[3]}`
              : dayFirstMatch[3]
          )
        : new Date().getFullYear();

      const parsedLocal = createLocalDate(year, month, day);
      return isNaN(parsedLocal.getTime()) ? null : parsedLocal;
    }

    const parsed = new Date(trimmed);
    if (!isNaN(parsed.getTime())) return parsed;
  }

  return null;
}

export function fmtDayMonthEs(date: Date | null) {
  if (!date) return "—";
  const day = date.getDate();
  const month = date
    .toLocaleString("es-MX", { month: "short" })
    .replace(".", "");
  return `${day} ${month}`;
}

export function fmtShortEs(date: Date | null) {
  if (!date) return "—";
  const day = String(date.getDate()).padStart(2, "0");
  const month = date
    .toLocaleString("es-MX", { month: "short" })
    .toUpperCase()
    .replace(".", "");
  return `${day} / ${month}`;
}

export function normalizeItinerary(it: Itinerary): NormalizedItinerary {
  return {
    etd: parseDateMaybe(
      pickFirst(
        it?.final_etd,
        it?.etd,
        it?.ETD,
        it?.departureDate,
        it?.departure,
        it?.salida
      )
    ),
    eta: parseDateMaybe(
      pickFirst(
        it?.final_eta,
        it?.eta,
        it?.ETA,
        it?.arrivalDate,
        it?.arrival,
        it?.llegada
      )
    ),
    closureDocs: parseDateMaybe(
      pickFirst(
        it?.final_doc_closing,
        it?.cutoff1,
        it?.closingDocs,
        it?.closing1,
        it?.cierre1
      )
    ),
    closureCargo: parseDateMaybe(
      pickFirst(
        it?.final_customs_closing,
        it?.cutoff2,
        it?.closingCargo,
        it?.closing2,
        it?.cierre2
      )
    ),
    vessel: String(
      pickFirst(
        it?.vessel,
        it?.vesselName,
        it?.ship,
        it?.serviceName,
        it?.voyage,
        it?.viaje,
        "Itinerario"
      )
    ),
    transitDays: pickFirst<string | number>(
      it?.final_transit_time_days,
      it?.transit_time,
      it?.transitDays,
      it?.transit_days,
      it?.diasTransito,
      it?.dias_de_transito
    ),
    imoClosing: cleanLooseString(
      pickFirst(
        it?.imoCutoff,
        it?.cutoffIMO,
        it?.cutoff_imo,
        it?.cierreIMO,
        ""
      )
    ),
    shippingLine: String(
      pickFirst(it?.carrier, it?.shippingLine, it?.naviera, it?.line, "—")
    ),
    terminal: String(
      pickFirst(
        it?.originTerminal,
        it?.terminalOrigin,
        it?.terminal_origen,
        it?.terminal,
        "—"
      )
    ),
    service: String(pickFirst(it?.service, it?.servicio, it?.svc, "—")),
  };
}