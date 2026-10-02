import React from "react";
import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";

export type SharePdfItinerary = {
  id: string;
  pol: string;
  pod: string;
  etd: string;
  eta: string;
  etdIso: string;
  etaIso: string;
  vessel: string;
  service: string;
  shippingLine: string;
  terminalOrigin: string;
  transitDays: string;
  documentalClosing: string;
  customsClosing: string;
  imoClosing: string;
  originFreeDays: string;
  mode: string;
};

type ItinerarySharePDFProps = {
  requestorName: string;
  companyName: string;
  email: string;
  routeLabel: string;
  weekLabel: string;
  cargoType: string;
  customerMessage: string;
  generatedAt: string;
  itineraries: SharePdfItinerary[];
  logoUrl?: string;
};

const styles = StyleSheet.create({
  page: {
    paddingTop: 34,
    paddingBottom: 34,
    paddingHorizontal: 34,
    fontSize: 10,
    color: "#0f172a",
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff",
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logo: {
    width: 120,
    height: 34,
    objectFit: "contain",
  },
  titleWrap: {
    marginTop: 18,
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    color: "#0c4a83",
  },
  subtitle: {
    marginTop: 5,
    fontSize: 10,
    color: "#475569",
  },
  infoBox: {
    marginTop: 12,
    borderRadius: 10,
    border: "1 solid #dbeafe",
    backgroundColor: "#eff6ff",
    padding: 12,
  },
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: 8,
    columnGap: 12,
  },
  infoItem: {
    width: "48%",
  },
  label: {
    fontSize: 8,
    color: "#64748b",
    textTransform: "uppercase",
    marginBottom: 3,
    fontFamily: "Helvetica-Bold",
  },
  value: {
    fontSize: 10,
    color: "#0f172a",
    fontFamily: "Helvetica-Bold",
  },
  sectionTitle: {
    marginTop: 18,
    marginBottom: 8,
    fontSize: 12,
    color: "#0c4a83",
    fontFamily: "Helvetica-Bold",
  },
  table: {
    border: "1 solid #e2e8f0",
    borderRadius: 10,
    overflow: "hidden",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#0c4a83",
    color: "#ffffff",
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  row: {
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderTop: "1 solid #e2e8f0",
  },
  cellXs: { width: "10%" },
  cellSm: { width: "12%" },
  cellMd: { width: "16%" },
  cellLg: { width: "24%" },
  headerCellText: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
  },
  cellText: {
    fontSize: 8,
    color: "#0f172a",
  },
  noteBox: {
    marginTop: 14,
    borderRadius: 10,
    backgroundColor: "#fff7ed",
    border: "1 solid #fed7aa",
    padding: 10,
  },
  noteText: {
    fontSize: 9,
    color: "#9a3412",
  },
  commentsBox: {
    marginTop: 14,
    borderRadius: 10,
    backgroundColor: "#f8fafc",
    border: "1 solid #e2e8f0",
    padding: 10,
  },
  footer: {
    marginTop: 18,
    borderTop: "1 solid #e2e8f0",
    paddingTop: 12,
    fontSize: 8,
    color: "#64748b",
  },
});

