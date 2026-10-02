"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Mail,
  Phone,
  MapPin,
  Building2,
  Quote,
  MessageCircle,
} from "lucide-react";

import { Footer } from "@/components/home/Footer";
import { Navbar } from "@/components/home/Navbar";

// --- DATOS ---
const TESTIMONIALS = [
  {
    id: 1,
    text: "Garantizamos el manejo eficiente y seguro de tu mercancía.",
    author: "Logística segura y confiable",
  },
  {
    id: 2,
    text: "Un equipo experto acompañándote en todo momento.",
    author: "Atención personalizada",
  },
  {
    id: 3,
    text: "Seguimiento claro y actualizado 24/7.",
    author: "Control total de tu carga",
  },
];

const CONTACT_INFO = [
  {
    icon: Mail,
    title: "Correo Electrónico",
    value: "primeteam@primeteam.com.mx",
    link: "mailto:primeteam@primeteam.com.mx",
    external: false,
  },
  {
    icon: Phone,
    title: "Teléfono",
    value: "+52  55 4855 7965",
    link: "tel:+525548557965",
    external: false,
  },
  {
    icon: Building2,
    title: "Oficina Principal",
    value: "Calle Orizaba #154, Roma Norte, CDMX",
    link: "https://maps.app.goo.gl/9jkj7GnVijXMQofC8",
    external: true,
  },
  {
    icon: MapPin,
    title: "Oficina Empresarial",
    value: "Business Club Mérida, Calle 32, Yucatán",
    link: "https://maps.app.goo.gl/aC6TQr1NKEzN11YE6?g_st=ic",
    external: true,
  },
];

