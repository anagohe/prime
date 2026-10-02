"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  CheckCircle2,
  TrendingUp,
  ShieldCheck,
  Plus,
  Minus,
} from "lucide-react";

// Importa tus componentes existentes
import { Navbar } from "@/components/home/Navbar";
import { Footer } from "@/components/home/Footer";

// --- DATOS ---
const FEATURES = [
  {
    title: "Soluciones integrales y personalizadas",
    desc: "Ofrecemos soluciones completas, nos encargamos de todo el proceso liberándote de preocupaciones.",
    icon: TrendingUp,
  },
  {
    title: "Calidad en la atención",
    desc: "Cada cliente es único, y le proporcionamos un servicio excepcional, asegurando que tus envíos lleguen a tiempo.",
    icon: ShieldCheck,
  },
  {
    title: "Transparencia y comunicación",
    desc: "Te mantenemos informado en cada etapa del proceso, para que siempre sepas dónde está tu carga.",
    icon: CheckCircle2,
  },
];

const FAQ_CATEGORIES = [
  {
    title: "Servicios",
    faqs: [
      {
        question: "¿Qué servicios de logística ofrecen?",
        answer:
          "Ofrecemos transporte aéreo, marítimo y terrestre, así como servicios de despacho aduanal, almacenamiento y distribución.",
      },
      {
        question: "¿Qué tipo de carga pueden manejar?",
        answer:
          "Manejamos carga general, consolidada (LCL), contenedores completos (FCL) y mercancía especializada según tus necesidades.",
      },
      {
        question: "¿Ofrecen soluciones personalizadas?",
        answer:
          "Sí, diseñamos estrategias logísticas adaptadas a tu tipo de carga, volumen y destino.",
      },
    ],
  },
  {
    title: "Operación y seguimiento",
    faqs: [
      {
        question: "¿Cómo puedo rastrear mi carga?",
        answer:
          "Puedes dar seguimiento en tiempo real a través de nuestras herramientas de monitoreo o con apoyo de tu asesor asignado.",
      },
      {
        question: "¿Cuánto tardan los envíos?",
        answer:
          "Depende del tipo de transporte, origen y destino. Te proporcionamos tiempos estimados desde la cotización.",
      },
      {
        question: "¿Manejan envíos internacionales?",
        answer:
          "Sí, operamos envíos nacionales e internacionales con cobertura en múltiples países.",
      },
    ],
  },
  {
    title: "Procesos y requisitos",
    faqs: [
      {
        question: "¿Qué documentos necesito para exportar o importar?",
        answer:
          "Depende del tipo de mercancía, pero generalmente se requieren factura comercial, lista de empaque y documentos aduanales.",
      },
      {
        question: "¿Incluyen servicio aduanal?",
        answer:
          "Sí, gestionamos el despacho aduanal para asegurar cumplimiento con normativas locales e internacionales.",
      },
      {
        question: "¿Pueden ayudarme si no tengo experiencia en logística?",
        answer:
          "Claro, nuestro equipo te asesora en todo el proceso para que tu operación sea simple y segura.",
      },
    ],
  },
];

