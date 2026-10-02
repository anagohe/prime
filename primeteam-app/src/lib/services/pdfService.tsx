import React from "react";
import { pdf } from "@react-pdf/renderer";
import { ItineraryPDF } from "@/components/pdf/ItineraryPDF";
import type { PreparedDataForExport } from "../transformers/itineraryTransformer";

/**
 * Dispara la descarga de un Blob en el navegador.
 */
const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");

  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  URL.revokeObjectURL(url);
};

const normalizeFilePart = (value: unknown): string =>
  String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toUpperCase()
    .replace(/\s*-\s*/g, "-")
    .replace(/[\s_/]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

/**
 * Genera el PDF a partir de los datos y dispara la descarga.
 */
export const generateAndDownloadPDF = async (
  data: PreparedDataForExport
): Promise<boolean> => {
  try {
    const blob = await pdf(<ItineraryPDF data={data} />).toBlob();

    const quote = (data as any)?.quote ?? {};
    const origin =
      quote.origin ??
      quote.pol ??
      quote.originPort ??
      quote.portOfLoading ??
      quote.origen ??
      "";
    const destination =
      quote.destination ??
      quote.pod ??
      quote.destinationPort ??
      quote.portOfDischarge ??
      quote.destino ??
      "";
    const weekNumber =
      quote.weekNumber ?? quote.week ?? quote.week_number ?? quote.semana ?? "";

    const route = normalizeFilePart(`${origin}-${destination}`);
    const week = normalizeFilePart(weekNumber);

    downloadBlob(
      blob,
      `SOLICITUD-DE-ITINERARIO_${route}_W-${week}.pdf`
    );
    return true;
  } catch (error) {
    console.error("Error generating PDF:", error);
    return false;
  }
};