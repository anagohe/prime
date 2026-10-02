"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  ChevronDown,
  User,
  Mail,
  Phone,
  Facebook,
  Instagram,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function Navbar() {
  const pathname = usePathname();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Detecta scroll
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Cierra menú móvil al cambiar de ruta
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Links
  const navLinks = useMemo(
    () => [
      { name: "SERVICIOS", href: "/", hasDropdown: false },
      { name: "NOSOTROS", href: "/about", hasDropdown: false },
      { name: "CONTACTO", href: "/contact", hasDropdown: false },
    ],
    []
  );

  // Active state
  const isActive = (href: string) => {
    return pathname === href;
  };

  // Páginas con hero oscuro
  const isDarkHeroPage = pathname === "/about" || pathname === "/contact";

  // Colores dinámicos
  const navTextColor = isScrolled
    ? "text-[#1e4079]"
    : isDarkHeroPage
    ? "text-white"
    : "text-[#1e4079]";
  const navSecondaryTextColor = isScrolled
    ? "text-[#64748b]"
    : isDarkHeroPage
    ? "text-white/70"
    : "text-[#64748b]";
  const navIconColor = isScrolled
    ? "text-[#1e4079]"
    : isDarkHeroPage
    ? "text-white"
    : "text-[#1e4079]";
  const navUnderlineColor = isScrolled
    ? "bg-[#1e4079]"
    : isDarkHeroPage
    ? "bg-white"
    : "bg-[#1e4079]";

  const PHONE = "(55)-250 602 76";
  const PHONE_HREF = "tel:+525525060276";
  const EMAIL = "primeteam@primeteam.com.mx";
  const EMAIL_HREF = "mailto:primeteam@primeteam.com.mx";

  const desktopLogoSrc =
    !isScrolled && isDarkHeroPage ? "/logo-blanco.png" : "/logo-color.png";

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/90 backdrop-blur-md shadow-sm py-3"
          : "bg-transparent py-5 md:py-7"
      }`}
    >
      <div className="mx-auto w-full max-w-[1280px] px-6 lg:px-8 xl:px-10 flex items-center justify-between">
        {/* Logo Section */}
        <Link
          href="/"
          className="group cursor-pointer inline-flex items-center translate-y-[4px] md:translate-y-[5px]"
        >
          <img
            src={desktopLogoSrc}
            alt="PrimeTeam Logo"
            className="h-10 w-auto md:h-[52px] object-contain"
          />
        </Link>

        {/* Desktop Links - Centered */}
        <div className="hidden lg:flex items-center gap-10 absolute left-1/2 -translate-x-1/2">
          {navLinks.map((item) => {
            const active = isActive(item.href);

            return (
              <div key={item.name} className="relative group">
                <Link
                  href={item.href}
                  className={`flex items-center gap-1 text-[12px] md:text-[13px] tracking-widest transition-all duration-300 !font-sans ${
                    active
                      ? `font-bold ${navTextColor}`
                      : `font-normal ${navSecondaryTextColor} hover:${navTextColor}`
                  }`}
                >
                  {item.name}
                  {item.hasDropdown && (
                    <ChevronDown
                      size={14}
                      className="mt-0.5 opacity-60 group-hover:opacity-100"
                    />
                  )}
                </Link>

                <div
                  className={`absolute -bottom-1.5 left-0 right-0 h-[3px] ${navUnderlineColor} transform origin-left transition-transform duration-300 ${
                    active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                  }`}
                />
              </div>
            );
          })}
        </div>

        {/* Profile Icon + Mobile toggle */}
        <div className="flex items-center">
          <Link
            href="/dashboard"
            className={`${navIconColor} p-2 hover:bg-slate-100 rounded-full transition-all transform active:scale-90 cursor-pointer inline-flex items-center justify-center`}
            aria-label="Profile"
          >
            <User
              className="w-[24px] h-[24px] md:w-[28px] md:h-[28px]"
              strokeWidth={1.2}
            />
          </Link>

          <button
            className={`lg:hidden ml-2 p-2 rounded-xl transition-colors cursor-pointer ${
              isMobileMenuOpen ? "bg-slate-100 text-[#1e4079]" : navIconColor
            }`}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={isMobileMenuOpen ? "close" : "menu"}
                initial={{ opacity: 0, rotate: -90 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: 90 }}
                transition={{ duration: 0.2 }}
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </motion.div>
            </AnimatePresence>
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="lg:hidden fixed inset-0 h-screen bg-white z-[60] flex flex-col"
          >
            {/* Mobile Menu Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-50">
              <Link
                href="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="inline-flex items-center cursor-pointer translate-y-[3px]"
              >
                <img
                  src="/logo-color.png"
                  alt="PrimeTeam Logo"
                  className="h-10 w-auto object-contain"
                />
              </Link>

              <button
                className="p-2 rounded-xl bg-slate-100 text-[#1e4079] cursor-pointer hover:scale-[1.03] active:scale-95 transition-transform"
                onClick={() => setIsMobileMenuOpen(false)}
                aria-label="Close menu"
              >
                <X size={24} />
              </button>
            </div>

            <div className="px-8 py-12 flex flex-col gap-2 overflow-y-auto">
              {navLinks.map((item, idx) => {
                const active = isActive(item.href);

                return (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + idx * 0.1 }}
                  >
                    <Link
                      href={item.href}
                      className={`text-4xl tracking-tight py-5 flex justify-between items-center transition-all !font-sans cursor-pointer
                        ${
                          active
                            ? "font-black text-[#1e4079]"
                            : "font-medium text-slate-400"
                        }
                        hover:text-[#1e4079]
                      `}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <span>{item.name}</span>
                      <div
                        className={`w-3 h-3 rounded-full bg-amber-400 transition-transform duration-300 ${
                          active ? "scale-100" : "scale-0"
                        }`}
                      />
                    </Link>
                  </motion.div>
                );
              })}

              <Link
                href="/dashboard"
                className="mt-6 inline-flex items-center gap-3 text-[#1e4079] cursor-pointer group"
                onClick={() => setIsMobileMenuOpen(false)}
                aria-label="Perfil"
              >
                <span className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-amber-500 transition-transform duration-200 group-hover:scale-[1.06] group-active:scale-95">
                  <User size={20} />
                </span>
                <span className="text-lg font-black tracking-tight">Perfil</span>
              </Link>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="bg-slate-50 p-8 mt-auto border-t border-slate-100"
            >
              <div className="grid grid-cols-1 gap-6 mb-10">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Llámanos
                  </span>
                  <a
                    href={PHONE_HREF}
                    className="flex items-center gap-3 text-[#1e4079] cursor-pointer group"
                  >
                    <span className="w-10 h-10 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-amber-500 transition-transform duration-200 group-hover:scale-[1.06] group-active:scale-95">
                      <Phone size={18} />
                    </span>
                    <span className="text-lg font-bold transition-colors duration-200 group-hover:text-[#163463]">
                      {PHONE}
                    </span>
                  </a>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Escríbenos
                  </span>
                  <a
                    href={EMAIL_HREF}
                    className="flex items-center gap-3 text-[#1e4079] cursor-pointer group"
                  >
                    <span className="w-10 h-10 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-amber-500 transition-transform duration-200 group-hover:scale-[1.06] group-active:scale-95">
                      <Mail size={18} />
                    </span>
                    <span className="text-lg font-bold transition-colors duration-200 group-hover:text-[#163463]">
                      {EMAIL}
                    </span>
                  </a>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex gap-4">
                  <a
                    href="#"
                    className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-[#1e4079] cursor-pointer transition-all duration-200 hover:scale-[1.06] active:scale-95"
                    aria-label="Facebook"
                  >
                    <Facebook size={20} />
                  </a>
                  <a
                    href="#"
                    className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-[#1e4079] cursor-pointer transition-all duration-200 hover:scale-[1.06] active:scale-95"
                    aria-label="Instagram"
                  >
                    <Instagram size={20} />
                  </a>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}