export function ItinerarySharePDF({
  requestorName,
  companyName,
  email,
  routeLabel,
  weekLabel,
  cargoType,
  customerMessage,
  generatedAt,
  itineraries,
  logoUrl = "https://primeteam.com.mx/logo.png",
}: ItinerarySharePDFProps) {
  const originFreeDays =
    itineraries.find((item) => item.originFreeDays)?.originFreeDays || "";

  return (
    <Document
      title={`Solicitud de itinerario ${routeLabel}`}
      author="PrimeTeam"
      subject={`Solicitud de itinerario ${routeLabel} - ${weekLabel}`}
    >
      <Page size="A4" style={styles.page}>
        <View style={styles.topRow}>
          <View>
            <Text style={styles.title}>Solicitud de Itinerario</Text>
            <Text style={styles.subtitle}>
              Documento generado automáticamente por PrimeTeam
            </Text>
          </View>

          <Image src={logoUrl} style={styles.logo} />
        </View>

        <View style={styles.infoBox}>
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.label}>Solicitante</Text>
              <Text style={styles.value}>{requestorName || "—"}</Text>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.label}>Razón social</Text>
              <Text style={styles.value}>{companyName || "—"}</Text>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.label}>Correo</Text>
              <Text style={styles.value}>{email || "—"}</Text>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.label}>Ruta</Text>
              <Text style={styles.value}>{routeLabel || "—"}</Text>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.label}>Semana</Text>
              <Text style={styles.value}>{weekLabel || "—"}</Text>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.label}>Modalidad</Text>
              <Text style={styles.value}>{cargoType || "—"}</Text>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.label}>Generado</Text>
              <Text style={styles.value}>{generatedAt || "—"}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Itinerarios seleccionados</Text>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <View style={styles.cellSm}>
              <Text style={styles.headerCellText}>ETD</Text>
            </View>
            <View style={styles.cellSm}>
              <Text style={styles.headerCellText}>ETA</Text>
            </View>
            <View style={styles.cellLg}>
              <Text style={styles.headerCellText}>Buque / Naviera</Text>
            </View>
            <View style={styles.cellMd}>
              <Text style={styles.headerCellText}>Servicio</Text>
            </View>
            <View style={styles.cellSm}>
              <Text style={styles.headerCellText}>Tránsito</Text>
            </View>
            <View style={styles.cellMd}>
              <Text style={styles.headerCellText}>Cierres</Text>
            </View>
            <View style={styles.cellMd}>
              <Text style={styles.headerCellText}>Terminal</Text>
            </View>
          </View>

          {itineraries.map((item) => (
            <View key={item.id} style={styles.row}>
              <View style={styles.cellSm}>
                <Text style={styles.cellText}>{item.etd || "—"}</Text>
              </View>
              <View style={styles.cellSm}>
                <Text style={styles.cellText}>{item.eta || "—"}</Text>
              </View>
              <View style={styles.cellLg}>
                <Text style={styles.cellText}>
                  {(item.vessel || "—") +
                    (item.shippingLine ? ` / ${item.shippingLine}` : "")}
                </Text>
              </View>
              <View style={styles.cellMd}>
                <Text style={styles.cellText}>{item.service || "—"}</Text>
              </View>
              <View style={styles.cellSm}>
                <Text style={styles.cellText}>{item.transitDays || "—"}</Text>
              </View>
              <View style={styles.cellMd}>
                <Text style={styles.cellText}>
                  DOC: {item.documentalClosing || "—"}{"\n"}
                  ADU: {item.customsClosing || "—"}{"\n"}
                  IMO: {item.imoClosing || "—"}
                </Text>
              </View>
              <View style={styles.cellMd}>
                <Text style={styles.cellText}>{item.terminalOrigin || "—"}</Text>
              </View>
            </View>
          ))}
        </View>

        {cargoType === "FCL" ? (
          <View style={styles.noteBox}>
            <Text style={styles.noteText}>
              {originFreeDays
                ? `Para embarques FCL, considerar ${originFreeDays} días libres de almacenaje en origen.`
                : "Para embarques FCL, considerar los días libres de almacenaje en origen indicados por la naviera / terminal."}
            </Text>
          </View>
        ) : null}

        {customerMessage?.trim() ? (
          <View style={styles.commentsBox}>
            <Text style={styles.label}>Comentarios adicionales</Text>
            <Text style={styles.cellText}>{customerMessage.trim()}</Text>
          </View>
        ) : null}

        <View style={styles.footer}>
          <Text>
            Este archivo fue generado para compartir el itinerario solicitado de
            forma digital.
          </Text>
        </View>
      </Page>
    </Document>
  );
}