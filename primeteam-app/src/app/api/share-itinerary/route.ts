import { NextResponse } from "next/server";
import { Resend } from "resend";
import fs from "node:fs/promises";
import path from "node:path";
import TextToSVG from "text-to-svg";

export const runtime = "nodejs";

const resend = new Resend(process.env.RESEND_API_KEY);

type TableRow = {
  id: string;
  vessel: string;
  voyage: string;
  etd: string;
  closingDocs: string;
  closingCargo: string;
  eta: string;
  transitDays: string;
};

type ShareItineraryRequest = {
  toEmail?: string;
  requestorName?: string;
  companyName?: string;
  cargoType?: string;
  routeLabel?: string;
  weekLabel?: string;
  freeDaysOrigin?: string;
  pdfBase64?: string;
  pdfFileName?: string;
  tableRows?: TableRow[];
};

// --- FUNCIONES DE UTILIDAD (ORIGINALES) ---

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function truncateText(value: string, maxLength: number): string {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, Math.max(0, maxLength - 1))}…`;
}

function formatWeekLabel(value: string): string {
  const raw = value.trim().toUpperCase();

  if (!raw) return "";

  const match = raw.match(/(\d{1,2})/);
  if (match) return `W ${match[1]}`;

  if (raw.startsWith("W ")) return raw;
  if (raw.startsWith("W")) return `W ${raw.slice(1).trim()}`;

  return `W ${raw}`;
}

function buildRequestTitle(
  routeLabel: string,
  weekLabel: string,
  companyName: string
): string {
  return `SOLICITUD DE ITINERARIO // ${routeLabel.trim().toUpperCase()} // ${formatWeekLabel(
    weekLabel
  )} // ${companyName.trim().toUpperCase()}`;
}

// --- GENERACIÓN DE LA TABLA SVG USANDO VECTORES (PATH-BASED) ---

