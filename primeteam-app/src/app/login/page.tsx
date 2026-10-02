"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  LockClosedIcon,
  EnvelopeIcon,
  ArrowLeftIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingDevice, setIsCheckingDevice] = useState(true);
  const [isBlockedDevice, setIsBlockedDevice] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const router = useRouter();

  useEffect(() => {
    // Check for registration success
    const params = new URLSearchParams(window.location.search);
    if (params.get("registered") === "true") {
      setSuccessMessage("¡Cuenta creada con éxito! Ahora puedes iniciar sesión.");
    }

    const checkDevice = () => {
      const ua = navigator.userAgent || "";
      const platform = navigator.platform || "";
      const maxTouchPoints = navigator.maxTouchPoints || 0;
      const width = window.innerWidth;

      const isIPhone = /iPhone|iPod/i.test(ua);
      const isIPad =
        /iPad/i.test(ua) || (platform === "MacIntel" && maxTouchPoints > 1);
      const isAndroidMobile = /Android/i.test(ua) && /Mobile/i.test(ua);
      const isAndroidTablet = /Android/i.test(ua) && !/Mobile/i.test(ua);
      const isOtherMobile = /webOS|BlackBerry|IEMobile|Opera Mini/i.test(ua);
      const isOtherTablet = /Tablet|PlayBook|Silk/i.test(ua);

      const isMobile = isIPhone || isAndroidMobile || isOtherMobile;
      const isTablet =
        isIPad ||
        isAndroidTablet ||
        isOtherTablet ||
        (width <= 1024 &&
          maxTouchPoints > 0 &&
          !isMobile &&
          !/Windows NT|Macintosh/i.test(ua));

      setIsBlockedDevice(isMobile || isTablet);
      setIsCheckingDevice(false);
    };

    checkDevice();
    window.addEventListener("resize", checkDevice);

    return () => window.removeEventListener("resize", checkDevice);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isBlockedDevice) {
      setError("Este acceso solo está disponible desde laptop o computadora.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        router.push("/dashboard/lists");
      } else {
        const data = await response.json();
        setError(data.message || "Credenciales inválidas");
      }
    } catch (err) {
      setError("Ocurrió un error al iniciar sesión");
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

        {/* Login Card */}
        <div className="bg-white rounded-[32px] shadow-2xl overflow-hidden border border-slate-100 p-8 md:p-10 animate-in fade-in zoom-in duration-500">
          <div className="mb-8">
            <h2 className="text-2xl font-black text-slate-800">Iniciar Sesión</h2>
            <p className="text-slate-500 text-sm mt-1 font-medium">
              Accede a tu panel administrativo
            </p>
          </div>

          {isCheckingDevice ? (
            <div className="bg-slate-50 border border-slate-100 text-slate-500 text-sm font-semibold px-4 py-4 rounded-2xl">
              Verificando dispositivo...
            </div>
          ) : isBlockedDevice ? (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
              <div className="flex items-start gap-3">
                <ExclamationTriangleIcon className="h-6 w-6 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wide text-amber-700">
                    Acceso restringido
                  </h3>
                  <p className="text-sm text-amber-700 mt-1 font-medium leading-relaxed">
                    Este panel administrativo solo se puede abrir desde laptop o
                    computadora. El acceso desde móvil o tablet no está permitido.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleLogin} className="space-y-5">
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

              {error && (
                <div className="bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold px-4 py-3 rounded-xl animate-shake">
                  {error}
                </div>
              )}

              {successMessage && (
                <div className="bg-emerald-50 border border-emerald-100 text-emerald-600 text-xs font-bold px-4 py-3 rounded-xl">
                  {successMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#1e4079] hover:bg-[#16305a] text-white font-black text-sm uppercase tracking-widest py-4 rounded-full shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
              >
                {isLoading ? "Validando..." : "Ingresar al Sistema"}
              </button>
            </form>
          )}
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