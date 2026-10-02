"use client";

import React from "react";
import type { ActionFeedback, FormDataState } from "./types";

type ReservationFormProps = {
  formData: FormDataState;
  updateFormField: (field: keyof FormDataState, value: string) => void;
  onBack: () => void;
  onSubmit: () => Promise<void> | void;
  isActionLoading: boolean;
  actionFeedback: ActionFeedback;
};

export function ReservationForm({
  formData,
  updateFormField,
  onBack,
  onSubmit,
  isActionLoading,
  actionFeedback,
}: ReservationFormProps) {
  const values = formData as unknown as Record<string, string | undefined>;

  const pickKey = (...keys: string[]) =>
    ((keys.find((key) => key in values) ?? keys[0]) as keyof FormDataState);

  const fullNameKey = pickKey("fullName", "name");
  const companyNameKey = pickKey(
    "companyName",
    "company",
    "businessName",
    "razonSocial"
  );
  const emailKey = pickKey("email");
  const phoneKey = pickKey("phone", "mobile", "telephone");
  const messageKey = pickKey(
    "message",
    "customerMessage",
    "comments",
    "observations"
  );

  const fullName = values[String(fullNameKey)] ?? "";
  const companyName = values[String(companyNameKey)] ?? "";
  const email = values[String(emailKey)] ?? "";
  const phone = values[String(phoneKey)] ?? "";
  const message = values[String(messageKey)] ?? "";

  const isDisabled =
    isActionLoading ||
    !fullName.trim() ||
    !companyName.trim() ||
    !email.trim();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSubmit();
  };

  return (
    <div className="bg-[#0c4a83] rounded-[22px] sm:rounded-[24px] overflow-hidden shadow-2xl max-w-4xl mx-auto w-full border border-white/5">
      <div className="px-4 sm:px-8 pt-5 sm:pt-6 pb-4 border-b border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-6">
          <div className="text-[#fdb913] font-black text-lg sm:text-2xl tracking-tight uppercase">
            COMPARTIR ITINERARIO
          </div>

          <button
            type="button"
            onClick={onBack}
            className="text-white/70 hover:text-white transition-colors font-black text-[10px] sm:text-[11px] uppercase tracking-widest cursor-pointer text-left sm:text-right"
          >
            Volver
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="px-4 sm:px-8 py-5 sm:py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          <div className="sm:col-span-2">
            <label className="block text-[11px] font-black uppercase tracking-widest text-white/70 mb-2">
              Nombre completo
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => updateFormField(fullNameKey, e.target.value)}
              className="w-full rounded-[12px] bg-white text-slate-900 px-4 py-3 outline-none border border-transparent focus:border-[#fdb913]"
              placeholder="Tu nombre completo"
              autoComplete="name"
              required
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-[11px] font-black uppercase tracking-widest text-white/70 mb-2">
              Razón social
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => updateFormField(companyNameKey, e.target.value)}
              className="w-full rounded-[12px] bg-white text-slate-900 px-4 py-3 outline-none border border-transparent focus:border-[#fdb913]"
              placeholder="Nombre de la empresa"
              autoComplete="organization"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-black uppercase tracking-widest text-white/70 mb-2">
              Correo electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => updateFormField(emailKey, e.target.value)}
              className="w-full rounded-[12px] bg-white text-slate-900 px-4 py-3 outline-none border border-transparent focus:border-[#fdb913]"
              placeholder="correo@empresa.com"
              autoComplete="email"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-black uppercase tracking-widest text-white/70 mb-2">
              Teléfono
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => updateFormField(phoneKey, e.target.value)}
              className="w-full rounded-[12px] bg-white text-slate-900 px-4 py-3 outline-none border border-transparent focus:border-[#fdb913]"
              placeholder="Tu teléfono"
              autoComplete="tel"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-[11px] font-black uppercase tracking-widest text-white/70 mb-2">
              Mensaje / observaciones
            </label>
            <textarea
              value={message}
              onChange={(e) => updateFormField(messageKey, e.target.value)}
              className="w-full min-h-[130px] rounded-[12px] bg-white text-slate-900 px-4 py-3 outline-none border border-transparent focus:border-[#fdb913] resize-none"
              placeholder="Escribe cualquier observación adicional"
            />
          </div>
        </div>

        {actionFeedback ? (
          <div
            className={`mt-5 rounded-[12px] px-4 py-3 text-sm font-semibold ${
              actionFeedback.type === "success"
                ? "bg-emerald-500/15 text-emerald-200 border border-emerald-400/30"
                : "bg-red-500/15 text-red-200 border border-red-400/30"
            }`}
          >
            {actionFeedback.message}
          </div>
        ) : null}

        <div className="mt-6">
          <button
            type="submit"
            disabled={isDisabled}
            className={`w-full py-3.5 rounded-[12px] font-black text-sm uppercase tracking-[0.2em] shadow-xl transition-all transform active:scale-[0.98] flex items-center justify-center ${
              isDisabled
                ? "bg-white/10 text-white/30 border border-white/5 cursor-not-allowed"
                : "bg-white text-[#0c4a83] cursor-pointer"
            }`}
          >
            {isActionLoading ? "Procesando..." : "Compartir Itinerario"}
          </button>
        </div>
      </form>
    </div>
  );
}