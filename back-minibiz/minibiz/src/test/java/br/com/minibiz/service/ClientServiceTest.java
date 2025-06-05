package br.com.minibiz.service;

import br.com.minibiz.config.exception.ClientNotFoundException;
import br.com.minibiz.config.exception.ClientServiceException;
import br.com.minibiz.model.client.Client;
import br.com.minibiz.repository.ClientRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ClientServiceTest {

    @Mock
    private ClientRepository clientRepository;

    @InjectMocks
    private ClientService clientService;

    private Client client;
    private final Long clientId = 1L;

    @BeforeEach
    void setUp() {
        client = new Client();
        client.setId(clientId);
        client.setNome("Cliente Teste");
        client.setEmail("cliente@teste.com");
        client.setEndereco("Rua Teste, 123");
        client.setTelefone("(11) 99999-9999");
    }

    @Test
    void findById_ExistingId_ReturnsClient() {
        // Arrange
        when(clientRepository.findById(clientId)).thenReturn(Optional.of(client));

        // Act
        Client result = clientService.findById(clientId);

        // Assert
        assertNotNull(result);
        assertEquals(clientId, result.getId());
        assertEquals("Cliente Teste", result.getNome());
        verify(clientRepository, times(1)).findById(clientId);
    }

    @Test
    void findById_NonExistingId_ThrowsClientNotFoundException() {
        // Arrange
        when(clientRepository.findById(clientId)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ClientNotFoundException.class, () -> clientService.findById(clientId));
        verify(clientRepository, times(1)).findById(clientId);
    }

    @Test
    void create_ValidClient_ReturnsCreatedClient() {
        // Arrange
        when(clientRepository.save(any(Client.class))).thenReturn(client);

        // Act
        Client result = clientService.create(client);

        // Assert
        assertNotNull(result);
        assertEquals(clientId, result.getId());
        assertEquals("Cliente Teste", result.getNome());
        verify(clientRepository, times(1)).save(any(Client.class));
    }

    @Test
    void create_ExceptionThrown_ThrowsClientServiceException() {
        // Arrange
        when(clientRepository.save(any(Client.class))).thenThrow(new RuntimeException("Database error"));

        // Act & Assert
        assertThrows(ClientServiceException.class, () -> clientService.create(client));
        verify(clientRepository, times(1)).save(any(Client.class));
    }

    @Test
    void update_ExistingClient_ReturnsUpdatedClient() {
        // Arrange
        Client updatedClient = new Client();
        updatedClient.setId(clientId);
        updatedClient.setNome("Cliente Atualizado");
        updatedClient.setEmail("atualizado@teste.com");
        updatedClient.setEndereco("Rua Atualizada, 456");
        updatedClient.setTelefone("(11) 88888-8888");

        when(clientRepository.findById(clientId)).thenReturn(Optional.of(client));
        when(clientRepository.save(any(Client.class))).thenReturn(updatedClient);

        // Act
        Client result = clientService.update(clientId, updatedClient);

        // Assert
        assertNotNull(result);
        assertEquals(clientId, result.getId());
        assertEquals("Cliente Atualizado", result.getNome());
        assertEquals("atualizado@teste.com", result.getEmail());
        assertEquals("Rua Atualizada, 456", result.getEndereco());
        assertEquals("(11) 88888-8888", result.getTelefone());
        
        verify(clientRepository, times(1)).findById(clientId);
        verify(clientRepository, times(1)).save(any(Client.class));
    }

    @Test
    void update_NonExistingClient_ThrowsClientNotFoundException() {
        // Arrange
        when(clientRepository.findById(clientId)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ClientNotFoundException.class, () -> clientService.update(clientId, client));
        verify(clientRepository, times(1)).findById(clientId);
        verify(clientRepository, never()).save(any(Client.class));
    }

    @Test
    void delete_ExistingId_DeletesClient() {
        // Arrange
        when(clientRepository.existsById(clientId)).thenReturn(true);
        doNothing().when(clientRepository).deleteById(clientId);

        // Act
        clientService.delete(clientId);

        // Assert
        verify(clientRepository, times(1)).existsById(clientId);
        verify(clientRepository, times(1)).deleteById(clientId);
    }

    @Test
    void delete_NonExistingId_ThrowsClientNotFoundException() {
        // Arrange
        when(clientRepository.existsById(clientId)).thenReturn(false);

        // Act & Assert
        assertThrows(ClientNotFoundException.class, () -> clientService.delete(clientId));
        verify(clientRepository, times(1)).existsById(clientId);
        verify(clientRepository, never()).deleteById(clientId);
    }

    @Test
    void delete_ExceptionThrown_ThrowsClientServiceException() {
        // Arrange
        when(clientRepository.existsById(clientId)).thenReturn(true);
        doThrow(new RuntimeException("Database error")).when(clientRepository).deleteById(clientId);

        // Act & Assert
        assertThrows(ClientServiceException.class, () -> clientService.delete(clientId));
        verify(clientRepository, times(1)).existsById(clientId);
        verify(clientRepository, times(1)).deleteById(clientId);
    }

    @Test
    void findAll_ReturnsPageOfClients() {
        // Arrange
        Pageable pageable = PageRequest.of(0, 10);
        List<Client> clients = Arrays.asList(client, new Client());
        Page<Client> page = new PageImpl<>(clients, pageable, clients.size());
        
        when(clientRepository.findAll(pageable)).thenReturn(page);

        // Act
        Page<Client> result = clientService.findAll(pageable);

        // Assert
        assertNotNull(result);
        assertEquals(2, result.getTotalElements());
        assertEquals(2, result.getContent().size());
        verify(clientRepository, times(1)).findAll(pageable);
    }
}

