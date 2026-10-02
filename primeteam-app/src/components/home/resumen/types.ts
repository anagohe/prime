import type { Dispatch, SetStateAction } from "react";
import type { DateRange } from "react-day-picker";

export type Port = { _id: string; name: string };
export type CargoType = "FCL" | "LCL";
export type Step = "results" | "summary" | "form";
export type Itinerary = Record<string, any>;
export type DateFilterMode = "ETD" | "ETA";

export type FormDataState = {
  nombre: string;
  correo: string;
  telefono: string;
  empresa: string;
  mensaje: string;
};

export type SelectedItinerary = {
  it: Itinerary;
  idx: number;
  id: string;
};

export type NormalizedItinerary = {
  etd: Date | null;
  eta: Date | null;
  closureDocs: Date | null;
  closureCargo: Date | null;
  vessel: string;
  transitDays: string | number | undefined;
  imoClosing: string;
  shippingLine: string;
  terminal: string;
  service: string;
};

export interface ResumenProps {
  filteredItineraries: Itinerary[];
  isLoading: boolean;
  error: string | null;
  selectedPol: Port | null;
  selectedPod: Port | null;
  cargoType: CargoType;
  selectedRange: DateRange | undefined;
  setSelectedRange: Dispatch<SetStateAction<DateRange | undefined>>;
  fetchItineraries: (range?: DateRange) => void;
  expandedId: string | null;
  setExpandedId: Dispatch<SetStateAction<string | null>>;
  selectedIds: Set<string>;
  setSelectedIds: Dispatch<SetStateAction<Set<string>>>;
  step: Step;
  setStep: Dispatch<SetStateAction<Step>>;
  formData: FormDataState;
  setFormData: Dispatch<SetStateAction<FormDataState>>;
}

export type ActionFeedback = {
  type: "success" | "error";
  message: string;
} | null;