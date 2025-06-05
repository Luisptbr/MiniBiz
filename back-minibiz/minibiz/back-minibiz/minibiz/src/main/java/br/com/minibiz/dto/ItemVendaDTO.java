package br.com.minibiz.dto;

public class ItemVendaDTO {
    private String productName;
    private int quantity;

    // Getters e Setters

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }
}
