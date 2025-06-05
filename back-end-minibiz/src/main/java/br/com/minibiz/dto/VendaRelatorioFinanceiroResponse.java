package br.com.minibiz.dto;

import java.math.BigDecimal;

public class VendaRelatorioFinanceiroResponse {
    private BigDecimal receitaTotal;
    private BigDecimal despesasTotais;
    private BigDecimal lucroLiquido;

    // Getters e Setters

    public BigDecimal getReceitaTotal() {
        return receitaTotal;
    }

    public void setReceitaTotal(BigDecimal receitaTotal) {
        this.receitaTotal = receitaTotal;
    }

    public BigDecimal getDespesasTotais() {
        return despesasTotais;
    }

    public void setDespesasTotais(BigDecimal despesasTotais) {
        this.despesasTotais = despesasTotais;
    }

    public BigDecimal getLucroLiquido() {
        return lucroLiquido;
    }

    public void setLucroLiquido(BigDecimal lucroLiquido) {
        this.lucroLiquido = lucroLiquido;
    }
}
