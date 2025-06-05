import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { TOKEN_KEY, AUTH_CONFIG } from '@/lib/constants';

// Caminhos que não requerem autenticação
const publicPaths = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/forgot-password',
  '/api/auth/reset-password',
  '/api/auth/refresh',
];

// Caminhos que requerem autenticação com roles específicos
const protectedRoutes: Record<string, string[]> = {
  '/admin': ['ADMIN'],
  '/admin/users': ['ADMIN'],
  '/admin/settings': ['ADMIN'],
  '/gerente': ['ADMIN', 'MANAGER'],
  '/relatorios': ['ADMIN', 'MANAGER'],
};

/**
 * Verifica se o caminho é público
 */
function isPublicPath(path: string): boolean {
  return publicPaths.some(publicPath => 
    path === publicPath || 
    path.startsWith(publicPath + '/') ||
    path.startsWith('/api/public') ||
    path.startsWith('/_next') ||
    path === '/favicon.ico' ||
    /\.(jpe?g|png|gif|ico|svg|webp|css|js)$/i.test(path)
  );
}

/**
 * Função para verificar se um token JWT está expirado
 */
function isTokenExpired(token: string): boolean {
  try {
    // Decodifica o payload (segunda parte do JWT)
    const payload = JSON.parse(
      Buffer.from(token.split('.')[1], 'base64').toString()
    );
    
    // Verifica se o token está expirado
    return payload.exp * 1000 <= Date.now();
  } catch {
    // Se houver erro na decodificação, considera expirado
    return true;
  }
}

/**
 * Função para extrair a role do token JWT
 */
function extractRoleFromToken(token: string): string | null {
  try {
    // Decodifica o payload (segunda parte do JWT)
    const payload = JSON.parse(
      Buffer.from(token.split('.')[1], 'base64').toString()
    );
    
    // Retorna a role do usuário
    return payload.role || null;
  } catch {
    return null;
  }
}

/**
 * Verifica se o usuário tem permissão para acessar uma rota
 */
function hasPermission(path: string, role: string | null): boolean {
  // Se a rota não tem restrição de roles, permite acesso
  const matchedRoute = Object.keys(protectedRoutes).find(route => 
    path === route || path.startsWith(route + '/')
  );
  
  if (!matchedRoute) return true;
  
  // Se a rota tem restrição de roles, verifica se o usuário tem a role necessária
  const allowedRoles = protectedRoutes[matchedRoute];
  return role !== null && allowedRoles.includes(role);
}

/**
 * Middleware do Next.js para autenticação e segurança
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Adiciona headers de segurança
  const response = NextResponse.next();
  
  // Security headers
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-Frame-Options', 'DENY');
  
  // Se o caminho é público, permite acesso
  if (isPublicPath(pathname)) {
    return response;
  }
  
  // Verifica se há token
  const token = request.cookies.get(TOKEN_KEY)?.value;
  
  // Se não há token, redireciona para login
  if (!token) {
    // Cria URL de redirecionamento para o login, com callback para retornar à página atual
    const url = new URL('/login', request.url);
    url.searchParams.set('callbackUrl', encodeURI(request.url));
    return NextResponse.redirect(url);
  }
  
  // Verifica se o token está expirado
  if (isTokenExpired(token)) {
    // Token expirado, redireciona para login
    const url = new URL('/login', request.url);
    url.searchParams.set('expired', 'true');
    url.searchParams.set('callbackUrl', encodeURI(request.url));
    return NextResponse.redirect(url);
  }
  
  // Extrai a role do token para verificar permissões
  const role = extractRoleFromToken(token);
  
  // Verifica se o usuário tem permissão para acessar a rota
  if (!hasPermission(pathname, role)) {
    // Sem permissão, redireciona para a página de acesso negado
    return NextResponse.redirect(new URL('/acesso-negado', request.url));
  }
  
  return response;
}

/**
 * Configuração do middleware - aplicado a todas as rotas exceto as estáticas
 */
export const config = {
  matcher: [
    /*
     * Corresponde a todas as rotas, exceto:
     * 1. Arquivos estáticos (arquivos com extensão em /public)
     * 2. Arquivos gerados pelo Next.js (_next/static, _next/image)
     * 3. Rotas da API que começam com /api/public (APIs públicas)
     */
    '/((?!api/public|_next/static|_next/image|favicon.ico).*)',
  ],
};

