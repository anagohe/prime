"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Package,
  Plane,
  Ship,
  Truck,
  Warehouse,
  Globe,
  Timer,
  Boxes,
  FileCheck,
  Clock,
  CircleDollarSign,
  Route,
  MapPinned,
  Handshake,
  AlertTriangle,
  ScrollText,
  MessageCircle,
} from "lucide-react";

/**
 * Standard Image component to replace Next.js Image
 */
const CustomImage: React.FC<{
  src: string;
  alt: string;
  className?: string;
}> = ({ src, alt, className = "" }) => (
  <img
    src={src}
    alt={alt}
    className={`${className} w-full h-full object-cover`}
    loading="lazy"
  />
);

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

type QuickCard = {
  title: string;
  description: string;
  image: string;
};

type ServiceIcon = {
  slug: string;
  title: string;
  desc: string;
  icon: any;
  tone: "amber" | "blue";
};

type LogisticsFeature = {
  label: string;
  icon: any;
};

type LogisticsCard = {
  title: string;
  description: string;
  mobileDescription?: string;
  image: string;
  features: LogisticsFeature[];
};

// Component for large cards (Carousel and Bottom)
const LogisticsCardUI: React.FC<{
  card: LogisticsCard;
  widthClass?: string;
  isActive?: boolean;
  onActivate?: () => void;
  compactMobileText?: boolean;
}> = ({
  card,
  widthClass = "",
  isActive = false,
  onActivate,
  compactMobileText = false,
}) => (
  <div
    onTouchStart={onActivate}
    onClick={onActivate}
    className={cn(
      `group relative ${widthClass} h-[260px] sm:h-[300px] md:h-[350px] rounded-[22px] overflow-hidden shadow-[0_16px_36px_rgba(0,0,0,0.15)] cursor-pointer flex-shrink-0 transition-transform hover:scale-[1.01]`,
      isActive && "scale-[1.01]"
    )}
  >
    <CustomImage
      src={card.image}
      alt={card.title}
      className={cn(
        "transition-transform duration-1000 ease-out",
        isActive ? "scale-105" : "group-hover:scale-105"
      )}
    />

    <div
      className={cn(
        "absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 transition-opacity duration-500",
        isActive ? "opacity-0" : "group-hover:opacity-0"
      )}
    />
    <div
      className={cn(
        "absolute inset-0 bg-black/75 transition-opacity duration-500 backdrop-blur-[2px]",
        isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
      )}
    />

    <div className="absolute left-8 top-12 z-10">
      <h3
        className={cn(
          "font-bold text-lg md:text-xl tracking-tight transition-colors duration-500",
          isActive ? "text-amber-400" : "text-white group-hover:text-amber-400"
        )}
      >
        {card.title}
      </h3>
    </div>

    <div
      className={cn(
        "absolute inset-0 flex items-center justify-center px-10 pt-16 pb-20 transition-opacity duration-500 ease-in-out pointer-events-none",
        isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
      )}
    >
      <p
        className={cn(
          "text-white text-sm md:text-base text-justify font-medium max-w-lg",
          compactMobileText ? "leading-[1.3] sm:leading-[1.45] md:leading-relaxed" : "leading-relaxed"
        )}
      >
        <span className="sm:hidden">{card.mobileDescription ?? card.description}</span>
        <span className="hidden sm:inline">{card.description}</span>
      </p>
    </div>

    <div className="absolute bottom-8 left-0 right-0 px-8 flex justify-around items-start z-10">
      {card.features.map((feature, idx) => {
        const Icon = feature.icon;
        return (
          <div key={idx} className="flex w-[110px] md:w-[140px] flex-col items-center gap-2">
            <div className="h-9 md:h-11 flex items-center justify-center">
              <Icon
                className={cn(
                  "w-7 h-7 md:w-9 md:h-9 text-white transition-transform duration-300",
                  isActive ? "scale-110" : "group-hover:scale-110"
                )}
                strokeWidth={1.5}
              />
            </div>
            <div className="hidden sm:flex h-[30px] md:h-[34px] items-start justify-center">
              <span
                className={cn(
                  "text-[10px] md:text-[12px] text-white/90 font-medium transition-opacity duration-500 text-center leading-tight tracking-tight",
                  isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                )}
              >
                {feature.label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

export function ServicesGrid() {
  const railRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);
  const pauseUntilRef = useRef(0);
  const [ready, setReady] = useState(false);
  const [isTouchViewport, setIsTouchViewport] = useState(false);

  const [activeService, setActiveService] = useState<string | null>(null);
  const [activeQuickCard, setActiveQuickCard] = useState<string | null>(null);
  const [activeLargeCard, setActiveLargeCard] = useState<string | null>(null);

  const serviceRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const highlightTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const quickCardTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const largeCardTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const carouselPauseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const quickCards: QuickCard[] = useMemo(
    () => [
      {
        title: "Cotiza tu envío en segundos con Freightoscope",
        description: "Obtén tarifas instantáneas sin intermediarios",
        image:
          "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=2400&auto=format&fit=crop",
      },
      {
        title: "Soluciones logísiticas a tu medida",
        description: "Adaptadas a tus requerimientos y tipo de carga",
        image:
          "https://images.unsplash.com/photo-1553413077-190dd305871c?q=80&w=2400&auto=format&fit=crop",
      },
      {
        title: "Rastrea tu carga en tiempo real",
        description: "Monitorea cada movimiento 24/7",
        image:
          "https://images.unsplash.com/photo-1512428559087-560fa5ceab42?q=80&w=2400&auto=format&fit=crop",
      },
    ],
    []
  );

  const servicesIcons: ServiceIcon[] = useMemo(
    () => [
      {
        slug: "transporte-consolidado",
        title: "Transporte Consolidado",
        desc: "Optimiza costos compartiendo espacio de carga. Agrupamos tu mercancía con otros envíos para reducir costos sin comprometer tiempos ni seguridad.",
        icon: Truck,
        tone: "amber",
      },
      {
        slug: "transporte-aereo",
        title: "Transporte Aéreo",
        desc: "Velocidad y eficiencia para envíos urgentes. Movemos tu carga con tiempos de tránsito reducidos y seguimiento en tiempo real.",
        icon: Plane,
        tone: "amber",
      },
      {
        slug: "transporte-maritimo",
        title: "Transporte Marítimo",
        desc: "Soluciones confiables para carga internacional. Conectamos tus envíos con los principales puertos del mundo de forma segura y eficiente.",
        icon: Ship,
        tone: "amber",
      },
      {
        slug: "transporte-terrestre-nacional-e-internacional",
        title: "Terrestre Nacional e Internacional",
        desc: "Cobertura completa por carretera. Transportamos tu mercancía con rutas optimizadas a nivel nacional e internacional.",
        icon: Warehouse,
        tone: "amber",
      },
      {
        slug: "revalidaciones-y-entregas",
        title: "Revalidaciones y Entregas",
        desc: "Coordinación eficiente hasta el destino final. Gestionamos documentación y entregas para asegurar un flujo logístico sin retrasos.",
        icon: Truck,
        tone: "blue",
      },
      {
        slug: "servicio-aduanal-y-almacenajes",
        title: "Servicio Aduanal y Almacenajes",
        desc: "Cumplimiento y resguardo seguro de tu carga. Nos encargamos de procesos aduanales y almacenamiento con total control y seguridad.",
        icon: Truck,
        tone: "blue",
      },
    ],
    []
  );

  const allLargeCards: LogisticsCard[] = useMemo(
    () => [
      {
        title: "Transporte Marítimo",
        description:
          "Conectividad global con costos optimizados. Transporta grandes volúmenes con soluciones marítimas confiables y planificación precisa.",
        image:
          "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=2400&auto=format&fit=crop",
        features: [
          { label: "ETA´s predecibles", icon: Clock },
          { label: "Optimización de costos", icon: CircleDollarSign },
          { label: "Rastreo en tiempo real", icon: Route },
        ],
      },
      {
        title: "Transporte Consolidado",
        description:
          "Optimiza costos sin comprometer eficiencia. Comparte espacio de carga y reduce gastos operativos con una solución flexible, ideal para empresas con volúmenes menores.",
        image:
          "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=2400&auto=format&fit=crop",
        features: [
          { label: "Optimización del espacio", icon: Package },
          { label: "Flexibilidad en volúmenes", icon: Boxes },
          { label: "Tiempos de tránsito optimizados", icon: Clock },
        ],
      },
      {
        title: "Transporte Terrestre Nacional e Internacional",
        description:
          "Cobertura terrestre nacional e internacional con visibilidad continua. Aseguramos el traslado de tu mercancía con una red confiable y monitoreo constante.",
        mobileDescription:
          "Cobertura terrestre nacional e internacional con visibilidad continua.",
        image:
          "https://images.unsplash.com/photo-1519003722824-194d4455a60c?q=80&w=2400&auto=format&fit=crop",
        features: [
          { label: "Cobertura completa", icon: Truck },
          { label: "Red de transportistas confiable", icon: Globe },
          { label: "Rastreo GPS", icon: MapPinned },
        ],
      },
      {
        title: "Transporte Aéreo",
        description:
          "Velocidad y precisión, ideal para envíos urgentes. y tiempos de entrega reducidos Movemos tu carga con rapidez y seguridad a través de conexiones globales estratégicas.",
        image:
          "https://images.unsplash.com/photo-1569154941061-e231b4725ef1?q=80&w=2400&auto=format&fit=crop",
        features: [
          { label: "Velocidad y eficiencia", icon: Timer },
          { label: "Manejo especializado", icon: Package },
          { label: "Acceso global", icon: Globe },
        ],
      },
    ],
    []
  );

  const bottomCards: LogisticsCard[] = useMemo(
    () => [
      {
        title: "Revalidaciones y Entregas",
        description:
          "Procesos ágiles en destino final. Nos encargamos de la documentación y coordinación de la entrega final para asegurar rapidez y claridad.",
        image:
          "https://images.unsplash.com/photo-1580674285054-bed31e145f59?q=80&w=2400&auto=format&fit=crop",
        features: [
          { label: "Eficiencia en trámites", icon: FileCheck },
          { label: "Coordinación efectiva", icon: Handshake },
          { label: "Minimización de riesgos", icon: AlertTriangle },
        ],
      },
      {
        title: "Servicio Aduanal y Almacenajes",
        description:
          "Control total y cumplimiento garantizado. Gestionamos tu operación aduanera y almacenaje estrategico con seguridad y precisión.",
        image:
          "https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=2400&auto=format&fit=crop",
        features: [
          { label: "Cumplimiento normativo", icon: ScrollText },
          { label: "Asesoría personalizada", icon: MessageCircle },
          { label: "Flexibilidad de espacio", icon: Warehouse },
        ],
      },
    ],
    []
  );

  const repeatedCarousel = useMemo(() => [...allLargeCards, ...allLargeCards], [allLargeCards]);

  const triggerServiceFocus = useCallback((slug: string) => {
    const target = serviceRefs.current[slug];
    if (!target) return;

    if (highlightTimeoutRef.current) {
      clearTimeout(highlightTimeoutRef.current);
    }

    setActiveService(slug);

    const top = target.getBoundingClientRect().top + window.scrollY - 180;
    window.scrollTo({
      top: Math.max(top, 0),
      behavior: "smooth",
    });

    highlightTimeoutRef.current = setTimeout(() => {
      setActiveService((current) => (current === slug ? null : current));
    }, 8000);
  }, []);

  const triggerTouchService = useCallback(
    (slug: string) => {
      if (!isTouchViewport) return;

      if (highlightTimeoutRef.current) {
        clearTimeout(highlightTimeoutRef.current);
      }

      setActiveService(slug);

      highlightTimeoutRef.current = setTimeout(() => {
        setActiveService((current) => (current === slug ? null : current));
      }, 4000);
    },
    [isTouchViewport]
  );

  const triggerTouchQuickCard = useCallback(
    (cardId: string) => {
      if (!isTouchViewport) return;

      if (quickCardTimeoutRef.current) {
        clearTimeout(quickCardTimeoutRef.current);
      }

      setActiveQuickCard(cardId);

      quickCardTimeoutRef.current = setTimeout(() => {
        setActiveQuickCard((current) => (current === cardId ? null : current));
      }, 4000);
    },
    [isTouchViewport]
  );

  const pauseCarouselTemporarily = useCallback(() => {
    pausedRef.current = true;
    pauseUntilRef.current = Date.now() + 3000;

    if (carouselPauseTimeoutRef.current) {
      clearTimeout(carouselPauseTimeoutRef.current);
    }

    carouselPauseTimeoutRef.current = setTimeout(() => {
      if (Date.now() >= pauseUntilRef.current) {
        pausedRef.current = false;
      }
    }, 3000);
  }, []);

  const handleCarouselCardActivate = useCallback(
    (cardId: string) => {
      pauseCarouselTemporarily();

      if (!isTouchViewport) return;

      if (largeCardTimeoutRef.current) {
        clearTimeout(largeCardTimeoutRef.current);
      }

      setActiveLargeCard(cardId);

      largeCardTimeoutRef.current = setTimeout(() => {
        setActiveLargeCard((current) => (current === cardId ? null : current));
      }, 4000);
    },
    [isTouchViewport, pauseCarouselTemporarily]
  );

  const handleBottomCardActivate = useCallback(
    (cardId: string) => {
      if (!isTouchViewport) return;

      if (largeCardTimeoutRef.current) {
        clearTimeout(largeCardTimeoutRef.current);
      }

      setActiveLargeCard(cardId);

      largeCardTimeoutRef.current = setTimeout(() => {
        setActiveLargeCard((current) => (current === cardId ? null : current));
      }, 4000);
    },
    [isTouchViewport]
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    const updateTouchViewport = () => {
      const isSmallScreen = window.innerWidth <= 1024;
      const hasTouch =
        "ontouchstart" in window ||
        navigator.maxTouchPoints > 0 ||
        ((navigator as Navigator & { msMaxTouchPoints?: number }).msMaxTouchPoints ?? 0) > 0;

      setIsTouchViewport(isSmallScreen || hasTouch);
    };

    updateTouchViewport();

    window.addEventListener("resize", updateTouchViewport);

    return () => {
      window.removeEventListener("resize", updateTouchViewport);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const pendingService = window.sessionStorage.getItem("primeTeamSelectedService");
    if (!pendingService) return;

    window.sessionStorage.removeItem("primeTeamSelectedService");

    const timer = window.setTimeout(() => {
      triggerServiceFocus(pendingService);
    }, 300);

    return () => window.clearTimeout(timer);
  }, [triggerServiceFocus]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handler = (event: Event) => {
      const customEvent = event as CustomEvent<{ slug?: string }>;
      const slug = customEvent.detail?.slug;
      if (!slug) return;
      triggerServiceFocus(slug);
    };

    window.addEventListener("primeTeam:focus-service", handler as EventListener);

    return () => {
      window.removeEventListener("primeTeam:focus-service", handler as EventListener);
    };
  }, [triggerServiceFocus]);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;

    let raf = 0;
    let last = 0;
    let x = 0;

    const pxPerSecond = 90;

    const measureHalf = () => Math.max(1, rail.scrollWidth / 2);

    const apply = () => {
      rail.style.transform = `translate3d(${x}px, 0, 0)`;
    };

    const reset = () => {
      x = 0;
      apply();
      setReady(true);
    };

    const t = window.setTimeout(reset, 0);

    const ro = new ResizeObserver(() => {
      const half = measureHalf();
      if (x <= -half) x = 0;
      apply();
    });
    ro.observe(rail);

    const step = (ts: number) => {
      if (!last) last = ts;
      const dt = ts - last;
      last = ts;

      const isTemporarilyPaused = Date.now() < pauseUntilRef.current;

      if (!pausedRef.current && !isTemporarilyPaused) {
        const dx = (pxPerSecond * dt) / 1000;
        x -= dx;

        const half = measureHalf();
        if (x <= -half) x = 0;

        apply();
      }

      raf = requestAnimationFrame(step);
    };

    raf = requestAnimationFrame(step);

    return () => {
      window.clearTimeout(t);
      ro.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (highlightTimeoutRef.current) {
        clearTimeout(highlightTimeoutRef.current);
      }
      if (quickCardTimeoutRef.current) {
        clearTimeout(quickCardTimeoutRef.current);
      }
      if (largeCardTimeoutRef.current) {
        clearTimeout(largeCardTimeoutRef.current);
      }
      if (carouselPauseTimeoutRef.current) {
        clearTimeout(carouselPauseTimeoutRef.current);
      }
    };
  }, []);

  return (
    <section id="servicios" className="w-full bg-white">
      <div className="mx-auto w-full px-3 sm:px-6 lg:px-10 max-w-screen-2xl">
        <div className="mt-6 sm:mt-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {quickCards.map((card, idx) => {
              const cardId = `quick-${idx}`;
              const isActive = activeQuickCard === cardId;

              return (
                <div
                  key={idx}
                  onTouchStart={isTouchViewport ? () => triggerTouchQuickCard(cardId) : undefined}
                  onClick={isTouchViewport ? () => triggerTouchQuickCard(cardId) : undefined}
                  className={cn(
                    "group relative h-[150px] sm:h-[170px] lg:h-[200px] rounded-[18px] overflow-hidden shadow-[0_14px_30px_rgba(0,0,0,0.12)] cursor-pointer transition-transform hover:scale-[1.01]",
                    isActive && "scale-[1.01]"
                  )}
                >
                  <CustomImage
                    src={card.image}
                    alt={card.title}
                    className={cn(
                      "transition-transform duration-1000 ease-out",
                      isActive ? "scale-[1.05]" : "group-hover:scale-[1.05]"
                    )}
                  />

                  <div
                    className={cn(
                      "absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-black/55 transition-opacity duration-500",
                      isActive ? "opacity-0" : "group-hover:opacity-0"
                    )}
                  />
                  <div
                    className={cn(
                      "absolute inset-0 bg-black/75 transition-opacity duration-500 backdrop-blur-[2px]",
                      isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                    )}
                  />

                  <div
                    className={cn(
                      "absolute left-6 right-6 bottom-[84px] sm:bottom-[92px] lg:bottom-[104px] z-10 transition-opacity duration-500 ease-in-out pointer-events-none",
                      isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                    )}
                  >
                    <p className="text-white text-[15px] sm:text-[16px] font-medium tracking-tight text-center">
                      {card.description}
                    </p>
                  </div>

                  <div className="absolute left-6 right-6 bottom-[60px] h-[0.5px] bg-white/40 z-10" />

                  <div
                    className={cn(
                      "absolute left-6 right-6 bottom-[24px] z-10 text-[15px] sm:text-[16px] font-medium tracking-tight transition-colors duration-500 text-center",
                      isActive ? "text-amber-400" : "text-white group-hover:text-amber-400"
                    )}
                  >
                    {card.title}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="py-16 sm:py-20">
          <div className="text-center mb-16">
            <div className="text-amber-500 font-semibold mb-6 text-xl tracking-tight">Nuestros Servicios</div>
            <h2 className="mx-auto max-w-5xl text-[#1e4079] font-medium text-[32px] sm:text-[42px] leading-[1.15]">
              Descubre como gestionamos tu carga de principio a fin, con eficiencia, experiencia y calidad total.
            </h2>
          </div>

          <div className="mx-auto max-w-[1500px] px-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-10 xl:gap-x-14 gap-y-16">
              {servicesIcons.slice(0, 4).map((s, idx) => {
                const Icon = s.icon;
                const isActive = activeService === s.slug;

                return (
                  <div
                    key={idx}
                    ref={(el) => {
                      serviceRefs.current[s.slug] = el;
                    }}
                    onTouchStart={isTouchViewport ? () => triggerTouchService(s.slug) : undefined}
                    onClick={isTouchViewport ? () => triggerTouchService(s.slug) : undefined}
                    className={`group flex flex-col items-center text-center cursor-pointer w-full max-w-[340px] mx-auto transition-all duration-300 ${
                      isActive ? "scale-[1.03]" : ""
                    }`}
                  >
                    <div className={`mb-6 transition-transform duration-300 ${isActive ? "scale-110" : "group-hover:scale-110"}`}>
                      <Icon size={58} strokeWidth={1.2} className="text-amber-500" />
                    </div>
                    <div
                      className={`text-[16px] mb-3 leading-tight transition-colors duration-300 max-w-[320px] ${
                        isActive
                          ? "font-black text-[#1e4079]"
                          : "font-bold text-[#334155] group-hover:text-[#1e4079]"
                      }`}
                    >
                      {s.title}
                    </div>
                    <p
                      className={`text-[15px] leading-[1.85] max-w-[340px] text-justify transition-all duration-300 ${
                        isActive
                          ? "text-slate-600 scale-[1.03]"
                          : "text-slate-400 group-hover:text-slate-600 group-hover:scale-[1.03]"
                      }`}
                    >
                      {s.desc}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 gap-x-24 gap-y-16">
              {servicesIcons.slice(4).map((s, idx) => {
                const Icon = s.icon;
                const isActive = activeService === s.slug;

                return (
                  <div
                    key={idx}
                    ref={(el) => {
                      serviceRefs.current[s.slug] = el;
                    }}
                    onTouchStart={isTouchViewport ? () => triggerTouchService(s.slug) : undefined}
                    onClick={isTouchViewport ? () => triggerTouchService(s.slug) : undefined}
                    className={`group flex flex-col items-center text-center cursor-pointer w-full max-w-[340px] sm:max-w-[760px] mx-auto transition-all duration-300 ${
                      isActive ? "scale-[1.03]" : ""
                    }`}
                  >
                    <div className={`mb-6 transition-transform duration-300 ${isActive ? "scale-110" : "group-hover:scale-110"}`}>
                      <Icon size={58} strokeWidth={1.2} className="text-[#0ea5e9]" />
                    </div>
                    <div
                      className={`text-[16px] mb-3 leading-tight transition-colors duration-300 max-w-[320px] sm:max-w-[520px] ${
                        isActive
                          ? "font-black text-[#1e4079]"
                          : "font-bold text-[#334155] group-hover:text-[#1e4079]"
                      }`}
                    >
                      {s.title}
                    </div>
                    <p
                      className={`text-[15px] leading-[1.85] max-w-[340px] sm:max-w-[760px] text-justify transition-all duration-300 ${
                        isActive
                          ? "text-slate-600 scale-[1.03]"
                          : "text-slate-400 group-hover:text-slate-600 group-hover:scale-[1.03]"
                      }`}
                    >
                      {s.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="pb-16 sm:pb-20">
          <div
            onMouseEnter={() => {
              pausedRef.current = true;
            }}
            onMouseLeave={() => {
              if (Date.now() >= pauseUntilRef.current) {
                pausedRef.current = false;
              }
            }}
            className="overflow-hidden pb-10 select-none"
          >
            <div
              ref={railRef}
              className="flex gap-6 will-change-transform"
              style={{ opacity: ready ? 1 : 0 }}
            >
              {repeatedCarousel.map((c, idx) => {
                const cardId = `carousel-${idx}`;
                return (
                  <LogisticsCardUI
                    key={idx}
                    card={c}
                    widthClass="w-[320px] sm:w-[390px] md:w-[450px] lg:w-[520px]"
                    isActive={activeLargeCard === cardId}
                    onActivate={() => handleCarouselCardActivate(cardId)}
                    compactMobileText
                  />
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-2">
            {bottomCards.map((card, idx) => {
              const cardId = `bottom-${idx}`;
              return (
                <LogisticsCardUI
                  key={idx}
                  card={card}
                  widthClass="w-full"
                  isActive={activeLargeCard === cardId}
                  onActivate={isTouchViewport ? () => handleBottomCardActivate(cardId) : undefined}
                />
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

export const ServiceSection = ServicesGrid;