package br.com.minibiz.dto;

import br.com.minibiz.model.venda.StatusVenda;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class VendaResponse {
    private Long id;
    private Long clientId;
    private List<ProductDTO> products;
    private BigDecimal valorTotal;
    private LocalDateTime vendaDate;
    private StatusVenda status;

    // Getters e Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getClientId() {
        return clientId;
    }

    public void setClientId(Long clientId) {
        this.clientId = clientId;
    }

    public List<ProductDTO> getProducts() {
        return products;
    }

    public void setProducts(List<ProductDTO> products) {
        this.products = products;
    }

    public BigDecimal getValorTotal() {
        return valorTotal;
    }

    public void setValorTotal(BigDecimal valorTotal) {
        this.valorTotal = valorTotal;
    }

    public LocalDateTime getVendaDate() {
        return vendaDate;
    }

    public void setVendaDate(LocalDateTime vendaDate) {
        this.vendaDate = vendaDate;
    }

    public StatusVenda getStatus() {
        return status;
    }

    public void setStatus(StatusVenda status) {
        this.status = status;
    }
}
