package br.com.minibiz.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class DetalheVendaDTO {
    private LocalDateTime vendaDate;
    private String clientName;
    private String status;
    private List<ItemVendaDTO> items;
    private BigDecimal valorTotal;

    // Getters e Setters

    public LocalDateTime getVendaDate() {
        return vendaDate;
    }

    public void setVendaDate(LocalDateTime vendaDate) {
        this.vendaDate = vendaDate;
    }

    public String getClientName() {
        return clientName;
    }

    public void setClientName(String clientName) {
        this.clientName = clientName;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public List<ItemVendaDTO> getItems() {
        return items;
    }

    public void setItems(List<ItemVendaDTO> items) {
        this.items = items;
    }

    public BigDecimal getValorTotal() {
        return valorTotal;
    }

    public void setValorTotal(BigDecimal valorTotal) {
        this.valorTotal = valorTotal;
    }
}
