package br.com.minibiz.config.exception;

public class ClientNotFoundException extends RuntimeException {
	public ClientNotFoundException(Long id) {
		super("Cliente com ID " + id + " não encontrado.");
	}
}