export default function AboutPage() {
  const [activeCategory, setActiveCategory] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const activeFaqs = FAQ_CATEGORIES[activeCategory].faqs;

  return (
    <div className="flex flex-col min-h-screen bg-white font-sans">
      {/* Navbar fija y transparente */}
      <Navbar />

      <main className="flex-grow">
        {/* --- 1. HERO SECTION (Full Viewport Height with Margins) --- */}
        <section className="relative h-[calc(100vh-2rem)] flex items-center justify-center overflow-hidden mx-5 mt-4 mb-4 rounded-3xl shadow-2xl shadow-slate-200">
          {/* Imagen de Fondo (Barco Contenedores - Top View) */}
          <div className="absolute inset-0 z-0">
            <Image
              src="https://images.unsplash.com/photo-1578575437130-527eed3abbec?q=80&w=2070&auto=format&fit=crop"
              alt="Puerto de contenedores"
              fill
              priority
              className="object-cover"
            />
            {/* Overlay Azulado/Oscuro como la referencia */}
            <div className="absolute inset-0 bg-slate-900/40 mix-blend-multiply" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
          </div>

          <div className="relative z-10 text-center px-6 max-w-4xl mt-20">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-5xl lg:text-7xl font-bold text-white tracking-tight leading-tight uppercase drop-shadow-2xl"
            >
              Tu Aliado en <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-white">
                Transporte y Logística
              </span>
            </motion.h1>
          </div>
        </section>

        {/* --- 2. SECCIÓN: CARACTERÍSTICAS (Split Layout) --- */}
        <section className="py-24 container mx-auto px-6 lg:px-12">
          <div className="w-full mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 leading-snug max-w-none">
              Descubre cómo nuestra experiencia y enfoque en la calidad pueden
              facilitar la movilización de su carga.
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Columna Izquierda: Lista de Features */}
            <div className="space-y-12">
              {FEATURES.map((feature, idx) => (
                <div key={idx} className="flex gap-5 group">
                  <div className="flex-shrink-0 w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-500 group-hover:bg-amber-500 group-hover:text-white transition-all duration-300">
                    <feature.icon size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-slate-500 leading-relaxed text-lg">
                      {feature.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Columna Derecha: Imagen Cuadrada + Badge */}
            <div className="relative h-[500px] w-full rounded-[2rem] overflow-hidden shadow-2xl">
              <Image
                src="https://images.unsplash.com/photo-1553413077-190dd305871c?q=80&w=2070&auto=format&fit=crop"
                alt="Almacén logístico moderno"
                fill
                className="object-cover hover:scale-105 transition-transform duration-700"
              />

              {/* Badge "10 Años" */}
              <div className="absolute top-8 right-8 bg-amber-500 text-white p-6 rounded-2xl shadow-lg flex flex-col items-center justify-center text-center w-32 h-32 backdrop-blur-sm bg-opacity-90">
                <span className="text-4xl font-bold block leading-none">
                  10
                </span>
                <span className="text-xs font-semibold uppercase tracking-wider leading-tight mt-1">
                  Años de
                  <br />
                  Experiencia
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* --- 3. SECCIÓN VISUAL PANORÁMICA (Transporte Multimodal) --- */}
        <section className="relative h-[500px] flex items-center justify-center overflow-hidden mx-5 mt-4 rounded-3xl shadow-2xl shadow-slate-200">
          <Image
            src="https://images.unsplash.com/photo-1565891741441-64926e441838?q=80&w=2070&auto=format&fit=crop"
            alt="Centro de distribución global"
            fill
            className="object-cover"
          />
          {/* Overlay suave */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/50 to-transparent" />
        </section>

        {/* --- 4. ÚLTIMA SECCIÓN (FAQ + Flotilla) --- */}
        <section className="mx-5 mb-5 rounded-3xl overflow-hidden bg-slate-50 border border-slate-100 relative min-h-[700px] flex flex-col shadow-2xl shadow-slate-200/50">
          <div className="container mx-auto px-6 lg:px-12 py-20 flex-grow z-10 relative">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              {/* Columna Izquierda: Título */}
              <div className="lg:col-span-5">
                <span className="text-amber-500 font-bold tracking-widest uppercase text-sm mb-4 block">
                  FAQS
                </span>
                <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-6 leading-tight">
                  Todo lo que debes saber sobre logística de carga
                </h2>
                <p className="text-slate-500 text-lg mb-8">
                  Resolvemos tus dudas principales para que tu operación sea
                  fluida y sin contratiempos.
                </p>
              </div>

              {/* Columna Derecha: Categorías + FAQ */}
              <div className="lg:col-span-7">
                <div className="flex flex-wrap gap-4 mb-8">
                  {FAQ_CATEGORIES.map((category, idx) => (
                    <button
                      key={category.title}
                      onClick={() => {
                        setActiveCategory(idx);
                        setOpenFaq(null);
                      }}
                      className={`px-6 py-3 text-base font-medium transition-all duration-300 cursor-pointer ${
                        activeCategory === idx
                          ? "bg-amber-500 text-white"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      {category.title}
                    </button>
                  ))}
                </div>

                <div className="space-y-0">
                  {activeFaqs.map((faq, idx) => (
                    <div
                      key={idx}
                      className="border-b border-slate-200 overflow-hidden"
                    >
                      <button
                        onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                        className="w-full flex items-center justify-between py-6 text-left cursor-pointer"
                      >
                        <span className="font-semibold text-slate-700 text-lg pr-6">
                          {faq.question}
                        </span>
                        <span className="flex-shrink-0 text-slate-700">
                          {openFaq === idx ? (
                            <Minus size={18} />
                          ) : (
                            <Plus size={18} />
                          )}
                        </span>
                      </button>

                      <motion.div
                        initial={false}
                        animate={{
                          height: openFaq === idx ? "auto" : 0,
                          opacity: openFaq === idx ? 1 : 0,
                        }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="pb-6 pr-10 text-slate-500 leading-relaxed">
                          {faq.answer}
                        </div>
                      </motion.div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Imagen de Camiones (Flotilla) al fondo de la sección */}
          <div className="relative w-full h-[300px] mt-auto">
            {/* Máscara de gradiente para que se fusione con el fondo blanco de arriba */}
            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-slate-50 to-transparent z-10" />

            <Image
              src="https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?q=80&w=2070&auto=format&fit=crop"
              alt="Flotilla de transporte pesado"
              fill
              className="object-cover object-bottom"
            />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}