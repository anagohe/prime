import {
  NextResponse
} from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Aquí iría la lógica para procesar la reserva:
    // 1. Validar el payload (body).
    // 2. Guardar los datos en Sanity o en otra base de datos.
    // 3. Enviar notificaciones por correo electrónico (ej. a un equipo interno y al cliente).

    console.log("--- Nueva Solicitud de Reserva Recibida ---");
    console.log("Información de Contacto:", body.contactInfo);
    console.log("Detalles de la Solicitud:", body.requestDetails);
    console.log(
      "Itinerarios Seleccionados:",
      JSON.stringify(body.selectedItineraries, null, 2)
    );

    // Simulación de éxito
    return NextResponse.json({
      message: "Reserva solicitada con éxito."
    }, {
      status: 200
    });
  } catch (error) {
    console.error("API Error - /api/reservations:", error);
    return NextResponse.json({
      message: "Error en el servidor al procesar la reserva."
    }, {
      status: 500
    });
  }
}