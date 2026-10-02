import { format } from "date-fns";
import { es } from "date-fns/locale";

// Helper para obtener el primer valor no nulo/vacío
const pickFirst = <T = any>(...vals: any[]): T | undefined => {
  for (const v of vals) {
    if (v !== undefined && v !== null && v !== "") return v as T;
  }
  return undefined;
};

// Helper para parsear fechas en varios formatos
const parseDateMaybe = (v: any): Date | null => {
  if (!v) return null;
  if (v instanceof Date) return v;

  if (typeof v === "number") {
    const d = new Date(v);
    return isNaN(d.getTime()) ? null : d;
  }

  if (typeof v === "string") {
    const d = new Date(v);
    if (!isNaN(d.getTime())) return d;

    const m = v.match(/^(\d{1,2})[\/\-](\d{1,2})(?:[\/\-](\d{2,4}))?$/);
    if (m) {
      const day = Number(m[1]);
      const month = Number(m[2]) - 1;
      const year = m[3]
        ? Number(m[3].length === 2 ? `20${m[3]}` : m[3])
        : new Date().getFullYear();

      const dd = new Date(year, month, day);
      return isNaN(dd.getTime()) ? null : dd;
    }
  }

  return null;
};

export interface PreparedItinerary {
  id: string;
  vessel: string;
  voyage: string;
  shippingLine: string;
  etd: string;
  eta: string;
  transitDays: string;
  closingDocs: string;
  closingCargo: string;
  imoClosing: string;
  originTerminal: string;
  service: string;
  remarks?: string;
}

export interface PreparedDataForExport {
  client: {
    name: string;
    company: string;
    email: string;
    phone: string;
    message: string;
    responsibleName?: string;
    responsibleEmail?: string;
    isDashboard?: boolean;
  };
  quote: {
    code: string;
    documentDate: string;
  };
  summary: {
    origin: string;
    destination: string;
    cargoType: "FCL" | "LCL";
    shippingLine: string;
    vessel: string;
    voyage: string;
  };
  itineraries: PreparedItinerary[];
}

export interface ReservationPayload {
  contactInfo: {
    name: string;
    company: string;
    email: string;
    phone: string;
    message: string;
  };
  requestDetails: {
    originPortName: string;
    destinationPortName: string;
    cargoType: "FCL" | "LCL";
  };
  selectedItineraries: Array<{
    id: string;
    vessel: string;
    voyage: string;
    shippingLine: string;
  }>;
}

interface RawData {
  selectedItineraries: Array<{
    it: any;
    id: string;
    idx?: number;
  }>;
  formData: {
    nombre: string;
    correo: string;
    telefono: string;
    empresa: string;
    mensaje: string;
  };
  selectedPol: {
    _id: string;
    name: string;
  } | null;
  selectedPod: {
    _id: string;
    name: string;
  } | null;
  cargoType: "FCL" | "LCL";
  isDashboard?: boolean;
}

/**
 * Transforma los datos crudos del componente en una estructura limpia y unificada.
 */
