import {
  ReservationPayload
} from "../transformers/itineraryTransformer";

/**
 * Envía la solicitud de reserva al endpoint de la API.
 */
export const submitReservation = async (
  payload: ReservationPayload
): Promise < {
  success: boolean;
  message: string
} > => {
  try {
    const response = await fetch("/api/reservations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Error al crear la reserva.");
    }

    const result = await response.json();
    return {
      success: true,
      message: result.message
    };
  } catch (error) {
    console.error("Error submitting reservation:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Un error desconocido ocurrió.";
    return {
      success: false,
      message: errorMessage
    };
  }
};