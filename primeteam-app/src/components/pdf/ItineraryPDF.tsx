import React from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import type { PreparedDataForExport } from "@/lib/transformers/itineraryTransformer";

const COLORS = {
  primary: "#1A5A96",
  secondary: "#3B8E46",
  tertiary: "#EAA320",
  accent: "#F9FAFB",
  textMain: "#1F2937",
  textMuted: "#6B7280",
  border: "#E5E7EB",
  lightBlue: "rgba(26, 90, 150, 0.05)",
};

const styles = StyleSheet.create({
  page: {
    paddingTop: 42,
    paddingBottom: 42,
    paddingHorizontal: 40,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: COLORS.textMain,
    backgroundColor: "#FFFFFF",
  },

  documentContainer: {
    width: "100%",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
    paddingBottom: 15,
    marginBottom: 24,
  },

  headerLogoWrap: {
    width: 220,
    justifyContent: "center",
    alignItems: "flex-start",
  },

  logoImage: {
    width: 220,
    height: 60,
    objectFit: "contain",
  },

  headerInfo: {
    alignItems: "flex-end",
    textAlign: "right",
  },

  headerTitle: {
    fontSize: 18,
    color: COLORS.primary,
    fontWeight: "bold",
    textTransform: "uppercase",
    marginBottom: 6,
  },

  headerDate: {
    backgroundColor: COLORS.accent,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 4,
    paddingVertical: 4,
    paddingHorizontal: 10,
    fontSize: 8.5,
    color: COLORS.textMain,
    fontWeight: "bold",
  },

  summarySection: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 26,
  },

  summaryCard: {
    flex: 1,
    backgroundColor: COLORS.accent,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 6,
    padding: 14,
  },

  summaryCardYellow: {
    borderTopWidth: 3,
    borderTopColor: COLORS.tertiary,
  },

  summaryCardGreen: {
    borderTopWidth: 3,
    borderTopColor: COLORS.secondary,
  },

  summaryCardBlue: {
    borderTopWidth: 3,
    borderTopColor: COLORS.primary,
  },

  summaryLabel: {
    fontSize: 7.5,
    textTransform: "uppercase",
    color: COLORS.textMuted,
    fontWeight: "bold",
    marginBottom: 6,
    letterSpacing: 0.5,
  },

  summaryValueRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  summaryValue: {
    fontSize: 10.5,
    color: COLORS.primary,
    fontWeight: "bold",
    flexShrink: 1,
  },

  itinerariesSection: {
    marginBottom: 26,
  },

  table: {
    width: "100%",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 6,
    overflow: "hidden",
  },

  tableHeaderRow: {
    flexDirection: "row",
    backgroundColor: COLORS.primary,
  },

  tableBodyRow: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },

  tableBodyRowAlt: {
    backgroundColor: COLORS.accent,
  },

  th: {
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRightWidth: 1,
    borderRightColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },

  thLast: {
    borderRightWidth: 0,
  },

  thText: {
    color: "#FFFFFF",
    fontSize: 8,
    fontWeight: "bold",
    textTransform: "uppercase",
    textAlign: "center",
  },

  td: {
    paddingVertical: 11,
    paddingHorizontal: 8,
    borderRightWidth: 1,
    borderRightColor: COLORS.border,
    justifyContent: "center",
  },

  tdLast: {
    borderRightWidth: 0,
    backgroundColor: COLORS.lightBlue,
  },

  tdText: {
    fontSize: 8.5,
    color: COLORS.textMain,
    textAlign: "center",
  },

  tdTextLeft: {
    fontSize: 8.5,
    color: COLORS.textMain,
    textAlign: "left",
  },

  vesselName: {
    color: COLORS.secondary,
    fontWeight: "bold",
  },

  voyageNumber: {
    color: COLORS.primary,
    fontWeight: "bold",
  },

  transitText: {
    color: COLORS.primary,
    fontWeight: "bold",
    fontSize: 8.5,
    textAlign: "center",
  },

  colVessel: { width: "28%" },
  colDate: { width: "14%" },
  colTransit: { width: "16%" },

  clientSection: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 18,
    marginBottom: 24,
    backgroundColor: "#FFFFFF",
  },

  sectionTitle: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: "bold",
    textTransform: "uppercase",
    marginBottom: 0,
  },

  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },

  sectionTitleSquare: {
    width: 11,
    height: 11,
    borderRadius: 2,
    marginRight: 8,
    backgroundColor: COLORS.primary,
  },

  clientGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },

  clientFieldHalf: {
    width: "48%",
    marginBottom: 10,
  },

  clientFieldFull: {
    width: "100%",
  },

  clientLabel: {
    fontSize: 7.5,
    textTransform: "uppercase",
    color: COLORS.textMuted,
    fontWeight: "bold",
    marginBottom: 4,
    letterSpacing: 0.5,
  },

  clientValue: {
    fontSize: 10,
    color: COLORS.textMain,
  },

  clientMessageBox: {
    backgroundColor: COLORS.accent,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.border,
    borderRadius: 6,
    padding: 14,
    marginTop: 4,
  },

  clientMessageText: {
    fontSize: 9.5,
    color: "#4B5563",
    fontStyle: "italic",
    lineHeight: 1.5,
  },

  footer: {
    marginTop: 10,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  footerLeft: {
    width: "52%",
  },

  footerRight: {
    width: "40%",
  },

  footerContact: {
    fontSize: 8,
    color: COLORS.textMuted,
    lineHeight: 1.5,
  },

  footerContactStrong: {
    color: COLORS.primary,
    fontSize: 9,
    fontWeight: "bold",
  },

  footerNote: {
    fontSize: 7.5,
    color: COLORS.textMuted,
    textAlign: "right",
    lineHeight: 1.5,
  },
});

