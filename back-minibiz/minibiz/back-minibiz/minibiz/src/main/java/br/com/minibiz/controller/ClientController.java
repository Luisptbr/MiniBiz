package br.com.minibiz.controller;

import br.com.minibiz.model.client.Client;
import br.com.minibiz.service.ClientService;

import java.util.NoSuchElementException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;


@RestController
@RequestMapping("/api/clients")
public class ClientController {
	@Autowired
	private ClientService clientService;
	
	@GetMapping
	public ResponseEntity<Page<Client>> listarTodosClientes(Pageable pageable) {
		Page<Client> clients = clientService.findAll(pageable);
		return ResponseEntity.ok(clients);
	}
	
	@GetMapping("/{id}")
	public ResponseEntity<Client> listarCliente(@PathVariable Long id) {
		Client client = clientService.findById(id);
		return ResponseEntity.ok(client);
	}

	@PostMapping
	public ResponseEntity<Client> criarCliente(@RequestBody Client client) {
		Client novoCliente = clientService.create(client);
		return ResponseEntity.ok(novoCliente);
	}

	@PutMapping("/{id}")
	public ResponseEntity<Client> editarCliente(@PathVariable Long id, @RequestBody Client clienteAtualizado) {
		Client cliente = clientService.update(id, clienteAtualizado);
		return ResponseEntity.ok(cliente);
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<String> deletarCliente(@PathVariable Long id) {
	    try {
	        clientService.delete(id); // Supondo que delete lance uma exceção se algo der errado
	        return ResponseEntity.ok("Cliente deletado com sucesso!");
	    } catch (NoSuchElementException e) {
	        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Cliente não encontrado.");
	    } catch (Exception e) {
	        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Erro ao deletar cliente: " + e.getMessage());
	    }
	}
}
