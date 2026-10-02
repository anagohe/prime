import { client } from '@/lib/sanity.client';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // 1. Buscar el usuario en Sanity
    const user = await client.fetch(
      `*[_type == "person" && email == $email][0]`,
      { email }
    );

    if (!user) {
      return NextResponse.json({ message: 'Usuario no encontrado' }, { status: 401 });
    }

    // 2. Verificar contraseña
    // En producción: bcrypt.compare(password, user.password)
    if (user.password !== password) {
      return NextResponse.json({ message: 'Contraseña incorrecta' }, { status: 401 });
    }

    // 3. Crear Sesión (Auth Token en Cookie)
    // En producción usa JWT o un token real
    const token = `session_${user._id}_${Date.now()}`;
    
    (await cookies()).set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 semana
      path: '/',
    });

    return NextResponse.json({ 
      success: true, 
      user: { id: user._id, name: user.fullName, role: user.role } 
    });

  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
