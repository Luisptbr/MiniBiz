package br.com.minibiz.dto;

public class VendaDTO {
    private Long productId;
    private int quantidade;

    // Getters e Setters

    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }

    public int getQuantidade() {
        return quantidade;
    }

    public void setQuantidade(int quantidade) {
        this.quantidade = quantidade;
    }
}
