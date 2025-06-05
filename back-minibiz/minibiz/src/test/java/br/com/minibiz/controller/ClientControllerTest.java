package br.com.minibiz.controller;

import br.com.minibiz.model.client.Client;
import br.com.minibiz.service.ClientService;
import br.com.minibiz.exception.ClientNotFoundException;
import br.com.minibiz.exception.ClientServiceException;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.result.MockMvcResultMatchers;

import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.Arrays;
import java.util.List;
import java.util.NoSuchElementException;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ClientController.class)
public class ClientControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ClientService clientService;

    @Autowired
    private ObjectMapper objectMapper;

    private Client testClient;

    @BeforeEach
    void setUp() {
        testClient = new Client();
        testClient.setId(1L);
        testClient.setNome("Test Client");
        testClient.setEndereco("123 Test Street");
        testClient.setEmail("test@example.com");
        testClient.setTelefone("123-456-7890");
    }

    @Test
    public void testListarTodosClientes() throws Exception {
        // Setup mock data
        List<Client> clients = Arrays.asList(testClient);
        Page<Client> clientPage = new PageImpl<>(clients);
        
        // Mock service behavior
        when(clientService.findAll(any(Pageable.class))).thenReturn(clientPage);

        // Perform and verify GET request
        mockMvc.perform(MockMvcRequestBuilders.get("/api/clients")
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.content[0].id").value(testClient.getId()))
                .andExpect(jsonPath("$.content[0].nome").value(testClient.getNome()))
                .andExpect(jsonPath("$.content[0].endereco").value(testClient.getEndereco()))
                .andExpect(jsonPath("$.content[0].email").value(testClient.getEmail()))
                .andExpect(jsonPath("$.content[0].telefone").value(testClient.getTelefone()));

        // Verify service was called
        verify(clientService, times(1)).findAll(any(Pageable.class));
    }

    @Test
    public void testListarClienteSuccess() throws Exception {
        // Mock service behavior
        when(clientService.findById(1L)).thenReturn(testClient);

        // Perform and verify GET request
        mockMvc.perform(MockMvcRequestBuilders.get("/api/clients/1")
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.id").value(testClient.getId()))
                .andExpect(jsonPath("$.nome").value(testClient.getNome()))
                .andExpect(jsonPath("$.endereco").value(testClient.getEndereco()))
                .andExpect(jsonPath("$.email").value(testClient.getEmail()))
                .andExpect(jsonPath("$.telefone").value(testClient.getTelefone()));

        // Verify service was called
        verify(clientService, times(1)).findById(1L);
    }

    @Test
    public void testListarClienteNotFound() throws Exception {
        // Mock service behavior - throw exception when client not found
        when(clientService.findById(999L)).thenThrow(new ClientNotFoundException("Cliente não encontrado"));

        // Perform GET request and verify 404 response
        mockMvc.perform(MockMvcRequestBuilders.get("/api/clients/999")
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());

        verify(clientService, times(1)).findById(999L);
    }

    @Test
    public void testCriarClienteSuccess() throws Exception {
        // Mock service behavior
        when(clientService.create(any(Client.class))).thenReturn(testClient);

        // Perform POST request with client data and verify response
        mockMvc.perform(MockMvcRequestBuilders.post("/api/clients")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testClient))
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.id").value(testClient.getId()))
                .andExpect(jsonPath("$.nome").value(testClient.getNome()))
                .andExpect(jsonPath("$.endereco").value(testClient.getEndereco()))
                .andExpect(jsonPath("$.email").value(testClient.getEmail()))
                .andExpect(jsonPath("$.telefone").value(testClient.getTelefone()));

        verify(clientService, times(1)).create(any(Client.class));
    }

    @Test
    public void testCriarClienteError() throws Exception {
        // Mock service behavior - throw exception when there's an error
        when(clientService.create(any(Client.class))).thenThrow(new ClientServiceException("Erro ao criar cliente"));

        // Perform POST request and verify error response
        mockMvc.perform(MockMvcRequestBuilders.post("/api/clients")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testClient))
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isInternalServerError());

        verify(clientService, times(1)).create(any(Client.class));
    }

    @Test
    public void testEditarClienteSuccess() throws Exception {
        // Create updated client
        Client updatedClient = new Client();
        updatedClient.setId(1L);
        updatedClient.setNome("Updated Name");
        updatedClient.setEndereco("456 Updated Street");
        updatedClient.setEmail("updated@example.com");
        updatedClient.setTelefone("987-654-3210");

        // Mock service behavior
        when(clientService.update(eq(1L), any(Client.class))).thenReturn(updatedClient);

        // Perform PUT request with updated client data and verify response
        mockMvc.perform(MockMvcRequestBuilders.put("/api/clients/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updatedClient))
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.id").value(updatedClient.getId()))
                .andExpect(jsonPath("$.nome").value(updatedClient.getNome()))
                .andExpect(jsonPath("$.endereco").value(updatedClient.getEndereco()))
                .andExpect(jsonPath("$.email").value(updatedClient.getEmail()))
                .andExpect(jsonPath("$.telefone").value(updatedClient.getTelefone()));

        verify(clientService, times(1)).update(eq(1L), any(Client.class));
    }

    @Test
    public void testEditarClienteNotFound() throws Exception {
        // Mock service behavior - throw exception when client not found
        when(clientService.update(eq(999L), any(Client.class))).thenThrow(new ClientNotFoundException("Cliente não encontrado"));

        // Perform PUT request and verify 404 response
        mockMvc.perform(MockMvcRequestBuilders.put("/api/clients/999")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testClient))
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());

        verify(clientService, times(1)).update(eq(999L), any(Client.class));
    }

    @Test
    public void testDeletarClienteSuccess() throws Exception {
        // Mock service behavior - successful deletion
        doNothing().when(clientService).delete(1L);

        // Perform DELETE request and verify success response
        mockMvc.perform(MockMvcRequestBuilders.delete("/api/clients/1")
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().string("Cliente deletado com sucesso!"));

        verify(clientService, times(1)).delete(1L);
    }

    @Test
    public void testDeletarClienteNotFound() throws Exception {
        // Mock service behavior - throw exception when client not found
        doThrow(new NoSuchElementException("Cliente não encontrado")).when(clientService).delete(999L);

        // Perform DELETE request and verify 404 response
        mockMvc.perform(MockMvcRequestBuilders.delete("/api/clients/999")
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound())
                .andExpect(content().string("Cliente não encontrado."));

        verify(clientService, times(1)).delete(999L);
    }

    @Test
    public void testDeletarClienteInternalError() throws Exception {
        // Mock service behavior - throw generic exception
        doThrow(new RuntimeException("Database error")).when(clientService).delete(1L);

        // Perform DELETE request and verify 500 response
        mockMvc.perform(MockMvcRequestBuilders.delete("/api/clients/1")
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isInternalServerError())
                .andExpect(content().string(containsString("Erro ao deletar cliente")));

        verify(clientService, times(1)).delete(1L);
    }
}