export default function ContactPage() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const shouldReduceMotion = useReducedMotion();

  const headingLetters = useMemo(() => "Contacto".split(""), []);

  useEffect(() => {
    if (TESTIMONIALS.length <= 1) return;

    const timer = window.setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 5000);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-white font-sans">
      <Navbar />

      <main className="flex-grow">
        {/* --- 1. HERO SUPERIOR --- */}
        <section className="relative h-[400px] lg:h-[350px] flex items-center justify-center overflow-hidden mx-4 lg:mx-5 mt-4 rounded-3xl shadow-2xl shadow-slate-200">
          <div className="absolute inset-0 z-0">
            <img
              src="https://images.unsplash.com/photo-1494412519320-aa613dfb7738?q=80&w=2070&auto=format&fit=crop"
              alt="Contacto PrimeTeam Logística"
              className="absolute inset-0 w-full h-full object-cover"
              loading="eager"
              decoding="async"
              draggable={false}
            />
            <div className="absolute inset-0 bg-slate-900/30" />
            <div className="absolute inset-0 bg-gradient-to-t from-amber-500/80 via-amber-500/40 to-transparent" />
          </div>

          <div className="relative z-10 text-center mt-10 px-4">
            <motion.h1 className="text-3xl lg:text-6xl font-bold text-white tracking-normal uppercase drop-shadow-2xl overflow-hidden flex justify-center gap-[0.02em] !font-sans">
              {headingLetters.map((char, i) => (
                <motion.span
                  key={`${char}-${i}`}
                  initial={shouldReduceMotion ? false : { y: "100%", opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={
                    shouldReduceMotion
                      ? { duration: 0 }
                      : {
                          duration: 0.45,
                          delay: i * 0.045,
                          ease: [0.22, 1, 0.36, 1],
                        }
                  }
                  className="inline-block will-change-transform"
                >
                  {char}
                </motion.span>
              ))}
            </motion.h1>
          </div>
        </section>

        {/* --- 2. INTRO & INFO CARDS --- */}
        <section className="py-16 lg:py-20 container mx-auto px-6 lg:px-12">
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.55, ease: "easeOut" }}
            className="max-w-5xl mx-auto mb-12 lg:mb-16 will-change-transform"
          >
            <span className="text-amber-500 font-semibold text-lg mb-2 block">
              Hablemos de tu envío
            </span>
            <h2 className="text-3xl lg:text-5xl font-bold text-slate-900 mb-6">
              Impulsa tu logística con nuestro equipo
            </h2>
            <p className="text-slate-500 text-base lg:text-lg leading-relaxed">
              Recibe asesoría personalizada para optimizar tus envíos nacionales e internacionales.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-12 max-w-5xl mx-auto">
            {CONTACT_INFO.map((item, idx) => (
              <motion.a
                key={item.title}
                href={item.link}
                target={item.external ? "_blank" : undefined}
                rel={item.external ? "noreferrer" : undefined}
                initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: shouldReduceMotion ? 0 : 0.4,
                  delay: shouldReduceMotion ? 0 : 0.12 + idx * 0.08,
                  ease: "easeOut",
                }}
                whileHover={
                  shouldReduceMotion
                    ? undefined
                    : { y: -6, transition: { duration: 0.18 } }
                }
                className="flex items-start gap-4 lg:gap-5 group p-4 lg:p-6 rounded-3xl hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 border border-transparent hover:border-slate-100 will-change-transform"
              >
                <div className="flex-shrink-0 w-12 h-12 lg:w-14 lg:h-14 bg-amber-400 rounded-full flex items-center justify-center shadow-lg shadow-amber-400/20 text-white transition-transform duration-300 group-hover:scale-110">
                  <item.icon size={22} className="lg:hidden" />
                  <item.icon size={26} className="hidden lg:block" />
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 text-base lg:text-lg mb-1">
                    {item.title}
                  </h3>
                  <p className="text-slate-600 font-medium text-sm lg:text-base group-hover:text-amber-600 transition-colors break-words">
                    {item.value}
                  </p>
                </div>
              </motion.a>
            ))}
          </div>
        </section>

        {/* --- 3. SECCIÓN WHATSAPP --- */}
        <section className="pb-24 container mx-auto px-6 lg:px-12">
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: shouldReduceMotion ? 0 : 0.55,
              delay: shouldReduceMotion ? 0 : 0.2,
              ease: "easeOut",
            }}
            className="max-w-6xl mx-auto bg-slate-50 rounded-[2rem] p-6 lg:p-16 shadow-sm border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-10 will-change-transform"
          >
            <div className="max-w-xl text-center md:text-left">
              <h3 className="text-2xl lg:text-4xl font-bold text-slate-900 mb-4">
                Solicita tu asesoría logística
              </h3>
              <p className="text-slate-500 text-base lg:text-lg leading-relaxed">
                Cuéntanos sobre tu envío y nuestro equipo te contactará lo antes posible.
              </p>
            </div>

            <div className="flex-shrink-0 w-full md:w-auto flex justify-center md:mr-12 lg:mr-20">
              <motion.a
                href="https://wa.me/525525060276"
                target="_blank"
                rel="noreferrer"
                whileHover={shouldReduceMotion ? undefined : { scale: 1.04 }}
                whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
                className="group flex items-center relative transition-transform duration-300 will-change-transform"
              >
                <div className="z-20 w-20 h-20 lg:w-24 lg:h-24 bg-[#1e1e1e] rounded-full flex items-center justify-center shadow-xl border-4 border-slate-50 group-hover:border-white transition-colors">
                  <MessageCircle
                    size={34}
                    className="text-white fill-white lg:hidden"
                  />
                  <MessageCircle
                    size={42}
                    className="text-white fill-white hidden lg:block"
                  />
                </div>

                <div className="bg-[#dcdcdc] h-14 lg:h-16 -ml-7 lg:-ml-9 pl-12 lg:pl-14 pr-8 lg:pr-10 rounded-r-2xl flex items-center shadow-inner group-hover:bg-[#d1d1d1] transition-colors">
                  <span className="text-slate-700 font-medium underline decoration-slate-400 underline-offset-2 text-sm lg:text-base leading-tight">
                    Habla con un asesor ahora
                  </span>
                </div>
              </motion.a>
            </div>
          </motion.div>
        </section>

        {/* --- 4. TESTIMONIAL SPLIT --- */}
        <motion.section
          initial={shouldReduceMotion ? false : { opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: shouldReduceMotion ? 0 : 0.7,
            delay: shouldReduceMotion ? 0 : 0.28,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="mx-5 mb-5 rounded-3xl overflow-hidden bg-[#111] text-white shadow-2xl shadow-slate-900/20 will-change-transform"
        >
          <div className="flex flex-col md:flex-row min-h-[400px]">
            {/* Imagen Izquierda */}
            <div className="w-full md:w-1/2 relative min-h-[300px] lg:min-h-[400px] overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1578575437130-527eed3abbec?q=80&w=2070&auto=format&fit=crop"
                alt="Operaciones Logísticas PrimeTeam"
                className="absolute inset-0 w-full h-full object-cover"
                loading="lazy"
                decoding="async"
                draggable={false}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#111] via-transparent to-transparent md:hidden" />
            </div>

            {/* Contenido Derecha */}
            <div className="w-full md:w-1/2 p-6 lg:p-16 flex flex-col justify-center relative bg-[#0a0a0a]">
              <div className="mb-6">
                <Quote className="text-orange-600 w-6 h-6 lg:w-8 lg:h-8 fill-orange-600" />
              </div>

              <div className="relative min-h-[250px] lg:min-h-[180px] flex flex-col">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={TESTIMONIALS[currentTestimonial].id}
                    initial={
                      shouldReduceMotion
                        ? false
                        : { opacity: 0, x: 20 }
                    }
                    animate={{ opacity: 1, x: 0 }}
                    exit={
                      shouldReduceMotion
                        ? { opacity: 1, x: 0 }
                        : { opacity: 0, x: -20 }
                    }
                    transition={{
                      duration: shouldReduceMotion ? 0 : 0.38,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="flex flex-col h-full will-change-transform"
                  >
                    <p className="text-lg lg:text-3xl font-medium leading-[1.4] text-white mb-8 lg:mb-12 tracking-tight">
                      {TESTIMONIALS[currentTestimonial].text}
                    </p>

                    <div className="mt-auto">
                      <h4 className="text-slate-500 text-[9px] lg:text-[10px] font-bold uppercase tracking-[0.15em] mb-6 lg:mb-8">
                        {TESTIMONIALS[currentTestimonial].author}
                      </h4>

                      <div className="flex gap-2">
                        {TESTIMONIALS.map((item, idx) => (
                          <button
                            key={item.id}
                            type="button"
                            aria-label={`Ver testimonio ${idx + 1}`}
                            onClick={() => setCurrentTestimonial(idx)}
                            className={`h-1 lg:h-1.5 rounded-full transition-all duration-500 ${
                              currentTestimonial === idx
                                ? "w-4 lg:w-6 bg-orange-600"
                                : "w-1 lg:w-1.5 bg-white/10 hover:bg-white/20"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </motion.section>
      </main>

      <Footer />
    </div>
  );
}