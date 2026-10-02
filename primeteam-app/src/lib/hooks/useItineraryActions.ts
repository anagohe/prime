"use client";

import React, { useState } from "react";
import { pdf } from "@react-pdf/renderer";
import { ItineraryPDF } from "@/components/pdf/ItineraryPDF";
import type { PreparedDataForExport } from "@/lib/transformers/itineraryTransformer";

type GenericRecord = Record<string, unknown>;

type NamedItem =
  | {
      name?: string | null;
    }
  | null
  | undefined;

type HookParams = {
  selectedItineraries: Array<
    | {
        id?: string;
        idx?: number;
        it?: GenericRecord;
      }
    | GenericRecord
  >;
  formData?: GenericRecord | null;
  selectedPol?: NamedItem;
  selectedPod?: NamedItem;
  cargoType?: string;
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
};

type NormalizedShareItinerary = {
  id: string;
  pol: string;
  pod: string;
  etd: string;
  eta: string;
  etdIso: string;
  etaIso: string;
  vessel: string;
  voyage: string;
  service: string;
  shippingLine: string;
  terminalOrigin: string;
  transitDays: string;
  closingDocs: string;
  closingCargo: string;
  imoClosing: string;
  originFreeDays: string;
  mode: string;
};

type ShareItineraryApiPayload = {
  toEmail: string;
  requestorName: string;
  companyName: string;
  cargoType: string;
  routeLabel: string;
  weekLabel: string;
  freeDaysOrigin: string;
  pdfBase64: string;
  pdfFileName: string;
  tableRows: Array<{
    id: string;
    vessel: string;
    voyage: string;
    etd: string;
    closingDocs: string;
    closingCargo: string;
    eta: string;
    transitDays: string;
  }>;
};

function isRecord(value: unknown): value is GenericRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getStringValue(source: GenericRecord, keys: string[]): string {
  for (const key of keys) {
    const value = source[key];

    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number") return String(value);
  }

  return "";
}

function getFormValue(
  source: GenericRecord | null | undefined,
  keys: string[]
): string {
  if (!source) return "";

  for (const key of keys) {
    const value = source[key];

    if (typeof value === "string" && value.trim()) return value.trim();
  }

  return "";
}

function parseDate(value: string): Date | null {
  if (!value) return null;

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatShortDate(value: string): string {
  const parsed = parseDate(value);

  if (!parsed) return value || "N/A";

  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
    .format(parsed)
    .replace(/\./g, "");
}

function formatDocumentDate(date: Date): string {
  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
    .format(date)
    .replace(/\./g, "");
}

function getIsoWeek(date: Date): number {
  const tmp = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  );
  const day = tmp.getUTCDay() || 7;

  tmp.setUTCDate(tmp.getUTCDate() + 4 - day);

  const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1));

  return Math.ceil(
    (((tmp.getTime() - yearStart.getTime()) / 86400000) + 1) / 7
  );
}

function sanitizeSegment(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = filename;
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  window.setTimeout(() => URL.revokeObjectURL(url), 1200);
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onloadend = () => {
      if (typeof reader.result !== "string") {
        reject(new Error("No se pudo convertir el PDF a base64."));
        return;
      }

      const base64 = reader.result.split(",")[1];

      if (!base64) {
        reject(new Error("El PDF generado no contiene datos válidos."));
        return;
      }

      resolve(base64);
    };

    reader.onerror = () => {
      reject(new Error("No se pudo leer el PDF generado."));
    };

    reader.readAsDataURL(blob);
  });
}

function uniqueNonEmpty(values: string[]): string[] {
  return Array.from(
    new Set(values.map((value) => value.trim()).filter(Boolean))
  );
}

