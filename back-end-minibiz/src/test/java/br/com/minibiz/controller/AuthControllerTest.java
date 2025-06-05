package br.com.minibiz.controller;

import br.com.minibiz.dto.ForgotPasswordRequestDTO;
import br.com.minibiz.dto.LoginRequestDTO;
import br.com.minibiz.dto.RegisterRequestDTO;
import br.com.minibiz.dto.ResponseDTO;
import br.com.minibiz.infra.security.TokenService;
import br.com.minibiz.model.user.User;
import br.com.minibiz.repository.UserRepository;
import br.com.minibiz.service.EmailService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AuthController.class)
public class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private UserRepository userRepository;

    @MockBean
    private PasswordEncoder passwordEncoder;

    @MockBean
    private TokenService tokenService;

    @MockBean
    private EmailService emailService;

    private User testUser;
    private final String TEST_TOKEN = "test-jwt-token";

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setEmail("test@example.com");
        testUser.setName("Test User");
        testUser.setPassword("encodedPassword");
    }

    @Test
    void loginSuccess() throws Exception {
        // Arrange
        LoginRequestDTO loginRequest = new LoginRequestDTO("test@example.com", "password123");
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("password123", "encodedPassword")).thenReturn(true);
        when(tokenService.generateToken(testUser)).thenReturn(TEST_TOKEN);

        // Act & Assert
        mockMvc.perform(post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Test User"))
                .andExpect(jsonPath("$.token").value(TEST_TOKEN));

        verify(userRepository).findByEmail("test@example.com");
        verify(passwordEncoder).matches("password123", "encodedPassword");
        verify(tokenService).generateToken(testUser);
    }

    @Test
    void loginFailWhenUserNotFound() throws Exception {
        // Arrange
        LoginRequestDTO loginRequest = new LoginRequestDTO("nonexistent@example.com", "password123");
        when(userRepository.findByEmail("nonexistent@example.com")).thenReturn(Optional.empty());

        // Act & Assert
        mockMvc.perform(post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isInternalServerError());

        verify(userRepository).findByEmail("nonexistent@example.com");
        verify(passwordEncoder, never()).matches(anyString(), anyString());
        verify(tokenService, never()).generateToken(any(User.class));
    }

    @Test
    void loginFailWhenPasswordIncorrect() throws Exception {
        // Arrange
        LoginRequestDTO loginRequest = new LoginRequestDTO("test@example.com", "wrongPassword");
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("wrongPassword", "encodedPassword")).thenReturn(false);

        // Act & Assert
        mockMvc.perform(post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isBadRequest());

        verify(userRepository).findByEmail("test@example.com");
        verify(passwordEncoder).matches("wrongPassword", "encodedPassword");
        verify(tokenService, never()).generateToken(any(User.class));
    }

    @Test
    void registerSuccess() throws Exception {
        // Arrange
        RegisterRequestDTO registerRequest = new RegisterRequestDTO("New User", "new@example.com", "password123");
        User newUser = new User();
        newUser.setName("New User");
        newUser.setEmail("new@example.com");
        newUser.setPassword("encodedPassword");
        
        when(userRepository.findByEmail("new@example.com")).thenReturn(Optional.empty());
        when(passwordEncoder.encode("password123")).thenReturn("encodedPassword");
        when(tokenService.generateToken(any(User.class))).thenReturn(TEST_TOKEN);

        // Act & Assert
        mockMvc.perform(post("/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("New User"))
                .andExpect(jsonPath("$.token").value(TEST_TOKEN));

        verify(userRepository).findByEmail("new@example.com");
        verify(passwordEncoder).encode("password123");
        verify(userRepository).save(any(User.class));
        verify(tokenService).generateToken(any(User.class));
    }

    @Test
    void registerFailWhenUserExists() throws Exception {
        // Arrange
        RegisterRequestDTO registerRequest = new RegisterRequestDTO("Test User", "test@example.com", "password123");
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));

        // Act & Assert
        mockMvc.perform(post("/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isBadRequest());

        verify(userRepository).findByEmail("test@example.com");
        verify(passwordEncoder, never()).encode(anyString());
        verify(userRepository, never()).save(any(User.class));
        verify(tokenService, never()).generateToken(any(User.class));
    }

    @Test
    void forgotPasswordSuccess() throws Exception {
        // Arrange
        ForgotPasswordRequestDTO forgotPasswordRequest = new ForgotPasswordRequestDTO();
        forgotPasswordRequest.setEmail("test@example.com");
        
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(tokenService.generateToken(testUser)).thenReturn(TEST_TOKEN);
        doNothing().when(emailService).sendPasswordResetEmail(testUser, TEST_TOKEN);

        // Act & Assert
        mockMvc.perform(post("/auth/forgot-password")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(forgotPasswordRequest)))
                .andExpect(status().isOk())
                .andExpect(content().string("Password reset email sent"));

        verify(userRepository).findByEmail("test@example.com");
        verify(tokenService).generateToken(testUser);
        verify(emailService).sendPasswordResetEmail(testUser, TEST_TOKEN);
    }

    @Test
    void forgotPasswordFailWhenUserNotFound() throws Exception {
        // Arrange
        ForgotPasswordRequestDTO forgotPasswordRequest = new ForgotPasswordRequestDTO();
        forgotPasswordRequest.setEmail("nonexistent@example.com");
        
        when(userRepository.findByEmail("nonexistent@example.com")).thenReturn(Optional.empty());

        // Act & Assert
        mockMvc.perform(post("/auth/forgot-password")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(forgotPasswordRequest)))
                .andExpect(status().isInternalServerError());

        verify(userRepository).findByEmail("nonexistent@example.com");
        verify(tokenService, never()).generateToken(any(User.class));
        verify(emailService, never()).sendPasswordResetEmail(any(User.class), anyString());
    }

    @Test
    void resetPasswordSuccess() throws Exception {
        // Arrange
        String newPassword = "newPassword123";
        
        when(tokenService.validateToken(TEST_TOKEN)).thenReturn("test@example.com");
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(passwordEncoder.encode(newPassword)).thenReturn("newEncodedPassword");

        // Act & Assert
        mockMvc.perform(post("/auth/reset-password")
                .param("token", TEST_TOKEN)
                .contentType(MediaType.TEXT_PLAIN)
                .content(newPassword))
                .andExpect(status().isOk())
                .andExpect(content().string("Password updated successfully"));

        verify(tokenService).validateToken(TEST_TOKEN);
        verify(userRepository).findByEmail("test@example.com");
        verify(passwordEncoder).encode(newPassword);
        verify(userRepository).save(testUser);
    }

    @Test
    void resetPasswordFailWithInvalidToken() throws Exception {
        // Arrange
        String newPassword = "newPassword123";
        when(tokenService.validateToken("invalid-token")).thenReturn(null);

        // Act & Assert
        mockMvc.perform(post("/auth/reset-password")
                .param("token", "invalid-token")
                .contentType(MediaType.TEXT_PLAIN)
                .content(newPassword))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Invalid token"));

        verify(tokenService).validateToken("invalid-token");
        verify(userRepository, never()).findByEmail(anyString());
        verify(passwordEncoder, never()).encode(anyString());
        verify(userRepository, never()).save(any(User.class));
    }
}

