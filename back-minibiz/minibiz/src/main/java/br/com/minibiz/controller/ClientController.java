package br.com.minibiz.controller;

import br.com.minibiz.model.client.Client;
import br.com.minibiz.service.ClientService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/client")
public class ClientController {
	@Autowired
	private ClientService clientService;

	@GetMapping("/{id}")
	public ResponseEntity<Client> findById(@PathVariable Long id) {
		Client client = clientService.findById(id);
		return ResponseEntity.ok(client);
	}

	@PostMapping
	public ResponseEntity<Client> create(@RequestBody Client client) {
		Client novoCliente = clientService.create(client);
		return ResponseEntity.ok(novoCliente);
	}

	@PutMapping("/{id}")
	public ResponseEntity<Client> update(@PathVariable Long id, @RequestBody Client clienteAtualizado) {
		Client cliente = clientService.update(id, clienteAtualizado);
		return ResponseEntity.ok(cliente);
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Void> delete(@PathVariable Long id) {
		clientService.delete(id);
		return ResponseEntity.noContent().build();
	}

	@GetMapping
	public ResponseEntity<Page<Client>> findAll(Pageable pageable) {
		Page<Client> clients = clientService.findAll(pageable);
		return ResponseEntity.ok(clients);
	}
}
