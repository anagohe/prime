"use client";

import { FileText, Landmark, TriangleAlert } from "lucide-react";
import type { NormalizedItinerary } from "./types";
import { fmtDayMonthEs, fmtShortEs, getImoDisplayValue } from "./utils";

function SummaryDetailWithIcon({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 sm:gap-4">
      <span className="min-w-0 text-[#111827] font-black text-[8px] sm:text-[10px] lg:text-[11px] uppercase tracking-tight leading-tight whitespace-nowrap">
        {label}
      </span>

      <span className="flex-shrink-0 w-[96px] sm:w-[112px] lg:w-[132px] flex items-center justify-end gap-2 sm:gap-2.5 text-slate-500 font-black text-[8px] sm:text-[10px] uppercase">
        <span className="flex items-center justify-center flex-shrink-0">
          {icon}
        </span>
        <span className="text-right whitespace-nowrap overflow-hidden text-ellipsis">
          {value}
        </span>
      </span>
    </div>
  );
}

function SummaryDetailText({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 sm:gap-4">
      <span className="min-w-0 text-[#111827] font-black text-[8px] sm:text-[10px] lg:text-[11px] uppercase tracking-tight leading-tight whitespace-nowrap">
        {label}
      </span>

      <span className="flex-shrink-0 w-[96px] sm:w-[112px] lg:w-[132px] text-right text-slate-500 font-black text-[9px] sm:text-[11px] uppercase leading-tight whitespace-nowrap overflow-hidden text-ellipsis">
        {value}
      </span>
    </div>
  );
}

type SummaryItineraryCardProps = {
  data: NormalizedItinerary;
};

export function SummaryItineraryCard({
  data,
}: SummaryItineraryCardProps) {
  return (
    <div className="relative bg-white rounded-[10px] overflow-hidden border-[5px] border-[#67a36c] shadow-[0_6px_14px_rgba(0,0,0,0.12)] max-w-[1200px] mx-auto">
      <div className="grid grid-cols-[0.92fr_1.08fr] lg:grid-cols-[1.65fr_0.85fr] min-h-[138px] sm:min-h-[156px]">
        <div className="lg:hidden flex flex-col min-h-[138px] sm:min-h-[156px] min-w-0">
          <div className="flex-1 flex flex-col items-center justify-center text-center px-3 sm:px-5 py-3 sm:py-4 min-w-0">
            <div className="text-[#111827] font-black text-[18px] sm:text-[24px] uppercase leading-tight tracking-tight break-words max-w-full">
              {data.vessel}
            </div>

            <div className="text-[#67a36c] font-black text-[8px] sm:text-[10px] uppercase tracking-widest mt-2">
              {data.transitDays
                ? `${data.transitDays} DÍAS DE TRÁNSITO`
                : "DÍAS DE TRÁNSITO"}
            </div>
          </div>

          <div className="border-t border-slate-200 grid grid-cols-2">
            <div className="px-3 sm:px-5 py-3 sm:py-5 flex flex-col items-center justify-center text-center">
              <span className="text-[#67a36c] font-black text-[9px] sm:text-[11px] uppercase tracking-widest mb-1.5">
                ETD
              </span>
              <span className="text-[#111827] font-black text-[22px] sm:text-[30px] leading-none tracking-tight">
                {fmtDayMonthEs(data.etd)}
              </span>
            </div>

            <div className="px-3 sm:px-5 py-3 sm:py-5 flex flex-col items-center justify-center text-center">
              <span className="text-[#67a36c] font-black text-[9px] sm:text-[11px] uppercase tracking-widest mb-1.5">
                ETA
              </span>
              <span className="text-[#111827] font-black text-[22px] sm:text-[30px] leading-none tracking-tight">
                {fmtDayMonthEs(data.eta)}
              </span>
            </div>
          </div>
        </div>

        <div className="hidden lg:grid grid-cols-[0.85fr_1.15fr_0.85fr] items-center px-8 py-4">
          <div className="flex flex-col items-center justify-center text-center">
            <span className="text-[#67a36c] font-black text-[10px] uppercase tracking-widest mb-1">
              ETD
            </span>
            <span className="text-[#111827] font-black text-[30px] leading-none tracking-tight">
              {fmtDayMonthEs(data.etd)}
            </span>
          </div>

          <div className="flex flex-col items-center justify-center text-center px-3 min-w-0">
            <div className="text-[#111827] font-black text-[16px] uppercase leading-tight tracking-tight break-words max-w-full">
              {data.vessel}
            </div>
            <div className="text-[#67a36c] font-black text-[9px] uppercase tracking-widest mt-2">
              {data.transitDays
                ? `${data.transitDays} DÍAS DE TRÁNSITO`
                : "DÍAS DE TRÁNSITO"}
            </div>
          </div>

          <div className="flex flex-col items-center justify-center text-center">
            <span className="text-[#67a36c] font-black text-[10px] uppercase tracking-widest mb-1">
              ETA
            </span>
            <span className="text-[#111827] font-black text-[30px] leading-none tracking-tight">
              {fmtDayMonthEs(data.eta)}
            </span>
          </div>
        </div>

        <div className="border-l border-slate-200 px-4 sm:px-5 lg:pl-12 lg:pr-9 py-3 sm:py-4 flex flex-col justify-center min-w-0">
          <div className="space-y-2 sm:space-y-2.5">
            <SummaryDetailWithIcon
              label="Cierre IMO"
              value={getImoDisplayValue(data.imoClosing)}
              icon={
                <TriangleAlert
                  className="w-[14px] h-[14px] sm:w-[15px] sm:h-[15px] text-slate-500"
                  strokeWidth={2.2}
                />
              }
            />

            <SummaryDetailWithIcon
              label="Cierre documental"
              value={fmtShortEs(data.closureDocs)}
              icon={
                <FileText
                  className="w-[14px] h-[14px] sm:w-[15px] sm:h-[15px] text-slate-500"
                  strokeWidth={2.2}
                />
              }
            />

            <SummaryDetailWithIcon
              label="Cierre aduanal"
              value={fmtShortEs(data.closureCargo)}
              icon={
                <Landmark
                  className="w-[14px] h-[14px] sm:w-[15px] sm:h-[15px] text-slate-500"
                  strokeWidth={2.2}
                />
              }
            />
          </div>

          <div className="h-4 sm:h-5" />

          <div className="space-y-2 sm:space-y-2.5">
            <SummaryDetailText label="Naviera" value={data.shippingLine} />
            <SummaryDetailText
              label="Terminal de origen"
              value={data.terminal}
            />
            <SummaryDetailText label="Servicio" value={data.service} />
          </div>
        </div>
      </div>
    </div>
  );
}