export function prepareDataForExport(rawData: RawData): {
  pdfData: PreparedDataForExport;
  reservationPayload: ReservationPayload;
} {
  const {
    selectedItineraries,
    formData,
    selectedPol,
    selectedPod,
    cargoType,
    isDashboard = false,
  } = rawData;

  const shippingLineSet = new Set<string>();
  const vesselSet = new Set<string>();
  const voyageSet = new Set<string>();
  const polSet = new Set<string>();
  const podSet = new Set<string>();

  const preparedItineraries: PreparedItinerary[] = selectedItineraries.map(
    ({ it, id }) => {
      const etd = parseDateMaybe(
        pickFirst(it?.etd, it?.ETD, it?.departureDate)
      );
      const eta = parseDateMaybe(
        pickFirst(it?.eta, it?.ETA, it?.arrivalDate)
      );
      const closureDocs = parseDateMaybe(
        pickFirst(
    it?.final_doc_closing, 
    it?.closing_doc,       // <-- Probable nombre en BD
    it?.doc_closing,       // <-- Probable nombre en BD
    it?.closingDocs, 
    it?.cutoff1
  )
      );
      const closureCargo = parseDateMaybe(
       pickFirst(
    it?.final_customs_closing, 
    it?.closing_cargo,     // <-- Probable nombre en BD
    it?.cargo_closing,     // <-- Probable nombre en BD
    it?.closingCargo, 
    it?.cutoff2
  )
      );

      const vessel = String(
        pickFirst(it?.vessel, it?.vesselName, "N/A")
      );
      const voyage = String(
        pickFirst(it?.voyage, it?.viaje, "N/A")
      );
      const shippingLine = String(
        pickFirst(it?.shippingLine, it?.carrier, "N/A")
      );
      const transitDays = pickFirst<number>(
        it?.transit_time,
        it?.transitDays,
        it?.transit_days
      );

      const pol = String(pickFirst(it?.pol, it?.originPort, "N/A"));
      const pod = String(pickFirst(it?.pod, it?.destinationPort, "N/A"));

      vesselSet.add(vessel);
      voyageSet.add(voyage);
      shippingLineSet.add(shippingLine);
      if (pol !== "N/A") polSet.add(pol);
      if (pod !== "N/A") podSet.add(pod);

      return {
        id,
        vessel,
        voyage,
        shippingLine,
        etd: etd ? format(etd, "dd MMM yyyy", { locale: es }).toUpperCase() : "N/A",
        eta: eta ? format(eta, "dd MMM yyyy", { locale: es }).toUpperCase() : "N/A",
        transitDays: transitDays ? `${transitDays} DÍAS` : "N/A",
        closingDocs: closureDocs
          ? format(closureDocs, "dd MMM yyyy", { locale: es }).toUpperCase()
          : "N/A",
        closingCargo: closureCargo
          ? format(closureCargo, "dd MMM yyyy", { locale: es }).toUpperCase()
          : "N/A",
        imoClosing: String(pickFirst(it?.imoCutoff, "N/A")),
        originTerminal: String(
          pickFirst(it?.terminal, it?.originTerminal, "N/A")
        ),
        service: String(pickFirst(it?.service, it?.servicio, "N/A")),
        remarks: String(pickFirst(it?.remarks, it?.observaciones, "")),
      };
    }
  );

  // Obtener datos del responsable del primer itinerario (si existe)
  const firstIt = selectedItineraries[0]?.it;
  const responsibleName = firstIt?.responsibleName || firstIt?.responsable || "";
  const responsibleEmail = firstIt?.responsibleEmail || "";
  const itineraryRemarks = preparedItineraries[0]?.remarks || "";

  const getSummaryValue = (set: Set<string>, defaultValue: string = "N/A") => {
    if (set.size === 1) {
      const first = set.values().next().value;
      return typeof first === "string" ? first : defaultValue;
    }
    return set.size > 1 ? "Varios" : defaultValue;
  };

  const pdfData: PreparedDataForExport = {
    client: {
      name: formData.nombre,
      company: formData.empresa,
      email: formData.correo,
      phone: formData.telefono,
      message: isDashboard ? (itineraryRemarks || formData.mensaje) : formData.mensaje,
      responsibleName,
      responsibleEmail,
      isDashboard,
    },
    quote: {
      code: `PT-${format(new Date(), "yyyyMMdd")}-${Math.random()
        .toString(36)
        .slice(2, 6)
        .toUpperCase()}`,
      documentDate: format(new Date(), "dd 'de' MMMM 'de' yyyy", {
        locale: es,
      }),
    },
    summary: {
      origin: selectedPol?.name || getSummaryValue(polSet),
      destination: selectedPod?.name || getSummaryValue(podSet),
      cargoType,
      shippingLine: getSummaryValue(shippingLineSet),
      vessel: getSummaryValue(vesselSet),
      voyage: getSummaryValue(voyageSet),
    },
    itineraries: preparedItineraries,
  };

  const reservationPayload: ReservationPayload = {
    contactInfo: {
      name: formData.nombre,
      company: formData.empresa,
      email: formData.correo,
      phone: formData.telefono,
      message: formData.mensaje,
    },
    requestDetails: {
      originPortName: selectedPol?.name || "N/A",
      destinationPortName: selectedPod?.name || "N/A",
      cargoType,
    },
    selectedItineraries: preparedItineraries.map((it) => ({
      id: it.id,
      vessel: it.vessel,
      voyage: it.voyage,
      shippingLine: it.shippingLine,
    })),
  };

  return {
    pdfData,
    reservationPayload,
  };
}