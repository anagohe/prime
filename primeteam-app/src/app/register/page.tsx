"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  LockClosedIcon,
  EnvelopeIcon,
  UserIcon,
  ArrowLeftIcon,
  BriefcaseIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("viewer");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, password, role }),
      });

      if (response.ok) {
        router.push("/login?registered=true");
      } else {
        const data = await response.json();
        setError(data.message || "Error al registrar usuario");
      }
    } catch (err) {
      setError("Ocurrió un error al procesar el registro");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f1f3f5] flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        {/* Logo Section */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-5">
            <Image
              src="/logo-color.png"
              alt="PrimeTeam"
              width={280}
              height={90}
              className="h-auto w-auto max-w-[260px] md:max-w-[280px] object-contain drop-shadow-xl"
              priority
            />
          </div>
        </div>

        {/* Register Card */}
        <div className="bg-white rounded-[32px] shadow-2xl overflow-hidden border border-slate-100 p-8 md:p-10 animate-in fade-in zoom-in duration-500">
          <div className="mb-8">
            <h2 className="text-2xl font-black text-slate-800">Crear Cuenta</h2>
            <p className="text-slate-500 text-sm mt-1 font-medium">
              Regístrate para acceder al panel
            </p>
          </div>

          <form onSubmit={handleRegister} className="space-y-5">
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                Nombre Completo
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <UserIcon className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="block w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 pl-11 pr-4 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white transition-all placeholder:text-slate-400"
                  placeholder="Tu nombre completo"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <EnvelopeIcon className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 pl-11 pr-4 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white transition-all placeholder:text-slate-400"
                  placeholder="tu@correo.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <LockClosedIcon className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 pl-11 pr-4 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white transition-all placeholder:text-slate-400"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                Rol
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <BriefcaseIcon className="h-5 w-5 text-slate-400" />
                </div>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="block w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 pl-11 pr-4 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white transition-all appearance-none"
                >
                  <option value="viewer">Lector (Viewer)</option>
                  <option value="editor">Editor</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
            </div>

            {error && (
              <div className="bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold px-4 py-3 rounded-xl animate-shake">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#1e4079] hover:bg-[#16305a] text-white font-black text-sm uppercase tracking-widest py-4 rounded-full shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
            >
              {isLoading ? "Registrando..." : "Crear Cuenta"}
            </button>

            <div className="text-center pt-2">
              <p className="text-sm text-slate-500 font-medium">
                ¿Ya tienes una cuenta?{" "}
                <button
                  type="button"
                  onClick={() => router.push("/login")}
                  className="text-[#1e4079] font-black hover:underline cursor-pointer"
                >
                  Inicia sesión aquí
                </button>
              </p>
            </div>
          </form>
        </div>

        <div className="flex justify-center mt-6">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-[#1e4079] transition-colors cursor-pointer"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Regresar al inicio
          </button>
        </div>

        {/* Footer info */}
        <p className="text-center mt-10 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
          &copy; 2026 PrimeTeam International Logistics
        </p>
      </div>
    </div>
  );
}
