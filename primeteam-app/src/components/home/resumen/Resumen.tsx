"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { DayPicker, type DateRange } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { Calendar, MapPin } from "lucide-react";
import { useItineraryActions } from "@/lib/hooks/useItineraryActions";
import { ReservationForm } from "./ReservationForm";
import { ResultItineraryCard } from "./ResultItineraryCard";
import { SummaryItineraryCard } from "./SummaryItineraryCard";
import type {
  ActionFeedback,
  CargoType,
  DateFilterMode,
  FormDataState,
  ResumenProps,
  SelectedItinerary,
} from "./types";
import {
  CALENDAR_STYLES,
  addLocalDays,
  clsx,
  getDateSortTime,
  getItineraryId,
  isSameOrAfterLocalDay,
  isWithinLocalRange,
  normalizeItinerary,
  toLocalDay,
} from "./utils";

export function Resumen({
  filteredItineraries,
  isLoading,
  error,
  selectedPol,
  selectedPod,
  cargoType,
  selectedRange,
  setSelectedRange,
  fetchItineraries,
  expandedId,
  setExpandedId,
  selectedIds,
  setSelectedIds,
  step,
  setStep,
  formData,
  setFormData,
}: ResumenProps) {
  const [showCalendar, setShowCalendar] = useState(false);
  const [dateFilterMode, setDateFilterMode] =
    useState<DateFilterMode>("ETD");
  const [actionFeedback, setActionFeedback] =
    useState<ActionFeedback>(null);

  const calendarRef = useRef<HTMLDivElement>(null);
  const calendarButtonRef = useRef<HTMLButtonElement>(null);

  const today = useMemo(() => toLocalDay(new Date()), []);
  const minAllowedEtd = useMemo(() => addLocalDays(today, 10), [today]);

  const hasCompleteRange = !!selectedRange?.from && !!selectedRange?.to;

  const visibleItineraryEntries = useMemo<SelectedItinerary[]>(() => {
    if (!filteredItineraries?.length) return [];

    const entries = filteredItineraries.reduce<SelectedItinerary[]>(
      (acc, it, idx) => {
        const normalized = normalizeItinerary(it);

        if (!normalized.etd) return acc;
        if (!isSameOrAfterLocalDay(normalized.etd, minAllowedEtd)) return acc;

        if (hasCompleteRange && selectedRange?.from && selectedRange?.to) {
          const targetDate =
            dateFilterMode === "ETA" ? normalized.eta : normalized.etd;

          if (!targetDate) return acc;

          if (
            !isWithinLocalRange(
              targetDate,
              selectedRange.from,
              selectedRange.to
            )
          ) {
            return acc;
          }
        }

        acc.push({
          it,
          idx,
          id: getItineraryId(it, idx),
        });

        return acc;
      },
      []
    );

    return entries.sort((a, b) => {
      const aTime = getDateSortTime(normalizeItinerary(a.it).etd);
      const bTime = getDateSortTime(normalizeItinerary(b.it).etd);
      return aTime - bTime;
    });
  }, [
    filteredItineraries,
    minAllowedEtd,
    hasCompleteRange,
    selectedRange,
    dateFilterMode,
  ]);

  const selectedItineraries = useMemo<SelectedItinerary[]>(() => {
    if (!visibleItineraryEntries.length || selectedIds.size === 0) return [];

    return visibleItineraryEntries.filter(({ id }) => selectedIds.has(id));
  }, [visibleItineraryEntries, selectedIds]);

  const { isLoading: isActionLoading, handleSubmitReservation } =
    useItineraryActions({
      selectedItineraries,
      formData: formData as unknown as Record<string, unknown>,
      selectedPol,
      selectedPod,
      cargoType,
      onSuccess: (message: string) =>
        setActionFeedback({ type: "success", message }),
      onError: (message: string) =>
        setActionFeedback({ type: "error", message }),
    });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (
        calendarRef.current &&
        !calendarRef.current.contains(target) &&
        calendarButtonRef.current &&
        !calendarButtonRef.current.contains(target)
      ) {
        setShowCalendar(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const visibleIds = new Set(visibleItineraryEntries.map((item) => item.id));

    setSelectedIds((prev) => {
      let changed = false;
      const next = new Set<string>();

      prev.forEach((id) => {
        if (visibleIds.has(id)) next.add(id);
        else changed = true;
      });

      return changed ? next : prev;
    });

    if (expandedId && !visibleIds.has(expandedId)) {
      setExpandedId(null);
    }
  }, [visibleItineraryEntries, expandedId, setSelectedIds, setExpandedId]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);

      if (next.has(id)) next.delete(id);
      else next.add(id);

      return next;
    });
  };

  const updateFormField = (field: keyof FormDataState, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleRangeSelect = (range: DateRange | undefined) => {
    setSelectedRange(range);

    const hasFullRange = !!range?.from && !!range?.to;

    if (hasFullRange) {
      if (dateFilterMode === "ETD") {
        fetchItineraries(range);
      } else {
        fetchItineraries();
      }

      setShowCalendar(false);
    }
  };

  const handleRemoveFilter = () => {
    setSelectedRange(undefined);
    fetchItineraries();
    setShowCalendar(false);
  };

  const handleDateFilterModeChange = (nextMode: DateFilterMode) => {
    if (nextMode === dateFilterMode) return;

    setDateFilterMode(nextMode);

    if (selectedRange?.from && selectedRange?.to) {
      if (nextMode === "ETD") {
        fetchItineraries(selectedRange);
      } else {
        fetchItineraries();
      }
    }
  };

  const handleContinue = () => {
    if (selectedIds.size === 0) return;

    if (step === "results") setStep("summary");
    else if (step === "summary") setStep("form");
  };

  const summaryHeaderItems = [
    { label: "Origen", value: selectedPol?.name || "—" },
    { label: "Destino", value: selectedPod?.name || "—" },
    { label: "Tipo de carga", value: cargoType },
  ];

  const resultHeaderItems = [
    { label: "Origen", value: selectedPol?.name || "—" },
    { label: "Destino", value: selectedPod?.name || "—" },
  ];

  return (
    <section className="py-8 md:py-14 bg-slate-50">
      <style jsx global>{`
        ${CALENDAR_STYLES}

        .resumen-real-scroll {
          overflow-y: auto;
          overflow-x: hidden;
          -webkit-overflow-scrolling: touch;
          scrollbar-gutter: auto;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }

        .resumen-real-scroll::-webkit-scrollbar {
          width: 0;
          height: 0;
        }

        @media (min-width: 1024px) {
          .resumen-real-scroll {
            scrollbar-gutter: stable;
            scrollbar-width: thin;
            scrollbar-color: #fdb913 rgba(255, 255, 255, 0.96);
          }

          .resumen-real-scroll::-webkit-scrollbar {
            width: 8px;
          }

          .resumen-real-scroll::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.96);
            border-radius: 9999px;
          }

          .resumen-real-scroll::-webkit-scrollbar-thumb {
            background: #fdb913;
            border-radius: 9999px;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
          }

          .resumen-real-scroll::-webkit-scrollbar-thumb:hover {
            background: #f59e0b;
          }
        }
      `}</style>

      <div className="mx-auto w-full px-2 sm:px-6 lg:px-10 max-w-screen-2xl">
        <div className="flex flex-col lg:flex-row-reverse gap-8 items-start">
          <div className="flex-grow w-full">
            {step === "form" ? (
              <ReservationForm
                formData={formData}
                updateFormField={updateFormField}
                onBack={() => setStep("summary")}
                onSubmit={handleSubmitReservation}
                isActionLoading={isActionLoading}
                actionFeedback={actionFeedback}
              />
            ) : (
              <div className="bg-[#0c4a83] rounded-[22px] sm:rounded-[24px] overflow-hidden shadow-2xl flex flex-col h-[560px] sm:h-[580px] relative max-w-4xl mx-auto w-full border border-white/5">
                {step === "summary" ? (
                  <div className="px-4 sm:px-8 pt-5 sm:pt-6 pb-4 border-b border-white/10">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-6">
                      <div className="text-[#fdb913] font-black text-lg sm:text-2xl tracking-tight uppercase">
                        RESUMEN DE ITINERARIO(S)
                      </div>

                      <button
                        type="button"
                        onClick={() => setStep("results")}
                        className="text-white/70 hover:text-white transition-colors font-black text-[10px] sm:text-[11px] uppercase tracking-widest cursor-pointer text-left sm:text-right"
                      >
                        Volver
                      </button>
                    </div>

                    <div className="mt-4 bg-white rounded-[10px] shadow-sm overflow-hidden border border-white/10">
                      <div className="grid grid-cols-3 divide-x divide-slate-200/80 px-2 sm:px-4">
                        {summaryHeaderItems.map((item) => (
                          <div
                            key={item.label}
                            className="min-w-0 px-3 sm:px-5 py-4 sm:py-5"
                          >
                            <div className="text-[#fdb913] text-[8px] sm:text-[9px] font-black uppercase tracking-widest leading-none mb-2">
                              {item.label}
                            </div>
                            <div className="text-[#1e293b] font-black text-[11px] sm:text-sm uppercase tracking-tight leading-tight break-words">
                              {item.value}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="border-b border-white/10 relative">
                    <div className="hidden lg:flex px-8 py-5 items-center gap-10">
                      <div className="flex items-center gap-10">
                        {resultHeaderItems.map((item, index) => (
                          <React.Fragment key={item.label}>
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                                <MapPin className="text-white w-4 h-4" />
                              </div>

                              <div className="min-w-0">
                                <div className="text-white/50 text-[9px] font-black uppercase tracking-widest leading-none mb-1">
                                  {item.label}
                                </div>
                                <div className="text-white font-bold text-[11px] uppercase tracking-tight break-words">
                                  {item.value}
                                </div>
                              </div>
                            </div>

                            {index === 0 ? (
                              <div className="h-8 w-px bg-white/10" />
                            ) : null}
                          </React.Fragment>
                        ))}

                        <div className="h-8 w-px bg-white/10" />

                        <div className="flex flex-col gap-1.5">
                          <div className="text-white/50 text-[9px] font-black uppercase tracking-widest leading-none">
                            Tipo de carga
                          </div>
                          <div className="bg-white/10 rounded-lg p-0.5 flex">
                            {(["FCL", "LCL"] as CargoType[]).map((type) => (
                              <span
                                key={type}
                                className={clsx(
                                  "px-3 py-1 rounded-md text-[8px] font-black tracking-wider transition-colors",
                                  cargoType === type
                                    ? "bg-white/20 text-white"
                                    : "text-white/40"
                                )}
                              >
                                {type}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <button
                        ref={calendarButtonRef}
                        className="ml-auto text-white opacity-80 hover:opacity-100 transition-opacity relative cursor-pointer"
                        type="button"
                        onClick={() => setShowCalendar((prev) => !prev)}
                      >
                        <Calendar className="w-6 h-6" />
                      </button>
                    </div>

                    <div className="lg:hidden px-4 py-4">
                      <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto_auto] gap-3 items-center">
                        {resultHeaderItems.map((item) => (
                          <div
                            key={item.label}
                            className="flex items-center gap-2 min-w-0"
                          >
                            <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                              <MapPin className="text-white w-3.5 h-3.5" />
                            </div>

                            <div className="min-w-0">
                              <div className="text-white/50 text-[8px] font-black uppercase tracking-widest leading-none mb-1">
                                {item.label}
                              </div>
                              <div className="text-white font-bold text-[10px] uppercase tracking-tight break-words">
                                {item.value}
                              </div>
                            </div>
                          </div>
                        ))}

                        <div className="min-w-0">
                          <div className="text-white/50 text-[8px] font-black uppercase tracking-widest leading-none mb-1">
                            Tipo
                          </div>
                          <div className="bg-white/10 rounded-lg p-0.5 flex">
                            {(["FCL", "LCL"] as CargoType[]).map((type) => (
                              <span
                                key={type}
                                className={clsx(
                                  "px-2.5 py-1 rounded-md text-[8px] font-black tracking-wider transition-colors",
                                  cargoType === type
                                    ? "bg-white/20 text-white"
                                    : "text-white/40"
                                )}
                              >
                                {type}
                              </span>
                            ))}
                          </div>
                        </div>

                        <button
                          ref={calendarButtonRef}
                          className="justify-self-end text-white opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
                          type="button"
                          onClick={() => setShowCalendar((prev) => !prev)}
                        >
                          <Calendar className="w-6 h-6" />
                        </button>
                      </div>
                    </div>

                    {showCalendar && (
                      <div
                        ref={calendarRef}
                        className="absolute right-2 sm:right-6 top-[calc(100%+10px)] z-[60] flex flex-col items-end max-w-[calc(100vw-1rem)]"
                      >
                        <div className="bg-white p-2 rounded-[12px] shadow-[0_14px_32px_rgba(15,23,42,0.22)] border border-slate-200 w-fit max-w-[calc(100vw-1rem)] overflow-x-auto">
                          <DayPicker
                            mode="range"
                            selected={selectedRange}
                            onSelect={handleRangeSelect}
                            numberOfMonths={1}
                            disabled={{ before: today }}
                          />
                        </div>

                        <div className="mt-2 w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
                          <div className="flex items-center gap-1">
                            {(["ETD", "ETA"] as DateFilterMode[]).map((mode) => (
                              <button
                                key={mode}
                                type="button"
                                onClick={() => handleDateFilterModeChange(mode)}
                                className={clsx(
                                  "px-3 py-1 rounded-full text-[10px] font-black tracking-widest transition-colors cursor-pointer",
                                  dateFilterMode === mode
                                    ? "bg-[#f59e0b] text-white"
                                    : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                                )}
                              >
                                {mode}
                              </button>
                            ))}
                          </div>

                          <button
                            type="button"
                            onClick={handleRemoveFilter}
                            className="w-fit bg-red-500 hover:bg-red-600 text-white px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-colors cursor-pointer"
                          >
                            Quitar filtro
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex-1 min-h-0">
                  <div
                    className={clsx(
                      "resumen-real-scroll h-full min-h-0 px-3 sm:px-6 pt-4 pb-20 lg:pr-6 xl:pr-7 lg:mr-2 xl:mr-3 space-y-3 scroll-smooth overscroll-contain",
                      step === "summary" && "pt-5"
                    )}
                  >
                    {isLoading ? (
                      <div className="text-center text-white/70 py-14 font-semibold">
                        Cargando...
                      </div>
                    ) : step === "summary" ? (
                      selectedItineraries.length > 0 ? (
                        selectedItineraries.map(({ it, id }) => (
                          <SummaryItineraryCard
                            key={id}
                            data={normalizeItinerary(it)}
                          />
                        ))
                      ) : (
                        <div className="text-center text-white/70 py-14 font-semibold">
                          {error || "No hay itinerarios seleccionados."}
                        </div>
                      )
                    ) : visibleItineraryEntries.length > 0 ? (
                      visibleItineraryEntries.map(({ it, id }) => {
                        const isSelected = selectedIds.has(id);
                        const isExpanded = expandedId === id;

                        return (
                          <ResultItineraryCard
                            key={id}
                            data={normalizeItinerary(it)}
                            isSelected={isSelected}
                            isExpanded={isExpanded}
                            onToggleExpand={() =>
                              setExpandedId(isExpanded ? null : id)
                            }
                            onToggleSelect={() => toggleSelect(id)}
                          />
                        );
                      })
                    ) : (
                      <div className="text-center text-white/70 py-14 font-semibold">
                        {error ||
                          "No se encontraron itinerarios para la ruta seleccionada."}
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-3 sm:p-4 bg-[#0c4a83] border-t border-white/10">
                  <button
                    type="button"
                    onClick={handleContinue}
                    disabled={selectedIds.size === 0}
                    className={clsx(
                      "w-full py-3.5 rounded-[12px] font-black text-sm uppercase tracking-[0.2em] shadow-xl transition-all transform active:scale-[0.98] flex items-center justify-center cursor-pointer",
                      selectedIds.size > 0
                        ? "bg-white text-[#0c4a83]"
                        : "bg-white/10 text-white/20 border border-white/5"
                    )}
                  >
                    Continuar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}