function buildItineraryTableSvg(rows: TableRow[], fontPath: string): string {
  const textToSVG = TextToSVG.loadSync(fontPath);

  const width = 1640;
  const headerHeight = 118;
  const rowHeight = 102;
  const radius = 18;
  const height = headerHeight + rows.length * rowHeight;

  const drawVectorText = (
    text: string,
    x: number,
    y: number,
    size: number,
    fill: string,
    anchor: "left" | "center" | "right" = "left"
  ) => {
    const options: any = {
      x,
      y,
      fontSize: size,
      anchor,
      attributes: { fill },
    };

    return textToSVG.getPath(text, options);
  };

  const columns = [
    {
      key: "vessel",
      labelLines: ["BUQUE Y VIAJE"],
      width: 460,
      align: "start",
    },
    {
      key: "etd",
      labelLines: ["ETD"],
      width: 230,
      align: "middle",
    },
    {
      key: "closingDocs",
      labelLines: ["CIERRE", "DOCUMENTAL"],
      width: 230,
      align: "middle",
    },
    {
      key: "closingCargo",
      labelLines: ["CIERRE", "ADUANAL"],
      width: 230,
      align: "middle",
    },
    {
      key: "eta",
      labelLines: ["ETA"],
      width: 230,
      align: "middle",
    },
    {
      key: "transitDays",
      labelLines: ["T/T"],
      width: 260,
      align: "middle",
    },
  ] as const;

  let xPos = 0;

  const xMap = columns.map((col) => {
    const currentX = xPos;
    xPos += col.width;
    return { ...col, x: currentX };
  });

  const headerPath = `
    M ${radius} 0
    H ${width - radius}
    Q ${width} 0 ${width} ${radius}
    V ${headerHeight}
    H 0
    V ${radius}
    Q 0 0 ${radius} 0
    Z
  `;

  const bodySvg = rows
    .map((row, rowIndex) => {
      const y = headerHeight + rowIndex * rowHeight;
      const centerY = y + rowHeight / 2 + 7;
      const rowBg = rowIndex % 2 === 0 ? "#FFFFFF" : "#F9FAFB";
      const ttBg = rowIndex % 2 === 0 ? "#F3F7FA" : "#EDF2F6";

      const vessel = truncateText(row.vessel || "N/A", 24);
      const voyage = truncateText(row.voyage || "", 10);

      const vesselMetrics = textToSVG.getMetrics(vessel, { fontSize: 20 });
      const voyageX = xMap[0].x + 18 + vesselMetrics.width + 12;

      return `
    ${xMap
      .map((col) => {
        const cellBg = col.key === "transitDays" ? ttBg : rowBg;
        return `<rect x="${col.x}" y="${y}" width="${col.width}" height="${rowHeight}" fill="${cellBg}" />`;
      })
      .join("")}

    ${xMap
      .map((col, colIndex) => {
        const isLast = colIndex === xMap.length - 1;

        return isLast
          ? ""
          : `<line x1="${col.x + col.width}" y1="${y}" x2="${
              col.x + col.width
            }" y2="${
              y + rowHeight
            }" stroke="#D8DEE6" stroke-width="2" />`;
      })
      .join("")}

    <line x1="0" y1="${y}" x2="${width}" y2="${y}" stroke="#D8DEE6" stroke-width="2" />

    ${drawVectorText(vessel, xMap[0].x + 18, centerY, 20, "#41944C", "left")}
    ${
      voyage
        ? drawVectorText(voyage, voyageX, centerY, 20, "#1E63A8", "left")
        : ""
    }

    ${drawVectorText(
      row.etd || "N/A",
      xMap[1].x + xMap[1].width / 2,
      centerY,
      18,
      "#1F2937",
      "center"
    )}

    ${drawVectorText(
      row.closingDocs || "N/A",
      xMap[2].x + xMap[2].width / 2,
      centerY,
      18,
      "#1F2937",
      "center"
    )}

    ${drawVectorText(
      row.closingCargo || "N/A",
      xMap[3].x + xMap[3].width / 2,
      centerY,
      18,
      "#1F2937",
      "center"
    )}

    ${drawVectorText(
      row.eta || "N/A",
      xMap[4].x + xMap[4].width / 2,
      centerY,
      18,
      "#1F2937",
      "center"
    )}

    ${drawVectorText(
      row.transitDays || "N/A",
      xMap[5].x + xMap[5].width / 2,
      centerY,
      20,
      "#1E63A8",
      "center"
    )}
  `;
    })
    .join("");

  const headerSvg = `
    <path d="${headerPath}" fill="#195A97" />
    ${xMap
      .map((col, index) => {
        const midX = col.x + col.width / 2;
        const line1 = col.labelLines[0] || "";
        const line2 = col.labelLines[1] || "";

        let textDrawing = "";

        if (line2) {
          textDrawing += drawVectorText(
            line1,
            midX,
            48,
            18,
            "#FFFFFF",
            "center"
          );
          textDrawing += drawVectorText(
            line2,
            midX,
            75,
            18,
            "#FFFFFF",
            "center"
          );
        } else {
          textDrawing += drawVectorText(
            line1,
            midX,
            65,
            18,
            "#FFFFFF",
            "center"
          );
        }

        return `
          ${textDrawing}
          ${
            index === xMap.length - 1
              ? ""
              : `<line x1="${
                  col.x + col.width
                }" y1="16" x2="${
                  col.x + col.width
                }" y2="${headerHeight}" stroke="rgba(255,255,255,0.14)" stroke-width="3" />`
          }
        `;
      })
      .join("")}
  `;

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <rect x="1" y="1" width="${width - 2}" height="${
    height - 2
  }" rx="${radius}" ry="${radius}" fill="#FFFFFF" stroke="#D8DEE6" stroke-width="2" />
      ${headerSvg}
      ${bodySvg}
      <line x1="0" y1="${
        height - 1
      }" x2="${width}" y2="${height - 1}" stroke="#D8DEE6" stroke-width="2" />
    </svg>
  `.trim();
}

async function buildInlineTableAttachment(rows: TableRow[], fontPath: string) {
  const svg = buildItineraryTableSvg(rows, fontPath);
  const svgBuffer = Buffer.from(svg, "utf8");

  const emailPreviewWidth = 760;

  try {
    const sharpModule = await import("sharp");
    const sharp = sharpModule.default;

    const pngBuffer = await sharp(svgBuffer, { density: 220 })
      .resize({
        width: emailPreviewWidth,
        withoutEnlargement: false,
      })
      .png()
      .toBuffer();

    return {
      content: pngBuffer.toString("base64"),
      filename: "itinerary-preview.png",
      contentId: "itinerary-preview",
    };
  } catch (err) {
    console.error("Error en Sharp:", err);

    return {
      content: svgBuffer.toString("base64"),
      filename: "itinerary-preview.svg",
      contentId: "itinerary-preview",
    };
  }
}

// --- CONSTRUCCIÓN DEL CORREO HTML (INTEGRAL) ---

function buildEmailHtml(params: {
  requestorName: string;
  routeLabel: string;
  weekLabel: string;
  companyName: string;
  cargoType: string;
  freeDaysOrigin: string;
}) {
  const {
    requestorName,
    routeLabel,
    weekLabel,
    companyName,
    cargoType,
    freeDaysOrigin,
  } = params;

  const safeName = escapeHtml(requestorName);
  const safeRoute = escapeHtml(routeLabel);
  const safeFreeDays = escapeHtml(freeDaysOrigin);
  const safeTitle = escapeHtml(
    buildRequestTitle(routeLabel, weekLabel, companyName)
  );

  const showFclNote =
    cargoType.trim().toUpperCase() === "FCL" && freeDaysOrigin.trim().length > 0;

  return `
