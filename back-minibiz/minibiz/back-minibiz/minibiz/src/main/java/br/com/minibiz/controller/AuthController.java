package br.com.minibiz.controller;

import br.com.minibiz.model.user.User;
import br.com.minibiz.dto.ForgotPasswordRequestDTO;
import br.com.minibiz.dto.LoginRequestDTO;
import br.com.minibiz.dto.RegisterRequestDTO;
import br.com.minibiz.dto.ResponseDTO;
import br.com.minibiz.infra.security.TokenService;
import br.com.minibiz.repository.UserRepository;
import br.com.minibiz.service.EmailService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/auth")
public class AuthController {

	private final UserRepository repository;
	private final PasswordEncoder passwordEncoder;
	private final TokenService tokenService;
	private final EmailService emailService;

	
	public AuthController(UserRepository repository, PasswordEncoder passwordEncoder, TokenService tokenService,
			EmailService emailService) {
		this.repository = repository;
		this.passwordEncoder = passwordEncoder;
		this.tokenService = tokenService;
		this.emailService = emailService;
	}

	@PostMapping("/login")
	public ResponseEntity<ResponseDTO> login(@RequestBody LoginRequestDTO body) {
		User user = repository.findByEmail(body.email()).orElseThrow(() -> new RuntimeException("User not found"));
		if (passwordEncoder.matches(body.password(), user.getPassword())) {
			String token = tokenService.generateToken(user);
			return ResponseEntity.ok(new ResponseDTO(user.getName(), token));
		}
		return ResponseEntity.badRequest().build();
	}

	@PostMapping("/register")
	public ResponseEntity<ResponseDTO> register(@RequestBody RegisterRequestDTO body) {
		Optional<User> user = repository.findByEmail(body.email());
		if (user.isEmpty()) {
			User newUser = new User();
			newUser.setPassword(passwordEncoder.encode(body.password()));
			newUser.setEmail(body.email());
			newUser.setName(body.name());
			repository.save(newUser);
			String token = tokenService.generateToken(newUser);
			return ResponseEntity.ok(new ResponseDTO(newUser.getName(), token));
		}
		return ResponseEntity.badRequest().build();
	}

	@PostMapping("/forgot-password")
	public ResponseEntity<String> forgotPassword(@RequestBody ForgotPasswordRequestDTO request) {
	    System.out.println("Email recebido: " + request.getEmail());
	    User user = repository.findByEmail(request.getEmail())
	            .orElseThrow(() -> new RuntimeException("User not found"));
	    // Lógica para gerar o token e enviar o email
	    String token = tokenService.generateToken(user);
	    emailService.sendPasswordResetEmail(user, token);
	    return ResponseEntity.ok("Password reset email sent");
	}


	@PostMapping("/reset-password")
	public ResponseEntity<String> resetPassword(@RequestParam String token, @RequestBody String newPassword) {
		String email = tokenService.validateToken(token);
		if (email == null) {
			return ResponseEntity.badRequest().body("Invalid token");
		}
		User user = repository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
		user.setPassword(passwordEncoder.encode(newPassword));
		repository.save(user);
		return ResponseEntity.ok("Password updated successfully");
	}

	@GetMapping("/test-cors")
	public String testCors() {
		return "CORS is working in Auth Controller!";
	}
}
