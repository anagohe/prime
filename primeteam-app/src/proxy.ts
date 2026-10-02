import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Si el usuario intenta entrar al dashboard
  if (pathname.startsWith('/dashboard')) {
    const token = request.cookies.get('auth_token');
    
    // Si no hay token, redirigir al login
    if (!token) {
      const url = new URL('/login', request.url);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};