function normalizeSelectedItinerary(
  item: HookParams["selectedItineraries"][number],
  index: number,
  defaultPol: string,
  defaultPod: string,
  cargoType: string
): NormalizedShareItinerary {
  const raw =
    isRecord(item) && isRecord(item.it)
      ? item.it
      : isRecord(item)
      ? item
      : ({} as GenericRecord);

  const etdIso = getStringValue(raw, [
    "final_etd",
    "etd",
    "ETD",
    "departureDate",
    "departure",
    "salida",
  ]);

  const etaIso = getStringValue(raw, [
    "final_eta",
    "eta",
    "ETA",
    "arrivalDate",
    "arrival",
    "llegada",
  ]);

  const pol =
    defaultPol ||
    getStringValue(raw, [
      "pol",
      "POL",
      "origin",
      "origen",
      "originPort",
      "portOfLoading",
      "final_pol",
    ]) ||
    "N/A";

  const pod =
    defaultPod ||
    getStringValue(raw, [
      "pod",
      "POD",
      "destination",
      "destino",
      "destinationPort",
      "portOfDischarge",
      "final_pod",
    ]) ||
    "N/A";

  const vessel =
    getStringValue(raw, ["vessel", "vesselName", "ship", "buque"]) || "N/A";

  const voyage =
    getStringValue(raw, [
      "voyage",
      "voyageNumber",
      "voyageNo",
      "viaje",
      "serviceName",
      "service",
    ]) || "N/A";

  return {
    id:
      (isRecord(item) && typeof item.id === "string" && item.id) ||
      `${pol}-${pod}-${etdIso || "sin-fecha"}-${index}`,
    pol,
    pod,
    etd: formatShortDate(etdIso),
    eta: formatShortDate(etaIso),
    etdIso,
    etaIso,
    vessel,
    voyage,
    service:
      getStringValue(raw, ["service", "servicio", "serviceName"]) || "N/A",
    shippingLine:
      getStringValue(raw, ["carrier", "shippingLine", "naviera", "line"]) ||
      "N/A",
    terminalOrigin:
      getStringValue(raw, [
        "originTerminal",
        "terminalOrigin",
        "terminal_origen",
        "terminal",
      ]) || "N/A",
    transitDays:
      getStringValue(raw, [
        "final_transit_time_days",
        "transit_time",
        "transitDays",
        "transit_days",
        "diasTransito",
        "dias_de_transito",
      ]) || "N/A",
    closingDocs:
      getStringValue(raw, [
        "final_doc_closing",
        "cutoff1",
        "closingDocs",
        "closing1",
        "cierre1",
      ]) || "N/A",
    closingCargo:
      getStringValue(raw, [
        "final_customs_closing",
        "cutoff2",
        "closingCargo",
        "closing2",
        "cierre2",
      ]) || "N/A",
    imoClosing:
      getStringValue(raw, [
        "imoCutoff",
        "cutoffIMO",
        "cutoff_imo",
        "cierreIMO",
      ]) || "N/A",
    originFreeDays:
      getStringValue(raw, [
        "originFreeDays",
        "freeDaysOrigin",
        "diasLibresOrigen",
        "free_days_origin",
        "final_origin_free_days",
      ]) || "",
    mode: cargoType || "N/A",
  };
}

function buildPreparedDataForPdf(params: {
  itineraries: NormalizedShareItinerary[];
  fullName: string;
  companyName: string;
  email: string;
  phone: string;
  customerMessage: string;
  selectedPolName: string;
  selectedPodName: string;
}): PreparedDataForExport {
  const {
    itineraries,
    fullName,
    companyName,
    email,
    phone,
    customerMessage,
    selectedPolName,
    selectedPodName,
  } = params;

  const shippingLines = uniqueNonEmpty(
    itineraries
      .map((item) => item.shippingLine)
      .filter((value) => value !== "N/A")
  );

  const origin = selectedPolName || itineraries[0]?.pol || "N/A";
  const destination = selectedPodName || itineraries[0]?.pod || "N/A";

  const exportData = {
    summary: {
      shippingLine: shippingLines[0] || "N/A",
      origin,
      destination,
    },
    quote: {
      documentDate: formatDocumentDate(new Date()),
    },
    itineraries: itineraries.map((item) => ({
      id: item.id,
      vessel: item.vessel,
      voyage: item.voyage,
      etd: item.etd,
      closingDocs: item.closingDocs,
      closingCargo: item.closingCargo,
      eta: item.eta,
      transitDays: item.transitDays,
    })),
    client: {
      isDashboard: false,
      name: fullName || "N/A",
      responsibleName: "",
      responsibleEmail: "",
      company: companyName || "N/A",
      email: email || "N/A",
      phone: phone || "N/A",
      message: customerMessage || "",
    },
  } as unknown as PreparedDataForExport;

  return exportData;
}