<!DOCTYPE html>
<html lang="es">
  <body style="margin:0;padding:0;background-color:#ffffff;font-family:Arial,Helvetica,sans-serif;color:#111827;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;background:#ffffff;">
      <tr>
        <td align="center" style="padding:24px;">
          <table role="presentation" width="760" cellpadding="0" cellspacing="0" border="0" style="width:760px;max-width:760px;background:#ffffff;">
            <tr>
              <td style="font-size:14px;line-height:1.7;color:#111827;">
                <div style="font-size:20px;font-weight:700;color:#111827;margin-bottom:10px;">
                  ${safeTitle}
                </div>

                <p style="margin:0 0 18px 0;">Estimado/a ${safeName},</p>
                <p style="margin:0 0 18px 0;">Esperamos que se encuentre muy bien.</p>
                <p style="margin:0 0 18px 0;">
                  Le informamos que su itinerario ha sido generado exitosamente y se encuentra adjunto a este correo para su descarga y consulta.
                </p>

                <p style="margin:0 0 18px 0;">
                  Le recomendamos revisar cuidadosamente la información contenida. En caso de requerir algún ajuste, aclaración o asistencia adicional, no dude en ponerse en contacto con nosotros al correo
                  <a href="mailto:itineraries@primeteam.com.mx" style="color:#1A5A96;text-decoration:none;">itineraries@primeteam.com.mx</a>,
                  estaremos encantados de ayudarle.
                </p>

                <p style="margin:0 0 14px 0;font-weight:700;">
                  ITINERARIO ${safeRoute.toUpperCase()}:
                </p>

                <table role="presentation" width="760" cellpadding="0" cellspacing="0" border="0" style="width:760px;max-width:760px;margin:0 0 16px 0;">
                  <tr>
                    <td align="center" style="padding:0;margin:0;">
                      <img
                        src="cid:itinerary-preview"
                        alt="Itinerario ${safeRoute}"
                        width="760"
                        style="display:block;width:760px;max-width:760px;height:auto;border:0;outline:none;text-decoration:none;"
                      />
                    </td>
                  </tr>
                </table>

                ${
                  showFclNote
                    ? `
                <p style="margin:16px 0 18px 0;">
                  <strong>Nota:</strong> Estos itinerarios cuentan con ${safeFreeDays} días libres de demora en origen.
                </p>
                `
                    : ""
                }

                <p style="margin:0 0 18px 0;">
                  Agradecemos su preferencia y confianza en nuestros servicios.
                </p>

                <p style="margin:0;">
                  Quedamos a su disposición.
                </p>

                <p style="margin:0 0 18px 0;">
                  Saludos cordiales,
                </p>

                <p style="margin:0;font-weight:700;">
                  Important:
                </p>

                <p style="margin:0 0 22px 0;">
                  Please add in copy
                  <a href="mailto:itineraries@primeteam.com.mx" style="color:#1A5A96;text-decoration:none;">itineraries@primeteam.com.mx</a>
                  in all your requirements.
                </p>

                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;margin:0 0 24px 0;">
                  <tr>
                    <td valign="top" style="font-size:14px;line-height:1.65;color:#111827;">
                      <strong>RAZON SOCIAL PRIMETEAM</strong><br />
                      <a href="https://www.primeteam.com.mx/" style="color:#1A5A96;text-decoration:none;">https://www.primeteam.com.mx/</a>
                    </td>
                    <td valign="top" align="right" style="padding-left:24px;">
                      <img
                        src="cid:logo-primeteam"
                        alt="PrimeTeam"
                        width="110"
                        style="display:block;border:0;height:auto;"
                      />
                    </td>
                  </tr>
                </table>

                <p style="margin:0;font-size:12px;line-height:1.65;color:#6B7280;">
                  El contenido de este correo es confidencial y dirigido exclusivamente al destinatario especificado. No está permitido divulgar, copiar o distribuir ninguna parte de este mensaje sin el consentimiento previo y por escrito del remitente. Si no eres el destinatario o has recibido este correo por error, te agradecemos notificar al remitente y eliminar el mensaje. Apreciamos tu cooperación y comprensión.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
  `.trim();
}

function buildPlainText(params: {
  requestorName: string;
  routeLabel: string;
  weekLabel: string;
  companyName: string;
  cargoType: string;
  freeDaysOrigin: string;
}) {
  const {
    requestorName,
    routeLabel,
    weekLabel,
    companyName,
    cargoType,
    freeDaysOrigin,
  } = params;

  const fclNote =
    cargoType.trim().toUpperCase() === "FCL" && freeDaysOrigin.trim().length > 0
      ? `\nNota: Estos itinerarios cuentan con ${freeDaysOrigin} días libres de demora en origen.\n`
      : "";

  return [
    buildRequestTitle(routeLabel, weekLabel, companyName),
    "",
    `Estimado/a ${requestorName},`,
    "",
    "Esperamos que se encuentre muy bien.",
    "",
    "Le informamos que su itinerario ha sido generado exitosamente y se encuentra adjunto a este correo para su descarga y consulta.",
    "",
    "Le recomendamos revisar cuidadosamente la información contenida. En caso de requerir algún ajuste, aclaración o asistencia adicional, no dude en ponerse en contacto con nosotros al correo itineraries@primeteam.com.mx, estaremos encantados de ayudarle.",
    "",
    `ITINERARIO ${routeLabel.toUpperCase()}:`,
    "",
    "[La vista previa del itinerario va incluida en la versión HTML del correo]",
    fclNote,
    "",
    "Agradecemos su preferencia y confianza en nuestros servicios.",
    "",
    "Quedamos a su disposición.",
    "Saludos cordiales,",
    "",
    "Important:",
    "Please add in copy itineraries@primeteam.com.mx in all your requirements.",
    "",
    "RAZON SOCIAL PRIMETEAM",
    "https://www.primeteam.com.mx/",
  ].join("\n");
}

// --- MANEJADOR POST (ENDPOINT DE API) ---

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ShareItineraryRequest;

    const toEmail = body.toEmail?.trim() || "";
    const requestorName = body.requestorName?.trim() || "";
    const companyName = body.companyName?.trim() || "";
    const cargoType = body.cargoType?.trim() || "";
    const routeLabel = body.routeLabel?.trim() || "";
    const weekLabel = body.weekLabel?.trim() || "";
    const freeDaysOrigin = body.freeDaysOrigin?.trim() || "";
    const pdfBase64 = body.pdfBase64?.trim() || "";
    const pdfFileName = body.pdfFileName?.trim() || "itinerario.pdf";
    const tableRows = Array.isArray(body.tableRows) ? body.tableRows : [];

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { ok: false, error: "Falta configurar RESEND_API_KEY." },
        { status: 500 }
      );
    }

    if (!toEmail || !requestorName || !companyName || !routeLabel || !weekLabel) {
      return NextResponse.json(
        { ok: false, error: "Faltan datos obligatorios para enviar el correo." },
        { status: 400 }
      );
    }

    if (!pdfBase64) {
      return NextResponse.json(
        { ok: false, error: "No se recibió el PDF adjunto." },
        { status: 400 }
      );
    }

    if (!tableRows.length) {
      return NextResponse.json(
        { ok: false, error: "No se recibió la tabla del itinerario." },
        { status: 400 }
      );
    }

    const fontPath = path.resolve(
      process.cwd(),
      "public/fonts/Inter_Regular.ttf"
    );
    const logoPath = path.join(process.cwd(), "public", "logo-icono.png");

    const logoBase64 = (await fs.readFile(logoPath)).toString("base64");

    const inlineTableAttachment = await buildInlineTableAttachment(
      tableRows,
      fontPath
    );

    const subject = buildRequestTitle(routeLabel, weekLabel, companyName);

    const html = buildEmailHtml({
      requestorName,
      routeLabel,
      weekLabel,
      companyName,
      cargoType,
      freeDaysOrigin,
    });

    const text = buildPlainText({
      requestorName,
      routeLabel,
      weekLabel,
      companyName,
      cargoType,
      freeDaysOrigin,
    });

    const { error } = await resend.emails.send({
      from: "PrimeTeam Itineraries <itineraries@primeteam.com.mx>",
      to: [toEmail],
      cc: ["itineraries@primeteam.com.mx"],
      subject,
      html,
      text,
      attachments: [
        {
          filename: pdfFileName,
          content: Buffer.from(pdfBase64, "base64"),
        },
        {
          filename: "logo-icono.png",
          content: Buffer.from(logoBase64, "base64"),
          contentId: "logo-primeteam",
        },
        {
          filename: inlineTableAttachment.filename,
          content: Buffer.from(inlineTableAttachment.content, "base64"),
          contentId: inlineTableAttachment.contentId,
        },
      ],
    });

    if (error) {
      console.error("Error de Resend:", error);

      return NextResponse.json(
        {
          ok: false,
          error:
            typeof error.message === "string"
              ? error.message
              : "Resend no pudo enviar el correo.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error crítico en API:", error);

    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Ocurrió un error inesperado al enviar el correo.",
      },
      { status: 500 }
    );
  }
}