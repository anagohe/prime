"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Instagram, Linkedin, MessageCircle, ArrowUpRight } from "lucide-react";

export function Footer() {
  const goToService = (slug: string) => {
    if (typeof window === "undefined") return;

    window.sessionStorage.setItem("primeTeamSelectedService", slug);

    if (window.location.pathname === "/") {
      window.dispatchEvent(
        new CustomEvent("primeTeam:focus-service", {
          detail: { slug },
        })
      );
      return;
    }

    window.location.assign("/");
  };

  return (
    <footer className="w-full font-sans">
      {/* Top CTA Bar */}
      <div className="bg-[#fdb913] py-6 md:py-8">
        <div className="mx-auto max-w-screen-2xl px-6 lg:px-16 flex flex-col md:flex-row items-center justify-between gap-6">
          <h2 className="text-white text-3xl md:text-4xl font-bold tracking-tight">
            ¿Listo para empezar?
          </h2>
          <Link
            href="/contact"
            className="bg-transparent border-2 border-white text-white px-10 py-3 rounded-2xl font-bold text-lg hover:bg-white/10 transition-all"
          >
            Cotiza ahora
          </Link>
        </div>
      </div>

      {/* Main Footer Area */}
      <div className="bg-[#0c4a83] text-white pt-16 pb-8">
        <div className="mx-auto max-w-screen-2xl px-6 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8">
            {/* Logo and Links Section */}
            <div className="lg:col-span-5 flex flex-col gap-10">
              {/* Logo */}
              <Link href="/" className="flex items-center gap-2">
                <Image
                  src="/logo-blanco.png"
                  alt="PrimeTeam"
                  width={220}
                  height={70}
                  className="h-auto w-[180px] md:w-[220px]"
                  priority
                />
              </Link>

              {/* Links Grid */}
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <h4 className="font-bold text-sm mb-6">Servicios</h4>
                  <ul className="space-y-3 text-[12px] text-white/80">
                    <li>
                      <button
                        type="button"
                        onClick={() => goToService("transporte-maritimo")}
                        className="bg-transparent border-0 p-0 text-left text-white/80 hover:text-white transition-colors underline decoration-white/20 underline-offset-4 cursor-pointer"
                      >
                        Transporte Marítimo
                      </button>
                    </li>
                    <li>
                      <button
                        type="button"
                        onClick={() => goToService("transporte-consolidado")}
                        className="bg-transparent border-0 p-0 text-left text-white/80 hover:text-white transition-colors underline decoration-white/20 underline-offset-4 cursor-pointer"
                      >
                        Transporte Consolidado
                      </button>
                    </li>
                    <li>
                      <button
                        type="button"
                        onClick={() => goToService("transporte-terrestre-nacional-e-internacional")}
                        className="bg-transparent border-0 p-0 text-left text-white/80 hover:text-white transition-colors underline decoration-white/20 underline-offset-4 cursor-pointer"
                      >
                        Transporte Terrestre Nacional e Internacional
                      </button>
                    </li>
                    <li>
                      <button
                        type="button"
                        onClick={() => goToService("transporte-aereo")}
                        className="bg-transparent border-0 p-0 text-left text-white/80 hover:text-white transition-colors underline decoration-white/20 underline-offset-4 cursor-pointer"
                      >
                        Transporte Aéreo
                      </button>
                    </li>
                    <li>
                      <button
                        type="button"
                        onClick={() => goToService("revalidaciones-y-entregas")}
                        className="bg-transparent border-0 p-0 text-left text-white/80 hover:text-white transition-colors underline decoration-white/20 underline-offset-4 cursor-pointer"
                      >
                        Revalidaciones y Entregas
                      </button>
                    </li>
                    <li>
                      <button
                        type="button"
                        onClick={() => goToService("servicio-aduanal-y-almacenajes")}
                        className="bg-transparent border-0 p-0 text-left text-white/80 hover:text-white transition-colors underline decoration-white/20 underline-offset-4 cursor-pointer"
                      >
                        Servicio Aduanal y Almacenajes
                      </button>
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold text-sm mb-6">Empresa</h4>
                  <ul className="space-y-3 text-[12px] text-white/80">
                    <li>
                      <Link href="/" className="hover:text-white transition-colors">
                        Home
                      </Link>
                    </li>
                    <li>
                      <Link href="/about" className="hover:text-white transition-colors">
                        Nosotros
                      </Link>
                    </li>
                    <li>
                      <Link href="/contact" className="hover:text-white transition-colors">
                        Contacto
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Socials */}
              <div className="flex gap-6 items-center">
                <a
                  href="https://www.instagram.com/primeteam_forwarder?igsh=MXNrdmRucjVjcDVqeg=="
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/60 hover:text-white transition-colors"
                >
                  <Instagram size={18} />
                </a>
                <a
                  href="https://www.linkedin.com/company/primeteam-sa-de-cv/?originalSubdomain=mx"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/60 hover:text-white transition-colors"
                >
                  <Linkedin size={18} />
                </a>
                <a
                  href="https://wa.me/message/BYLAZDNHPT3VF1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/60 hover:text-white transition-colors"
                >
                  <MessageCircle size={18} />
                </a>
              </div>
            </div>

            {/* Contact Information Section */}
            <div className="lg:col-span-7 flex flex-col gap-8">
              <div className="flex justify-between items-center">
                <h3 className="text-3xl md:text-6xl font-medium tracking-tight">
                  Contáctanos
                </h3>
                <ArrowUpRight
                  size={48}
                  className="text-white/40 md:w-16 md:h-16"
                  strokeWidth={1}
                />
              </div>

              <div className="flex flex-col gap-8 md:gap-10">
                <div className="space-y-1">
                  <span className="block text-white/40 text-[10px] font-bold uppercase tracking-widest">
                    Email
                  </span>
                  <a
                    href="mailto:booking@primeteam.com.mx"
                    className="text-sm md:text-2xl font-medium hover:text-[#fdb913] transition-colors underline underline-offset-8 decoration-white/40 break-words"
                  >
                    primeteam@primeteam.com.mx
                  </a>
                </div>

                <div className="space-y-1">
                  <span className="block text-white/40 text-[10px] font-bold uppercase tracking-widest">
                    Phone
                  </span>
                  <a
                    href="tel:+525548557965"
                    className="text-sm md:text-2xl font-medium tracking-tight underline underline-offset-8 decoration-white/40 hover:text-[#fdb913] transition-colors"
                  >
                    (55)-485 579 65
                  </a>
                </div>

                <div className="space-y-1">
                  <span className="block text-white/40 text-[10px] font-bold uppercase tracking-widest">
                    Office Location
                  </span>
                  <p className="text-sm md:text-2xl font-medium leading-snug">
                    Primeteam Business Calle Orizaba #154 Oficina{" "}
                    <br className="hidden md:block" />
                    #307 06700 Col. Roma Ciudad de México, México
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Copyright Bar */}
          <div className="mt-20 pt-8 border-t border-white/10 text-center">
            <p className="text-[11px] text-white/50 font-medium tracking-wider">
              Copyright 2025 PrimeTeam México
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}