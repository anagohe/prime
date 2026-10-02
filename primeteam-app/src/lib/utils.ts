import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Calcula el cierre documental basado en el ETD FINAL.
 * Resta 8 días, y si cae en Sábado o Domingo, lo mueve al Viernes anterior.
 * Equivalente a la fórmula Excel: 
 * =IF(WEEKDAY(ETD-8)=7, ETD-9, IF(WEEKDAY(ETD-8)=1, ETD-10, ETD-8))
 */
export function calculateClosingDocs(etdDate: Date): Date {
  const date = new Date(etdDate.getTime());
  date.setDate(date.getDate() - 8);
  
  const dayOfWeek = date.getDay(); // 0 = Domingo, 6 = Sábado
  
  if (dayOfWeek === 0) { // Domingo -> Mover a Viernes (-2 días desde el Domingo, que es -10 desde el ETD original)
    date.setDate(date.getDate() - 2);
  } else if (dayOfWeek === 6) { // Sábado -> Mover a Viernes (-1 día desde el Sábado, que es -9 desde el ETD original)
    date.setDate(date.getDate() - 1);
  }
  
  return date;
}

/**
 * Calcula el cierre de aduana basado en el ETD FINAL.
 * Resta 4 días, y si cae en Sábado o Domingo, lo mueve al Viernes anterior.
 * Equivalente a la fórmula Excel: 
 * =IF(WEEKDAY(ETD-4,2)=6, ETD-5, IF(WEEKDAY(ETD-4,2)=7, ETD-6, ETD-4))
 */
export function calculateCustomsClosing(etdDate: Date): Date {
  const date = new Date(etdDate.getTime());
  date.setDate(date.getDate() - 4);
  
  const dayOfWeek = date.getDay(); // 0 = Domingo, 6 = Sábado
  
  if (dayOfWeek === 0) { // Domingo -> Mover a Viernes (-2 días)
    date.setDate(date.getDate() - 2);
  } else if (dayOfWeek === 6) { // Sábado -> Mover a Viernes (-1 día)
    date.setDate(date.getDate() - 1);
  }
  
  return date;
}

/**
 * Calcula el número de la semana actual en formato W[número].
 */
export function getWeekNumber(date: Date = new Date()): string {
  const target = new Date(date.valueOf());
  const dayNr = (date.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay() + 7) % 7));
  }
  const weekNumber = 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
  return `W${weekNumber}`;
  }

  /**
  * Formatea una fecha en formato: DIA MES AÑO (Mes en letras y mayúsculas)
  * Ej: 25 MARZO 2026
  */
  export function formatDate(dateString?: string): string {
    if (!dateString) return 'TBA';

    // Si es un formato YYYY-MM-DD
    let date: Date;
    if (dateString.length === 10 && dateString.includes('-')) {
        const [year, month, day] = dateString.split('-').map(Number);
        date = new Date(year, month - 1, day);
    } else {
        date = new Date(dateString);
    }

    if (isNaN(date.getTime())) return 'N/A';

    const day = date.getDate();
    const month = date.toLocaleDateString('es-MX', { month: 'long' }).toUpperCase();
    const year = date.getFullYear();

    return `${day} ${month} ${year}`;
  }