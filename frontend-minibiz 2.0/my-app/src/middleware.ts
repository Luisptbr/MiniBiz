import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

/**
 * Middleware para proteção de rotas
 */
export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const isAuthenticated = !!token;
  
  // Rotas públicas (não requerem autenticação)
  const publicRoutes = ['/login', '/signup', '/forgot-password', '/reset-password'];
  
  // Verifica se a rota atual está na lista de rotas públicas
  const isPublicRoute = publicRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  );

  // Se estiver acessando a rota raiz, redireciona para o dashboard ou login
  if (request.nextUrl.pathname === '/') {
    return isAuthenticated
      ? NextResponse.redirect(new URL('/dashboard', request.url))
      : NextResponse.redirect(new URL('/login', request.url));
  }
  
  // Se não estiver autenticado e tentar acessar uma rota protegida
  if (!isAuthenticated && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // Se estiver autenticado e tentar acessar uma rota pública
  if (isAuthenticated && isPublicRoute) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  // Permite o acesso à rota
  return NextResponse.next();
}

// Configuração para aplicar o middleware apenas às rotas especificadas
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