package br.com.minibiz.controller;

import br.com.minibiz.config.exception.ClientNotFoundException;
import br.com.minibiz.config.exception.ClientServiceException;
import br.com.minibiz.model.client.Client;
import br.com.minibiz.service.ClientService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Arrays;
import java.util.List;
import java.util.NoSuchElementException;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ClientController.class)
public class ClientControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
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
    void listarTodosClientes_ReturnsPageOfClients() throws Exception {
        // Arrange
        List<Client> clients = Arrays.asList(client, new Client());
        Page<Client> page = new PageImpl<>(clients);
        
        when(clientService.findAll(any(Pageable.class))).thenReturn(page);

        // Act & Assert
        mockMvc.perform(get("/api/clients")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(2)))
                .andExpect(jsonPath("$.totalElements").value(2));

        verify(clientService, times(1)).findAll(any(Pageable.class));
    }

    @Test
    void listarCliente_ExistingId_ReturnsClient() throws Exception {
        // Arrange
        when(clientService.findById(clientId)).thenReturn(client);

        // Act & Assert
        mockMvc.perform(get("/api/clients/{id}", clientId)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(clientId))
                .andExpect(jsonPath("$.nome").value("Cliente Teste"))
                .andExpect(jsonPath("$.email").value("cliente@teste.com"))
                .andExpect(jsonPath("$.endereco").value("Rua Teste, 123"))
                .andExpect(jsonPath("$.telefone").value("(11) 99999-9999"));

        verify(clientService, times(1)).findById(clientId);
    }

    @Test
    void listarCliente_NonExistingId_ReturnsNotFound() throws Exception {
        // Arrange
        when(clientService.findById(clientId)).thenThrow(new ClientNotFoundException(clientId));

        // Act & Assert
        mockMvc.perform(get("/api/clients/{id}", clientId)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());

        verify(clientService, times(1)).findById(clientId);
    }

    @Test
    void criarCliente_ValidClient_ReturnsCreatedClient() throws Exception {
        // Arrange
        when(clientService.create(any(Client.class))).thenReturn(client);

        // Act & Assert
        mockMvc.perform(post("/api/clients")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(client)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(clientId))
                .andExpect(jsonPath("$.nome").value("Cliente Teste"))
                .andExpect(jsonPath("$.email").value("cliente@teste.com"));

        verify(clientService, times(1)).create(any(Client.class));
    }

    @Test
    void criarCliente_ServiceException_ReturnsBadRequest() throws Exception {
        // Arrange
        when(clientService.create(any(Client.class))).thenThrow(new ClientServiceException("Erro ao adicionar cliente"));

        // Act & Assert
        mockMvc.perform(post("/api/clients")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(client)))
                .andExpect(status().isBadRequest());

        verify(clientService, times(1)).create(any(Client.class));
    }

    @Test
    void editarCliente_ExistingClient_ReturnsUpdatedClient() throws Exception {
        // Arrange
        Client updatedClient = new Client();
        updatedClient.setId(clientId);
        updatedClient.setNome("Cliente Atualizado");
        updatedClient.setEmail("atualizado@teste.com");
        updatedClient.setEndereco("Rua Atualizada, 456");
        updatedClient.setTelefone("(11) 88888-8888");

        when(clientService.update(eq(clientId), any(Client.class))).thenReturn(updatedClient);

        // Act & Assert
        mockMvc.perform(put("/api/clients/{id}", clientId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updatedClient)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(clientId))
                .andExpect(jsonPath("$.nome").value("Cliente Atualizado"))
                .andExpect(jsonPath("$.email").value("atualizado@teste.com"))
                .andExpect(jsonPath("$.endereco").value("Rua Atualizada, 456"))
                .andExpect(jsonPath("$.telefone").value("(11) 88888-8888"));

        verify(clientService, times(1)).update(eq(clientId), any(Client.class));
    }

    @Test
    void editarCliente_NonExistingClient_ReturnsNotFound() throws Exception {
        // Arrange
        when(clientService.update(eq(clientId), any(Client.class))).thenThrow(new ClientNotFoundException(clientId));

        // Act & Assert
        mockMvc.perform(put("/api/clients/{id}", clientId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(client)))
                .andExpect(status().isNotFound());

        verify(clientService, times(1)).update(eq(clientId), any(Client.class));
    }

    @Test
    void deletarCliente_ExistingId_ReturnsSuccess() throws Exception {
        // Arrange
        doNothing().when(clientService).delete(clientId);

        // Act & Assert
        mockMvc.perform(delete("/api/clients/{id}", clientId)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("Cliente deletado com sucesso")));

        verify(clientService, times(1)).delete(clientId);
    }

    @Test
    void deletarCliente_NonExistingId_ReturnsNotFound() throws Exception {
        // Arrange
        doThrow(new NoSuchElementException()).when(clientService).delete(clientId);

        // Act & Assert
        mockMvc.perform(delete("/api/clients/{id}", clientId)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound())
                .andExpect(content().string(containsString("Cliente não encontrado")));

        verify(clientService, times(1)).delete(clientId);
    }

    @Test
    void deletarCliente_ServiceException_ReturnsInternalServerError() throws Exception {
        // Arrange
        doThrow(new RuntimeException("Erro interno")).when(clientService).delete(clientId);

        // Act & Assert
        mockMvc.perform(delete("/api/clients/{id}", clientId)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isInternalServerError())
                .andExpect(content().string(containsString("Erro ao deletar cliente")));

        verify(clientService, times(1)).delete(clientId);
    }
}

