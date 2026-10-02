import { client } from "@/lib/sanity.client";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const service = searchParams.get("service");
    const pol = searchParams.get("pol");
    const pod = searchParams.get("pod");
    const shippingLine = searchParams.get("shippingLine");
    const shippingLineText = searchParams.get("shippingLineText");
    const vessel = searchParams.get("vessel");
    const terminal = searchParams.get("terminal");

    const dateMode = (searchParams.get("date_mode") || "ETD").toUpperCase();
    const requestedDateStart =
      searchParams.get("date_start") ||
      searchParams.get("etd_start") ||
      searchParams.get("eta_start");
    const requestedDateEnd =
      searchParams.get("date_end") ||
      searchParams.get("etd_end") ||
      searchParams.get("eta_end");

    const doc_closing_start = searchParams.get("doc_closing_start");
    const doc_closing_end = searchParams.get("doc_closing_end");
    const min_etd = searchParams.get("min_etd");
    const search_query = searchParams.get("search_query");

    const requestedCargoType =
      searchParams.get("fcl_lcl") || searchParams.get("cargoType") || "FCL";

    const fcl_lcl = requestedCargoType.toUpperCase() === "LCL" ? "LCL" : "FCL";

    const filters = ['_type == "itinerary"'];
    const params: Record<string, any> = {};

    const effectiveEtdField = "coalesce(final_etd, etd)";
    const effectiveEtaField = "coalesce(final_eta, eta)";
    const effectiveDateField =
      dateMode === "ETA" ? effectiveEtaField : effectiveEtdField;

    if (service) {
      filters.push(`(service->_id == $service || service->name == $service)`);
      params.service = service;
    }

    if (terminal) {
      filters.push(
        `(terminal->_id == $terminal || terminal->name == $terminal)`
      );
      params.terminal = terminal;
    }

    if (pol) {
      filters.push(
        `(route->originPort->_id == $pol || route->originPort->name == $pol)`
      );
      params.pol = pol;
    }

    if (pod) {
      filters.push(
        `(route->destinationPort->_id == $pod || route->destinationPort->name == $pod)`
      );
      params.pod = pod;
    }

    if (shippingLine) {
      filters.push(
        `(shipping_line->_id == $shippingLine || shipping_line->name == $shippingLine)`
      );
      params.shippingLine = shippingLine;
    }

    if (shippingLineText) {
      filters.push(`shipping_line->name match $shippingLineText + "*"`);
      params.shippingLineText = shippingLineText;
    }

    if (vessel) {
      filters.push(`(voyage->vessel->_id == $vessel || voyage->vessel->name == $vessel)`);
      params.vessel = vessel;
    }

    if (requestedDateStart) {
      filters.push(`${effectiveDateField} >= $requestedDateStart`);
      params.requestedDateStart = requestedDateStart;
    }

    if (requestedDateEnd) {
      filters.push(`${effectiveDateField} <= $requestedDateEnd`);
      params.requestedDateEnd = requestedDateEnd;
    }

    if (doc_closing_start) {
      filters.push(`final_doc_closing >= $doc_closing_start`);
      params.doc_closing_start = doc_closing_start;
    }

    if (doc_closing_end) {
      filters.push(`final_doc_closing <= $doc_closing_end`);
      params.doc_closing_end = doc_closing_end;
    }

    if (min_etd) {
      filters.push(`${effectiveEtdField} >= $min_etd`);
      params.min_etd = min_etd;
    }

    if (fcl_lcl) {
      filters.push(`fcl_lcl == $fcl_lcl`);
      params.fcl_lcl = fcl_lcl;
    }

    if (search_query) {
      filters.push(`(
        voyage->vessel->name match $search_query + "*" ||
        voyage->voyageCode match $search_query + "*" ||
        shipping_line->name match $search_query + "*" ||
        service->name match $search_query + "*"
      )`);
      params.search_query = search_query;
    }

    const filterClause = filters.join(" && ");

    const finalQuery = `*[${filterClause}] | order(coalesce(final_etd, etd) desc) {
      _id,
      "shippingLine": shipping_line->name,
      "shippingLineId": shipping_line->_id,
      "service": service->name,
      "serviceId": service->_id,
      "route": route->label,
      "routeId": route->_id,
      "pol": route->originPort->name,
      "polId": route->originPort->_id,
      "pod": route->destinationPort->name,
      "podId": route->destinationPort->_id,
      "voyage": voyage->voyageCode,
      "voyageId": voyage->_id,
      "vessel": voyage->vessel->name,
      "vesselId": voyage->vessel->_id,
      "terminal": terminal->name,
      "terminalId": terminal->_id,
      etd,
      eta,
      final_etd,
      final_eta,
      transit_time,
      final_transit_time_days,
      final_doc_closing,
      final_customs_closing,
      range_status,
      fcl_lcl,
      cargo_acceptance,
      remarks
    }`;

    const filteredItineraries = await client.fetch(finalQuery, params);

    return NextResponse.json(filteredItineraries);
  } catch (error: any) {
    console.error("Error fetching filtered itineraries:", error);
    return NextResponse.json(
      { message: `Could not fetch filtered itineraries: ${error.message}` },
      { status: 500 }
    );
  }
}