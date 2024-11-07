package br.com.minibiz.service;

import br.com.minibiz.config.exception.ClientNotFoundException;
import br.com.minibiz.config.exception.ClientServiceException;
import br.com.minibiz.model.client.Client;
import br.com.minibiz.repository.ClientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import java.util.Optional;

@Service
public class ClientService {
	@Autowired
	private ClientRepository clientRepository;

	public Client findById(Long id) {
		return clientRepository.findById(id).orElseThrow(() -> new ClientNotFoundException(id));
	}

	public Client create(Client client) {
		try {
			return clientRepository.save(client);
		} catch (Exception e) {
			throw new ClientServiceException("Erro ao adicionar cliente: " + e.getMessage());
		}
	}

	public Client update(Long id, Client clienteAtualizado) {
		Optional<Client> clienteOptional = clientRepository.findById(id);
		if (clienteOptional.isPresent()) {
			Client clienteExistente = clienteOptional.get();
			clienteExistente.setNome(clienteAtualizado.getNome());
			clienteExistente.setEndereco(clienteAtualizado.getEndereco());
			clienteExistente.setEmail(clienteAtualizado.getEmail());
			clienteExistente.setTelefone(clienteAtualizado.getTelefone());
			return clientRepository.save(clienteExistente);
		} else {
			throw new ClientNotFoundException(id);
		}
	}

	public void delete(Long id) {
		try {
			clientRepository.deleteById(id);
		} catch (Exception e) {
			throw new ClientServiceException("Erro ao deletar cliente: " + e.getMessage());
		}
	}

	public Page<Client> findAll(Pageable pageable) {
		return clientRepository.findAll(pageable);
	}
}