export function useItineraryActions({
  selectedItineraries,
  formData,
  selectedPol,
  selectedPod,
  cargoType = "",
  onSuccess,
  onError,
}: HookParams) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmitReservation = async (
    event?:
      | React.FormEvent<HTMLFormElement>
      | React.MouseEvent<HTMLButtonElement>
  ) => {
    event?.preventDefault?.();

    if (isLoading) return;

    const fullName = getFormValue(formData, ["fullName", "name"]);
    const companyName = getFormValue(formData, [
      "companyName",
      "company",
      "businessName",
      "razonSocial",
    ]);
    const email = getFormValue(formData, ["email"]);
    const phone = getFormValue(formData, ["phone", "telephone", "telefono"]);
    const customerMessage = getFormValue(formData, ["message", "comments"]);

    if (!fullName || !companyName || !email) {
      onError?.("Completa nombre, razón social y correo antes de compartir.");
      return;
    }

    if (!selectedItineraries?.length) {
      onError?.("Selecciona al menos un itinerario antes de compartir.");
      return;
    }

    setIsLoading(true);

    try {
      const selectedPolName =
        (typeof selectedPol?.name === "string" && selectedPol.name.trim()) || "";
      const selectedPodName =
        (typeof selectedPod?.name === "string" && selectedPod.name.trim()) || "";

      const normalized = selectedItineraries
        .map((item, index) =>
          normalizeSelectedItinerary(
            item,
            index,
            selectedPolName,
            selectedPodName,
            cargoType
          )
        )
        .sort((a, b) => {
          const aTime =
            parseDate(a.etdIso)?.getTime() ?? Number.MAX_SAFE_INTEGER;
          const bTime =
            parseDate(b.etdIso)?.getTime() ?? Number.MAX_SAFE_INTEGER;
          return aTime - bTime;
        });

      const routeLabel = `${selectedPolName || normalized[0]?.pol || "POL"} - ${
        selectedPodName || normalized[0]?.pod || "POD"
      }`;

      const firstDate = parseDate(normalized[0]?.etdIso || "");
      const weekLabel = firstDate
        ? `SEMANA ${getIsoWeek(firstDate)}`
        : "SEMANA SIN FECHA";

      const exportData = buildPreparedDataForPdf({
        itineraries: normalized,
        fullName,
        companyName,
        email,
        phone,
        customerMessage,
        selectedPolName,
        selectedPodName,
      });

      const safeFileName = [
        "solicitud-itinerario",
        sanitizeSegment(routeLabel),
        sanitizeSegment(weekLabel),
        sanitizeSegment(companyName),
      ]
        .filter(Boolean)
        .join("_");

      const pdfFileName = `${safeFileName}.pdf`;

      const PdfComponent = ItineraryPDF as React.ComponentType<{
        data: PreparedDataForExport;
      }>;

      const pdfElement = React.createElement(PdfComponent, {
        data: exportData,
      });

      const pdfBlob = await pdf(
        pdfElement as NonNullable<Parameters<typeof pdf>[0]>
      ).toBlob();

      downloadBlob(pdfBlob, pdfFileName);

      const pdfBase64 = await blobToBase64(pdfBlob);

      const freeDaysOrigin =
        uniqueNonEmpty(
          normalized
            .map((item) => item.originFreeDays)
            .filter((value) => value !== "N/A")
        )[0] || "";

      const payload: ShareItineraryApiPayload = {
        toEmail: email,
        requestorName: fullName,
        companyName,
        cargoType,
        routeLabel,
        weekLabel,
        freeDaysOrigin,
        pdfBase64,
        pdfFileName,
        tableRows: normalized.map((item) => ({
          id: item.id,
          vessel: item.vessel,
          voyage: item.voyage,
          etd: item.etd,
          closingDocs: item.closingDocs,
          closingCargo: item.closingCargo,
          eta: item.eta,
          transitDays: item.transitDays,
        })),
      };

      const response = await fetch("/api/share-itinerary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = (await response.json()) as {
        ok?: boolean;
        error?: string;
      };

      if (!response.ok || !result.ok) {
        throw new Error(
          result.error || "No se pudo enviar el correo del itinerario."
        );
      }

      onSuccess?.(
        "El PDF se descargó correctamente y también se envió por correo."
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Ocurrió un error al compartir el itinerario.";

      onError?.(message);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    handleSubmitReservation,
  };
}