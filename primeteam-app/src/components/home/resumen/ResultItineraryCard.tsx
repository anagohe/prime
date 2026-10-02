"use client";

import { FileText, Info, Ship, X } from "lucide-react";
import type { NormalizedItinerary } from "./types";
import {
  clsx,
  fmtDayMonthEs,
  fmtShortEs,
  getImoDisplayValue,
} from "./utils";

function ImoWarningIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M12 3.25L21 19H3L12 3.25Z"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      <path
        d="M12 8.35C10.35 8.35 9.1 9.62 9.1 11.18C9.1 12.03 9.47 12.79 10.08 13.32V14.08C10.08 14.4 9.82 14.66 9.5 14.66H9.3V15.76H10.22V16.5H11.02V15.76H11.6V16.5H12.4V15.76H12.98V16.5H13.78V15.76H14.7V14.66H14.5C14.18 14.66 13.92 14.4 13.92 14.08V13.32C14.53 12.79 14.9 12.03 14.9 11.18C14.9 9.62 13.65 8.35 12 8.35Z"
        fill="currentColor"
        stroke="none"
      />
      <circle cx="10.95" cy="11.05" r="0.42" fill="#fdb913" />
      <circle cx="13.05" cy="11.05" r="0.42" fill="#fdb913" />
      <path
        d="M12 11.7L11.55 12.35H12.45L12 11.7Z"
        fill="#fdb913"
        stroke="none"
      />
      <path
        d="M10.95 13.15H13.05"
        stroke="#fdb913"
        strokeWidth="0.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ResultInfoBlock({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label?: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2.5 min-w-0">
      <div className="flex-shrink-0">{icon}</div>
      <div className="min-w-0">
        {label ? (
          <div className="text-[#1e293b]/30 text-[7px] font-black uppercase leading-none">
            {label}
          </div>
        ) : null}
        <div className="text-[#1e293b]/60 font-bold text-[11px] leading-none break-words">
          {value}
        </div>
      </div>
    </div>
  );
}

type ResultItineraryCardProps = {
  data: NormalizedItinerary;
  isSelected: boolean;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onToggleSelect: () => void;
};

