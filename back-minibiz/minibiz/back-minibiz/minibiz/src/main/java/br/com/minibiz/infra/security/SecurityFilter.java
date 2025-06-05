package br.com.minibiz.infra.security;

import br.com.minibiz.model.user.User;
import br.com.minibiz.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

@Component
public class SecurityFilter extends OncePerRequestFilter {

    @Autowired
    private TokenService tokenService;

    @Autowired
    private UserRepository userRepository;

    /**
     * O método doFilterInternal é chamado uma vez por solicitação e é responsável por
     * aplicar a lógica de segurança antes que a solicitação prossiga.
     */
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
       
        var token = this.recoverToken(request);  // Recupera o token da solicitação HTTP

        var login = tokenService.validateToken(token); // Valida o token e extrai o login (email) do usuário

        if (login != null) {           
        	User user = userRepository.findByEmail(login).orElseThrow(() -> new RuntimeException("User Not Found")); // Busca o usuário no banco de dados usando o email extraído do token

            var authorities = Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER")); // Cria uma lista de autoridades com a permissão "ROLE_USER"
 
            var authentication = new UsernamePasswordAuthenticationToken(user, null, authorities); // Cria um objeto de autenticação com o usuário e suas autoridades

            SecurityContextHolder.getContext().setAuthentication(authentication);// Define o contexto de segurança com o objeto de autenticação criado
        }
        
        filterChain.doFilter(request, response); // Continua o filtro da solicitação
    }

    /**
     * O método recoverToken extrai o token do cabeçalho "Authorization" da solicitação.
     * Se o cabeçalho não estiver presente, retorna null.
     */
    private String recoverToken(HttpServletRequest request) {
        var authHeader = request.getHeader("Authorization"); // Obtém o cabeçalho "Authorization" da solicitação
        
        if (authHeader == null) return null; // Verifica se o cabeçalho está presente e, caso contrário, retorna null
 
        return authHeader.replace("Bearer ", ""); // Remove o prefixo "Bearer " do token e retorna o valor limpo
    }
}