interface ItineraryPDFProps {
  data: PreparedDataForExport;
}

const cleanSummaryValue = (value?: string) => {
  if (!value) return "N/A";

  return value
    .replace(/^\s+/, "")
    .replace(/^(?:ô|=Í|=í|Ã­|Ã³|Ã±|â€¢|â€“|â€”|ï»¿|)+\s*/u, "")
    .replace(/^[^\p{L}\p{N}]+/u, "")
    .trim();
};

export const ItineraryPDF = ({ data }: ItineraryPDFProps) => {
  const clientMessage = data.client.message?.trim();

  const shippingLine = cleanSummaryValue(data.summary.shippingLine);
  const origin = cleanSummaryValue(data.summary.origin);
  const destination = cleanSummaryValue(data.summary.destination);

  const isDashboard = data.client.isDashboard;

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        <View style={styles.documentContainer}>
          <View style={styles.header}>
            <View style={styles.headerLogoWrap}>
              <Image src="/logo-color.png" style={styles.logoImage} />
            </View>

            <View style={styles.headerInfo}>
              <Text style={styles.headerTitle}>Resumen de Itinerarios</Text>
              <Text style={styles.headerDate}>
                Fecha: {data.quote.documentDate}
              </Text>
            </View>
          </View>

          <View style={styles.summarySection}>
            <View style={[styles.summaryCard, styles.summaryCardYellow]}>
              <Text style={styles.summaryLabel}>Línea Naviera</Text>
              <View style={styles.summaryValueRow}>
                <Text style={styles.summaryValue}>
                  {isDashboard ? "Primeteam" : shippingLine}
                </Text>
              </View>
            </View>

            <View style={[styles.summaryCard, styles.summaryCardGreen]}>
              <Text style={styles.summaryLabel}>POL (Puerto de Carga)</Text>
              <View style={styles.summaryValueRow}>
                <Text style={styles.summaryValue}>{origin}</Text>
              </View>
            </View>

            <View style={[styles.summaryCard, styles.summaryCardBlue]}>
              <Text style={styles.summaryLabel}>POD (Puerto de Descarga)</Text>
              <View style={styles.summaryValueRow}>
                <Text style={styles.summaryValue}>{destination}</Text>
              </View>
            </View>
          </View>

          <View style={styles.itinerariesSection}>
            <View style={styles.table}>
              <View style={styles.tableHeaderRow}>
                <View style={[styles.th, styles.colVessel]}>
                  <Text style={styles.thText}>Buque y Viaje</Text>
                </View>
                <View style={[styles.th, styles.colDate]}>
                  <Text style={styles.thText}>ETD</Text>
                </View>
                <View style={[styles.th, styles.colDate]}>
                  <Text style={styles.thText}>{"CIERRE\nDOCUMENTAL"}</Text>
                </View>
                <View style={[styles.th, styles.colDate]}>
                  <Text style={styles.thText}>{"CIERRE\nADUANAL"}</Text>
                </View>
                <View style={[styles.th, styles.colDate]}>
                  <Text style={styles.thText}>ETA</Text>
                </View>
                <View style={[styles.th, styles.colTransit, styles.thLast]}>
                  <Text style={styles.thText}>T/T</Text>
                </View>
              </View>

              {data.itineraries.map((it, index) => (
                <View
                  key={it.id}
                  style={[
                    styles.tableBodyRow,
                    index % 2 === 1 ? styles.tableBodyRowAlt : {},
                  ]}
                  wrap={false}
                >
                  <View style={[styles.td, styles.colVessel]}>
                    <Text style={styles.tdTextLeft}>
                      <Text style={styles.vesselName}>{it.vessel}</Text>{" "}
                      <Text style={styles.voyageNumber}>{it.voyage}</Text>
                    </Text>
                  </View>

                  <View style={[styles.td, styles.colDate]}>
                    <Text style={styles.tdText}>{it.etd}</Text>
                  </View>

                  <View style={[styles.td, styles.colDate]}>
                    <Text style={styles.tdText}>{it.closingDocs}</Text>
                  </View>

                  <View style={[styles.td, styles.colDate]}>
                    <Text style={styles.tdText}>{it.closingCargo}</Text>
                  </View>

                  <View style={[styles.td, styles.colDate]}>
                    <Text style={styles.tdText}>{it.eta}</Text>
                  </View>

                  <View style={[styles.td, styles.colTransit, styles.tdLast]}>
                    <Text style={styles.transitText}>{it.transitDays}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.clientSection}>
            <View style={styles.sectionTitleRow}>
              <View style={styles.sectionTitleSquare} />
              <Text style={styles.sectionTitle}>
                {isDashboard ? "Datos" : "Datos del Solicitante"}
              </Text>
            </View>

            <View style={styles.clientGrid}>
              <View style={styles.clientFieldHalf}>
                <Text style={styles.clientLabel}>Nombre del Cliente</Text>
                <Text style={styles.clientValue}>
                  {data.client.name || "Primeteam"}
                </Text>
              </View>

              {isDashboard ? (
                <>
                  <View style={styles.clientFieldHalf}>
                    <Text style={styles.clientLabel}>Responsable</Text>
                    <Text style={styles.clientValue}>
                      {data.client.responsibleName || "Primeteam"}
                    </Text>
                  </View>

                  <View style={styles.clientFieldHalf}>
                    <Text style={styles.clientLabel}>Correo Electrónico</Text>
                    <Text style={styles.clientValue}>
                      {data.client.responsibleEmail || "info@primeteam.com"}
                    </Text>
                  </View>
                </>
              ) : (
                <>
                  <View style={styles.clientFieldHalf}>
                    <Text style={styles.clientLabel}>Razón Social</Text>
                    <Text style={styles.clientValue}>
                      {data.client.company || "N/A"}
                    </Text>
                  </View>

                  <View style={styles.clientFieldHalf}>
                    <Text style={styles.clientLabel}>Correo Electrónico</Text>
                    <Text style={styles.clientValue}>
                      {data.client.email || "N/A"}
                    </Text>
                  </View>
                </>
              )}

              <View style={styles.clientFieldHalf}>
                <Text style={styles.clientLabel}>Teléfono de Contacto</Text>
                <Text style={styles.clientValue}>
                  {data.client.phone ||
                    (isDashboard ? "+52 55 9876 5432" : "N/A")}
                </Text>
              </View>

              {clientMessage ? (
                <View style={styles.clientFieldFull}>
                  <Text style={styles.clientLabel}>
                    {isDashboard
                      ? "Mensaje / Observaciones del Itinerario"
                      : "Mensaje / Requerimientos Adicionales"}
                  </Text>
                  <View style={styles.clientMessageBox}>
                    <Text style={styles.clientMessageText}>
                      {clientMessage}
                    </Text>
                  </View>
                </View>
              ) : null}
            </View>
          </View>

          <View style={styles.footer}>
            <View style={styles.footerLeft}>
              <Text style={styles.footerContact}>
                <Text style={styles.footerContactStrong}>
                  PrimeTeam Management of Logistic Solutions
                </Text>
                {"\n"}
                Torre Corporativa, Piso 12, Ciudad de México
                {"\n"}
                info@primeteam.com | +52 55 9876 5432
                {"\n"}
                www.primeteam.com
              </Text>
            </View>

            <View style={styles.footerRight}>
              <Text style={styles.footerNote}>
                Este documento es un resumen generado automáticamente a partir de
                los itinerarios seleccionados. Los tiempos de tránsito (T/T) son
                estimados y están sujetos a condiciones climáticas y operativas.
              </Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
};