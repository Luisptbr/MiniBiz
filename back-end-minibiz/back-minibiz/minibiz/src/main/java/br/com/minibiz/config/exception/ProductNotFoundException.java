package br.com.minibiz.config.exception;

public class ProductNotFoundException extends RuntimeException {
    private static final long serialVersionUID = 1L;

    public ProductNotFoundException(Long id) {
        super("Produto com ID " + id + " não encontrado.");
    }
}
