package br.com.minibiz.dto;

import java.util.List;

public class VendaRequest {
    private Long clientId;
    private List<VendaDTO> produtosDTO;

    // Getters e Setters

    public Long getClientId() {
        return clientId;
    }

    public void setClientId(Long clientId) {
        this.clientId = clientId;
    }

    public List<VendaDTO> getProdutosDTO() {
        return produtosDTO;
    }

    public void setProdutosDTO(List<VendaDTO> produtosDTO) {
        this.produtosDTO = produtosDTO;
    }
}
