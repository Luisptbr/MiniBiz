package br.com.minibiz.integration;

import br.com.minibiz.model.client.Client;
import br.com.minibiz.model.user.User;
import br.com.minibiz.repository.ClientRepository;
import br.com.minibiz.repository.UserRepository;
import br.com.minibiz.service.TokenService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.data.domain.Page;
import org.springframework.http.*;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.test.context.ActiveProfiles;

import java.util.Map;
import java.util.Objects;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
public class ClientIntegrationTest {

    @LocalServerPort
    private int port;

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private ClientRepository clientRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TokenService tokenService;

    private String baseUrl;
    private HttpHeaders headers;

    @BeforeEach
    void setUp() {
        baseUrl = "http://localhost:" + port + "/api/clients";
        headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        
        // Set up authentication
        setupAuthentication();
        
        // Clear the client repository before each test
        clientRepository.deleteAll();
    }

    @AfterEach
    void tearDown() {
        // Clean up after each test
        clientRepository.deleteAll();
    }

    private void setupAuthentication() {
        // Create a test user if not exists
        if (userRepository.findByEmail("admin@test.com").isEmpty()) {
            User testUser = new User();
            testUser.setName("Admin Test");
            testUser.setEmail("admin@test.com");
            testUser.setPassword(new BCryptPasswordEncoder().encode("password"));
            testUser.setRole("ADMIN");
            userRepository.save(testUser);
        }
        
        // Generate JWT token
        User user = userRepository.findByEmail("admin@test.com").get();
        String token = tokenService.generateToken(user);
        
        // Add token to headers
        headers.setBearerAuth(token);
    }

    @Test
    void whenGetAllClients_thenStatus200AndEmptyList() {
        // Act
        ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                baseUrl,
                HttpMethod.GET,
                new HttpEntity<>(headers),
                new ParameterizedTypeReference<Map<String, Object>>() {}
        );

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(0, ((Integer) response.getBody().get("totalElements")).intValue());
    }

    @Test
    void whenCreateClient_thenStatus200AndClientCreated() {
        // Arrange
        Client newClient = new Client();
        newClient.setNome("Test Client");
        newClient.setEmail("test@example.com");
        newClient.setTelefone("(11) 99999-9999");
        newClient.setEndereco("Test Address, 123");

        // Act
        ResponseEntity<Client> response = restTemplate.exchange(
                baseUrl,
                HttpMethod.POST,
                new HttpEntity<>(newClient, headers),
                Client.class
        );

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertNotNull(response.getBody().getId());
        assertEquals("Test Client", response.getBody().getNome());
        assertEquals("test@example.com", response.getBody().getEmail());

        // Verify client was saved to database
        assertEquals(1, clientRepository.count());
    }

    @Test
    void whenGetClientById_thenStatus200AndClientReturned() {
        // Arrange
        Client savedClient = clientRepository.save(createTestClient());

        // Act
        ResponseEntity<Client> response = restTemplate.exchange(
                baseUrl + "/" + savedClient.getId(),
                HttpMethod.GET,
                new HttpEntity<>(headers),
                Client.class
        );

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(savedClient.getId(), response.getBody().getId());
        assertEquals(savedClient.getNome(), response.getBody().getNome());
    }

    @Test
    void whenGetNonExistentClient_thenStatus404() {
        // Act
        ResponseEntity<String> response = restTemplate.exchange(
                baseUrl + "/999",
                HttpMethod.GET,
                new HttpEntity<>(headers),
                String.class
        );

        // Assert
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }

    @Test
    void whenUpdateClient_thenStatus200AndClientUpdated() {
        // Arrange
        Client savedClient = clientRepository.save(createTestClient());
        
        Client updatedClient = new Client();
        updatedClient.setNome("Updated Name");
        updatedClient.setEmail("updated@example.com");
        updatedClient.setTelefone("(11) 88888-8888");
        updatedClient.setEndereco("Updated Address, 456");

        // Act
        ResponseEntity<Client> response = restTemplate.exchange(
                baseUrl + "/" + savedClient.getId(),
                HttpMethod.PUT,
                new HttpEntity<>(updatedClient, headers),
                Client.class
        );

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(savedClient.getId(), response.getBody().getId());
        assertEquals("Updated Name", response.getBody().getNome());
        assertEquals("updated@example.com", response.getBody().getEmail());

        // Verify database was updated
        Client dbClient = clientRepository.findById(savedClient.getId()).orElse(null);
        assertNotNull(dbClient);
        assertEquals("Updated Name", dbClient.getNome());
    }

    @Test
    void whenDeleteClient_thenStatus200AndClientDeleted() {
        // Arrange
        Client savedClient = clientRepository.save(createTestClient());

        // Act
        ResponseEntity<String> response = restTemplate.exchange(
                baseUrl + "/" + savedClient.getId(),
                HttpMethod.DELETE,
                new HttpEntity<>(headers),
                String.class
        );

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody().contains("Cliente deletado com sucesso"));

        // Verify client was deleted from database
        assertFalse(clientRepository.existsById(savedClient.getId()));
    }

    @Test
    void whenDeleteNonExistentClient_thenStatus404() {
        // Act
        ResponseEntity<String> response = restTemplate.exchange(
                baseUrl + "/999",
                HttpMethod.DELETE,
                new HttpEntity<>(headers),
                String.class
        );

        // Assert
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertTrue(response.getBody().contains("Cliente não encontrado"));
    }

    private Client createTestClient() {
        Client client = new Client();
        client.setNome("Integration Test Client");
        client.setEmail("integration@test.com");
        client.setTelefone("(11) 99999-9999");
        client.setEndereco("Integration Test Address, 123");
        return client;
    }
}