export function ResultItineraryCard({
  data,
  isSelected,
  isExpanded,
  onToggleExpand,
  onToggleSelect,
}: ResultItineraryCardProps) {
  return (
    <div
      className={clsx(
        "relative bg-white rounded-[12px] transition-all overflow-hidden border-4 shadow-sm",
        isSelected ? "border-[#67a36c]" : "border-transparent"
      )}
    >
      <div className="p-3 sm:p-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex-grow min-w-0 lg:min-h-[84px] flex items-center">
          <div className="w-full">
            <div className="hidden lg:grid w-full grid-cols-4 items-center justify-items-center gap-x-6 pr-2">
              <div className="flex flex-col items-center justify-center text-center min-w-0">
                <span className="text-[#67a36c] font-black text-[10px] uppercase tracking-widest mb-1">
                  ETD
                </span>
                <span className="text-[#1e293b] font-black text-[22px] tracking-tighter leading-none">
                  {fmtDayMonthEs(data.etd)}
                </span>
              </div>

              <div className="flex flex-col items-start justify-center min-w-[132px] pl-5">
                <span className="text-[#67a36c] font-black text-[10px] uppercase tracking-widest mb-2">
                  CIERRES
                </span>

                <div className="flex flex-col gap-2">
                  <ResultInfoBlock
                    icon={<FileText className="text-[#1e293b] w-[18px] h-[18px]" />}
                    value={fmtShortEs(data.closureDocs)}
                  />
                  <ResultInfoBlock
                    icon={<Ship className="text-[#1e293b] w-[18px] h-[18px]" />}
                    value={fmtShortEs(data.closureCargo)}
                  />
                </div>
              </div>

              <div className="flex flex-col items-center justify-center text-center min-w-0 w-full max-w-[340px]">
                <div className="text-[#1e293b] font-black text-[17px] tracking-tight uppercase leading-none truncate w-full">
                  {data.vessel}
                </div>
                <div className="text-[#67a36c] font-bold text-[9px] uppercase tracking-widest mt-2">
                  {data.transitDays
                    ? `${data.transitDays} DÍAS DE TRÁNSITO`
                    : "DÍAS DE TRÁNSITO"}
                </div>
              </div>

              <div className="flex flex-col items-center justify-center text-center min-w-0">
                <span className="text-[#67a36c] font-black text-[10px] uppercase tracking-widest mb-1">
                  ETA
                </span>
                <span className="text-[#1e293b] font-black text-[22px] tracking-tighter leading-none">
                  {fmtDayMonthEs(data.eta)}
                </span>
              </div>
            </div>

            <div className="lg:hidden w-full">
              <div className="grid grid-cols-[82px_minmax(0,1fr)_18px_minmax(0,1fr)] gap-x-2 items-start">
                <div className="min-w-0">
                  <span className="text-[#1e293b] font-black text-[8px] uppercase tracking-widest leading-none block mb-2">
                    Cierres
                  </span>

                  <div className="space-y-2">
                    <ResultInfoBlock
                      icon={<FileText className="text-[#1e293b] w-4 h-4" />}
                      value={fmtShortEs(data.closureDocs)}
                    />
                    <ResultInfoBlock
                      icon={<Ship className="text-[#1e293b] w-4 h-4" />}
                      value={fmtShortEs(data.closureCargo)}
                    />
                  </div>
                </div>

                <div className="flex flex-col items-center justify-start text-center min-w-0">
                  <span className="text-[#67a36c] font-black text-[10px] uppercase tracking-widest mb-1">
                    ETD
                  </span>
                  <span className="text-[#1e293b] font-black text-[22px] tracking-tighter leading-[0.9] break-words">
                    {fmtDayMonthEs(data.etd)}
                  </span>
                </div>

                <div className="flex items-center justify-center pt-6">
                  <span className="text-[#1e293b] font-black text-[28px] leading-none">
                    —
                  </span>
                </div>

                <div className="flex flex-col items-center justify-start text-center min-w-0">
                  <span className="text-[#67a36c] font-black text-[10px] uppercase tracking-widest mb-1">
                    ETA
                  </span>
                  <span className="text-[#1e293b] font-black text-[22px] tracking-tighter leading-[0.9] break-words">
                    {fmtDayMonthEs(data.eta)}
                  </span>
                </div>
              </div>

              <div className="mt-3 border-t border-[#1e293b]/10 pt-3">
                <div className="grid grid-cols-[34px_minmax(0,1fr)] gap-3 items-center">
                  <button
                    type="button"
                    onClick={onToggleExpand}
                    className={clsx(
                      "w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer",
                      isExpanded
                        ? "text-blue-600 bg-blue-50"
                        : "text-[#1e293b] opacity-60 hover:opacity-100"
                    )}
                  >
                    {isExpanded ? <X size={18} /> : <Info size={18} />}
                  </button>

                  <div className="min-w-0 text-center">
                    <div className="text-[#1e293b] font-black text-[14px] tracking-tight uppercase leading-tight break-words">
                      {data.vessel}
                    </div>
                    <div className="text-[#67a36c] font-bold text-[10px] uppercase tracking-widest mt-1.5">
                      {data.transitDays
                        ? `${data.transitDays} DÍAS DE TRÁNSITO`
                        : "DÍAS DE TRÁNSITO"}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onToggleSelect}
                  className={clsx(
                    "mt-3 w-full py-3 rounded-lg font-black text-[11px] uppercase tracking-widest shadow-md transition-all active:scale-95 cursor-pointer",
                    isSelected
                      ? "bg-[#67a36c] text-white"
                      : "bg-[#fdb913] text-white hover:bg-amber-500"
                  )}
                >
                  {isSelected ? "Seleccionado" : "Seleccionar"}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="hidden lg:flex items-center justify-between lg:justify-end gap-3 lg:ml-4 flex-shrink-0 w-full lg:w-auto">
          <button
            type="button"
            onClick={onToggleExpand}
            className={clsx(
              "p-1 transition-colors cursor-pointer flex-shrink-0",
              isExpanded
                ? "text-blue-600"
                : "text-[#1e293b] opacity-60 hover:opacity-100"
            )}
          >
            {isExpanded ? <X size={20} /> : <Info size={20} />}
          </button>

          <button
            type="button"
            onClick={onToggleSelect}
            className={clsx(
              "w-auto min-w-[170px] sm:min-w-[210px] lg:min-w-[130px] py-3 rounded-lg font-black text-[11px] uppercase tracking-widest shadow-md transition-all active:scale-95 cursor-pointer",
              isSelected
                ? "bg-[#67a36c] text-white"
                : "bg-[#fdb913] text-white hover:bg-amber-500"
            )}
          >
            {isSelected ? "Seleccionado" : "Seleccionar"}
          </button>
        </div>
      </div>

      <div
        className={clsx(
          "lg:hidden overflow-hidden transition-all duration-500 ease-in-out",
          isExpanded ? "max-h-[320px]" : "max-h-0"
        )}
      >
        <div
          className={clsx(
            "mx-3 mb-3 rounded-[10px] overflow-hidden shadow-sm border border-black/5",
            isSelected ? "bg-[#67a36c]" : "bg-[#fdb913]"
          )}
        >
          <div className="grid grid-cols-3">
            <div className="px-3 py-4 text-center min-w-0">
              <span className="block font-black text-[9px] uppercase tracking-widest text-[#1e293b] mb-2">
                Cierre IMO
              </span>
              <div className="flex items-center justify-center gap-1.5 min-w-0">
                <ImoWarningIcon className="w-5 h-5 text-[#1e293b] flex-shrink-0" />
                <span className="text-[10px] font-bold text-[#1e293b]/70 uppercase break-words leading-tight">
                  {getImoDisplayValue(data.imoClosing)}
                </span>
              </div>
            </div>

            <div className="px-3 py-4 text-center min-w-0">
              <span className="block font-black text-[9px] uppercase tracking-widest text-[#1e293b] mb-2">
                Naviera
              </span>
              <span className="block font-black text-[12px] uppercase tracking-tight text-[#1e293b] break-words leading-tight">
                {data.shippingLine}
              </span>
            </div>

            <div className="px-3 py-4 text-center min-w-0">
              <span className="block font-black text-[9px] uppercase tracking-widest text-[#1e293b] mb-2">
                Servicio
              </span>
              <span className="block font-black text-[12px] uppercase tracking-tight text-[#1e293b] break-words leading-tight">
                {data.service}
              </span>
            </div>
          </div>

          <div className="border-t border-white/30 px-4 py-4 text-center min-w-0">
            <span className="block font-black text-[9px] uppercase tracking-widest text-[#1e293b] mb-2">
              Terminal de Origen
            </span>
            <span className="block font-black text-[12px] uppercase tracking-tight text-[#1e293b] break-words leading-tight">
              {data.terminal}
            </span>
          </div>
        </div>
      </div>

      <div
        className={clsx(
          "hidden lg:grid absolute left-0 top-0 bottom-0 w-[calc(100%-190px)] rounded-r-[12px] transition-transform duration-500 ease-in-out grid-cols-4 items-center px-10 py-6 gap-8",
          isExpanded ? "translate-x-0" : "-translate-x-full",
          isSelected ? "bg-[#67a36c]" : "bg-[#fdb913]"
        )}
      >
        <div className="flex flex-col items-center justify-center text-center min-w-0 gap-3">
          <span className="font-black text-[9px] uppercase tracking-widest text-[#1e293b]">
            Cierre IMO
          </span>
          <div className="flex items-center justify-center gap-2">
            <ImoWarningIcon className="w-6 h-6 text-[#1e293b] flex-shrink-0" />
            <span className="text-[11px] font-bold text-[#1e293b]/60 uppercase leading-none whitespace-nowrap">
              {getImoDisplayValue(data.imoClosing)}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center text-center min-w-0 gap-3">
          <span className="font-black text-[9px] uppercase tracking-widest text-[#1e293b]">
            Naviera
          </span>
          <span className="font-black text-lg uppercase tracking-widest text-[#1e293b] truncate max-w-full">
            {data.shippingLine}
          </span>
        </div>

        <div className="flex flex-col items-center justify-center text-center min-w-0 gap-3">
          <span className="font-black text-[9px] uppercase tracking-widest text-[#1e293b]">
            Terminal de Origen
          </span>
          <span className="font-black text-lg uppercase tracking-tighter text-[#1e293b] truncate max-w-full">
            {data.terminal}
          </span>
        </div>

        <div className="flex flex-col items-center justify-center text-center min-w-0 gap-3">
          <span className="font-black text-[9px] uppercase tracking-widest text-[#1e293b]">
            Servicio
          </span>
          <span className="font-black text-lg uppercase tracking-widest text-[#1e293b] truncate max-w-full">
            {data.service}
          </span>
        </div>
      </div>
    </div>
  );
}