import { client } from '@/lib/sanity.client';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { fullName, email, password, role } = await responseToJSON(request);

    // 1. Verificar si ya existe el usuario
    const existingUser = await client.fetch(
      `*[_type == "person" && email == $email][0]`,
      { email }
    );

    if (existingUser) {
      return NextResponse.json(
        { message: 'El usuario ya existe con ese email' },
        { status: 400 }
      );
    }

    // 2. Crear el usuario en Sanity
    // Nota: En un entorno real, deberías hashear la contraseña (ej. con bcrypt)
    const newUser = await client.create({
      _type: 'person',
      fullName,
      email,
      password, // Debería estar hasheada
      role,
      slug: {
        _type: 'slug',
        current: fullName.toLowerCase().replace(/\s+/g, '-'),
      },
    });

    return NextResponse.json({ message: 'Usuario creado con éxito', userId: newUser._id });
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

async function responseToJSON(request: Request) {
  return await request.json();
}
