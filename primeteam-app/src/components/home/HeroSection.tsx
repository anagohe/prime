"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MapPin } from "lucide-react";
import Globe3D from "@/components/home/_Globe3D";
import { Resumen } from "./Resumen";
import type { DateRange } from "react-day-picker";

type Port = { _id: string; name: string };
type CargoType = "FCL" | "LCL";
type Step = "results" | "summary" | "form";

const VALUES = ["Seguridad", "Eficiencia", "Visibilidad", "Control"];

function clsx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function HeroSection() {
  const [ports, setPorts] = useState<Port[]>([]);

  const [selectedPol, setSelectedPol] = useState<Port | null>(null);
  const [polQuery, setPolQuery] = useState("");
  const [selectedPod, setSelectedPod] = useState<Port | null>(null);
  const [podQuery, setPodQuery] = useState("");

  const [cargoType, setCargoType] = useState<CargoType>("FCL");

  const [filteredItineraries, setFilteredItineraries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchPerformed, setSearchPerformed] = useState(false);

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [step, setStep] = useState<Step>("results");
  const [selectedRange, setSelectedRange] = useState<DateRange | undefined>(
    undefined
  );

  const [showOrigin, setShowOrigin] = useState(false);
  const [showDestination, setShowDestination] = useState(false);

  const [formData, setFormData] = useState({
    nombre: "",
    correo: "",
    telefono: "",
    empresa: "",
    mensaje: "",
  });

  const originRef = useRef<HTMLDivElement>(null);
  const destinationRef = useRef<HTMLDivElement>(null);
  const resumenRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchPorts = async () => {
      try {
        const res = await fetch("/api/ports");
        if (!res.ok) throw new Error("Failed to load ports");
        const data = await res.json();
        setPorts(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
      }
    };

    fetchPorts();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (originRef.current && !originRef.current.contains(target)) {
        setShowOrigin(false);
      }

      if (
        destinationRef.current &&
        !destinationRef.current.contains(target)
      ) {
        setShowDestination(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredPols = useMemo(() => {
    const q = normalizeText(polQuery);
    if (!q) return [];

    return ports
      .filter((p) => normalizeText(p.name).startsWith(q))
      .sort((a, b) => {
        const aName = normalizeText(a.name);
        const bName = normalizeText(b.name);

        if (aName.length !== bName.length) {
          return aName.length - bName.length;
        }

        return a.name.localeCompare(b.name, "es", { sensitivity: "base" });
      })
      .slice(0, 20);
  }, [polQuery, ports]);

  const filteredPods = useMemo(() => {
    const q = normalizeText(podQuery);
    if (!q) return [];

    return ports
      .filter((p) => normalizeText(p.name).startsWith(q))
      .sort((a, b) => {
        const aName = normalizeText(a.name);
        const bName = normalizeText(b.name);

        if (aName.length !== bName.length) {
          return aName.length - bName.length;
        }

        return a.name.localeCompare(b.name, "es", { sensitivity: "base" });
      })
      .slice(0, 20);
  }, [podQuery, ports]);

  const handleOriginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPolQuery(value);
    setSelectedPol(null);
    setError(null);
    setShowOrigin(value.trim().length > 0);
  };

  const handleDestinationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPodQuery(value);
    setSelectedPod(null);
    setError(null);
    setShowDestination(value.trim().length > 0);
  };

  const selectOrigin = (port: Port) => {
    setSelectedPol(port);
    setPolQuery(port.name);
    setShowOrigin(false);
  };

  const selectDestination = (port: Port) => {
    setSelectedPod(port);
    setPodQuery(port.name);
    setShowDestination(false);
  };

  const fetchItineraries = async (range?: DateRange) => {
    if (!selectedPol || !selectedPod) return;

    setIsLoading(true);
    setError(null);
    setSearchPerformed(true);

    setTimeout(() => {
      const el = resumenRef.current;
      if (!el) return;

      const y = el.getBoundingClientRect().top + window.pageYOffset - 32;

      window.scrollTo({
        top: Math.max(y, 0),
        behavior: "smooth",
      });
    }, 80);

    setSelectedIds(new Set());
    setExpandedId(null);
    setStep("results");

    let etdStart = "";

    if (range?.from) {
      etdStart = range.from.toISOString();
    } else {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() + 10);
      etdStart = startDate.toISOString();
    }

    const queryParams = new URLSearchParams({
      pol: selectedPol._id,
      pod: selectedPod._id,
      fcl_lcl: cargoType,
      etd_start: etdStart,
    });

    if (range?.to) {
      queryParams.append("etd_end", range.to.toISOString());
    }

    try {
      const response = await fetch(
        `/api/itineraries/filter?${queryParams.toString()}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch search results.");
      }

      const data = await response.json();
      setFilteredItineraries(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setError(e?.message || "Ocurrió un error al buscar itinerarios.");
      setFilteredItineraries([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!selectedPol || !selectedPod) {
      setError("Por favor selecciona origen y destino.");
      return;
    }

    await fetchItineraries(selectedRange);
  };

  return (
    <>
      <section className="relative min-h-[100svh] lg:h-screen lg:min-h-[850px] overflow-hidden bg-[#f1f3f5]">
        <div className="pointer-events-none absolute right-[-60px] top-[150px] h-[460px] w-[460px] rounded-full bg-[#0b3b72]/[0.03] blur-[120px]" />

        <div className="pointer-events-none select-none absolute right-[-180px] top-[160px] z-[1] sm:right-[-180px] sm:top-[145px] md:right-[-165px] md:top-[145px] lg:right-[-70px] lg:top-[220px] xl:right-[-18px] xl:top-[230px] 2xl:right-[6px]">
          <div className="relative h-[500px] w-[500px] sm:h-[620px] sm:w-[620px] md:h-[760px] md:w-[760px] lg:h-[900px] lg:w-[900px] xl:h-[980px] xl:w-[980px] 2xl:h-[1020px] 2xl:w-[1020px]">
            <Globe3D />
          </div>
        </div>

        <div className="relative z-20 mx-auto flex h-full w-full max-w-[1280px] flex-col px-6 lg:block lg:px-8 xl:px-10">
          <div className="flex min-h-full flex-col justify-start pb-16 pt-24 sm:pb-28 sm:pt-28 md:pb-32 md:pt-32 lg:block lg:pt-[220px] xl:pt-[240px]">
            <div className="grid grid-cols-1 items-start lg:grid-cols-12">
              <div className="z-30 lg:col-span-12">
                <div className="max-w-[980px]">
                  <h1 className="-ml-[4px] max-w-[980px] text-[2.9rem] font-black uppercase leading-[0.93] tracking-[-0.055em] text-[#165595] sm:text-[3.7rem] md:text-[4.55rem] lg:text-[5rem] xl:text-[5.15rem]">
                    <span className="block lg:whitespace-nowrap">
                      CONECTAMOS TU CARGA
                    </span>
                    <span className="block text-[#f3a308] lg:whitespace-nowrap">
                      CON EL MUNDO
                    </span>
                  </h1>

                  <p className="mt-6 max-w-[560px] text-[1rem] font-medium leading-[1.42] text-[#202938] md:mt-7 md:text-[1.02rem] lg:mt-8 lg:text-[1.04rem]">
                    Soluciones logísticas internacionales diseñadas para que tu
                    operación fluya de manera eficiente y confiable.
                  </p>
                </div>

                <div className="relative z-40 mt-7 w-full max-w-[1050px] sm:mt-8 md:mt-9 lg:mt-12">
                  <form onSubmit={handleSearchSubmit}>
                    <div className="overflow-visible rounded-[30px] border border-white/10 bg-[#145a97] shadow-[0_10px_22px_rgba(0,0,0,0.16)]">
                      <div className="flex flex-col md:grid md:grid-cols-2 lg:grid-cols-[1.22fr_1.22fr_0.9fr_1.06fr]">
                        <div
                          ref={originRef}
                          className="relative flex items-center gap-4 border-b border-white/18 px-6 py-4 md:border-r md:border-r-white/18 lg:min-h-[74px] lg:border-b-0 lg:px-8 lg:py-3"
                        >
                          <div className="shrink-0 text-white/95">
                            <MapPin size={25} strokeWidth={1.8} />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="mb-1 text-[0.68rem] font-extrabold uppercase leading-none tracking-[0.14em] text-white">
                              ORIGEN
                            </div>

                            <input
                              type="text"
                              placeholder="Ciudad o Puerto de Salida"
                              value={polQuery}
                              onChange={handleOriginChange}
                              onFocus={() =>
                                polQuery.trim().length > 0 && setShowOrigin(true)
                              }
                              className="search-field w-full bg-transparent text-[0.84rem] font-medium leading-tight text-white outline-none placeholder:text-white/55 lg:text-[0.86rem]"
                              autoComplete="off"
                              autoCorrect="off"
                              autoCapitalize="none"
                              spellCheck={false}
                            />

                            <AnimatePresence>
                              {showOrigin && filteredPols.length > 0 && (
                                <motion.div
                                  initial={{ opacity: 0, y: 8 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: 8 }}
                                  className="port-options-scroll absolute left-1/2 top-[calc(100%+14px)] z-[80] max-h-[168px] w-[calc(100%-28px)] -translate-x-1/2 overflow-y-auto rounded-2xl bg-white shadow-2xl md:w-[calc(100%-36px)] lg:left-0 lg:w-full lg:translate-x-0"
                                >
                                  {filteredPols.map((p) => (
                                    <div
                                      key={p._id}
                                      onClick={() => selectOrigin(p)}
                                      className="flex min-h-[56px] cursor-pointer items-center gap-2 border-b border-slate-100 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 last:border-b-0"
                                    >
                                      <MapPin
                                        size={14}
                                        className="text-slate-400"
                                      />
                                      {p.name}
                                    </div>
                                  ))}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>

                        <div
                          ref={destinationRef}
                          className="relative flex items-center gap-4 border-b border-white/18 px-6 py-4 lg:min-h-[74px] lg:border-b-0 lg:border-r lg:border-r-white/18 lg:px-8 lg:py-3"
                        >
                          <div className="shrink-0 text-white/95">
                            <MapPin size={25} strokeWidth={1.8} />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="mb-1 text-[0.68rem] font-extrabold uppercase leading-none tracking-[0.14em] text-white">
                              DESTINO
                            </div>

                            <input
                              type="text"
                              placeholder="Ciudad o Puerto de Destino"
                              value={podQuery}
                              onChange={handleDestinationChange}
                              onFocus={() =>
                                podQuery.trim().length > 0 &&
                                setShowDestination(true)
                              }
                              className="search-field w-full bg-transparent text-[0.84rem] font-medium leading-tight text-white outline-none placeholder:text-white/55 lg:text-[0.86rem]"
                              autoComplete="off"
                              autoCorrect="off"
                              autoCapitalize="none"
                              spellCheck={false}
                            />

                            <AnimatePresence>
                              {showDestination && filteredPods.length > 0 && (
                                <motion.div
                                  initial={{ opacity: 0, y: 8 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: 8 }}
                                  className="port-options-scroll absolute left-1/2 top-[calc(100%+14px)] z-[80] max-h-[168px] w-[calc(100%-28px)] -translate-x-1/2 overflow-y-auto rounded-2xl bg-white shadow-2xl md:w-[calc(100%-36px)] lg:left-0 lg:w-full lg:translate-x-0"
                                >
                                  {filteredPods.map((p) => (
                                    <div
                                      key={p._id}
                                      onClick={() => selectDestination(p)}
                                      className="flex min-h-[56px] cursor-pointer items-center gap-2 border-b border-slate-100 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 last:border-b-0"
                                    >
                                      <MapPin
                                        size={14}
                                        className="text-slate-400"
                                      />
                                      {p.name}
                                    </div>
                                  ))}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>

                        <div className="flex items-center border-b border-white/18 px-6 py-4 md:border-b-0 lg:min-h-[74px] lg:px-8 lg:py-3">
                          <div className="min-w-0 flex-1 lg:pl-6">
                            <div className="mb-1 text-[0.68rem] font-extrabold uppercase leading-none tracking-[0.14em] text-white">
                              TIPO DE MODALIDAD
                            </div>

                            <div className="relative flex w-[140px] rounded-[10px] bg-white/12 p-[3px]">
                              <motion.div
                                className="absolute bottom-[3px] top-[3px] rounded-[8px] bg-[#5d8dbb]"
                                initial={false}
                                animate={{
                                  left: cargoType === "FCL" ? "3px" : "50%",
                                  right: cargoType === "FCL" ? "50%" : "3px",
                                }}
                                transition={{
                                  type: "spring",
                                  stiffness: 320,
                                  damping: 30,
                                }}
                              />

                              <button
                                type="button"
                                onClick={() => setCargoType("FCL")}
                                className={clsx(
                                  "relative z-10 flex-1 cursor-pointer rounded-[8px] px-2 py-[0.08rem] text-[0.74rem] font-extrabold transition-colors",
                                  cargoType === "FCL"
                                    ? "text-white"
                                    : "text-white/65 hover:text-white/85"
                                )}
                              >
                                FCL
                              </button>

                              <button
                                type="button"
                                onClick={() => setCargoType("LCL")}
                                className={clsx(
                                  "relative z-10 flex-1 cursor-pointer rounded-[8px] px-2 py-[0.08rem] text-[0.74rem] font-extrabold transition-colors",
                                  cargoType === "LCL"
                                    ? "text-white"
                                    : "text-white/65 hover:text-white/85"
                                )}
                              >
                                LCL
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-center px-5 py-4 lg:min-h-[74px] lg:px-6 lg:py-3">
                          <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full cursor-pointer whitespace-nowrap rounded-full bg-white px-4 py-[0.82rem] text-[0.9rem] font-black uppercase tracking-[0.005em] text-[#165595] transition-all hover:bg-slate-50 active:scale-[0.985] disabled:opacity-60 lg:max-w-full"
                          >
                            {isLoading ? "Buscando" : "BUSCAR ITINERARIO"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </form>

                  {error && (
                    <p className="mt-3 text-sm font-semibold text-rose-600">
                      {error}
                    </p>
                  )}
                </div>
              </div>

              <div className="hidden lg:col-span-4 lg:block" />
            </div>
          </div>
        </div>

        <div className="relative z-20 mt-auto pb-7 md:pb-9 lg:absolute lg:bottom-0 lg:left-0 lg:right-0">
          <div className="mx-auto flex max-w-[1280px] flex-wrap items-center justify-between gap-6 px-6 text-[14px] font-medium text-[#165595] md:text-[16px] lg:px-8 xl:px-10">
            {VALUES.map((v) => (
              <span key={v} className="cursor-default">
                {v}
              </span>
            ))}
          </div>
        </div>
      </section>

      {searchPerformed && (
        <div ref={resumenRef}>
          <Resumen
            filteredItineraries={filteredItineraries}
            isLoading={isLoading}
            error={error}
            selectedPol={selectedPol}
            selectedPod={selectedPod}
            cargoType={cargoType}
            selectedRange={selectedRange}
            setSelectedRange={setSelectedRange}
            fetchItineraries={fetchItineraries}
            expandedId={expandedId}
            setExpandedId={setExpandedId}
            selectedIds={selectedIds}
            setSelectedIds={setSelectedIds}
            step={step}
            setStep={setStep}
            formData={formData}
            setFormData={setFormData}
          />
        </div>
      )}

      <style jsx global>{`
        .search-field::-webkit-contacts-auto-fill-button,
        .search-field::-webkit-credentials-auto-fill-button {
          visibility: hidden;
          display: none !important;
          pointer-events: none;
          position: absolute;
          right: 0;
        }

        .search-field::-ms-clear,
        .search-field::-ms-reveal {
          display: none;
          width: 0;
          height: 0;
        }

        .port-options-scroll {
          scrollbar-width: thin;
          scrollbar-color: rgba(21, 90, 151, 0.35) transparent;
        }

        .port-options-scroll::-webkit-scrollbar {
          width: 8px;
        }

        .port-options-scroll::-webkit-scrollbar-track {
          background: transparent;
          margin: 10px 0;
        }

        .port-options-scroll::-webkit-scrollbar-thumb {
          background: rgba(21, 90, 151, 0.28);
          border-radius: 999px;
          border: 2px solid transparent;
          background-clip: padding-box;
        }

        .port-options-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(21, 90, 151, 0.42);
          border-radius: 999px;
          border: 2px solid transparent;
          background-clip: padding-box;
        }
      `}</style>
    </>
  );
}