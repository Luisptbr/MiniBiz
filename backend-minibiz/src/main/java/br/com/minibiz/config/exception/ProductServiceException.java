package br.com.minibiz.config.exception;

//Herda de RuntimeException para criar uma exceção personalizada
public class ProductServiceException extends RuntimeException {
	// Construtor que aceita uma mensagem
	public ProductServiceException (String message) {
		super(message);
	}
	// Construtor que aceita uma mensagem e uma causa
	public ProductServiceException(String message, Throwable cause) { 
		super(message, cause);
	}
	// Construtor que aceita uma causa
	public ProductServiceException(Throwable cause) { 
		super(cause); 
	}
}
