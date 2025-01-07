package br.com.minibiz.model.venda;

import br.com.minibiz.model.client.Client;
import br.com.minibiz.model.product.Product;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
public class Venda {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private Client client;

    @ManyToMany
    private List<Product> products;

    private BigDecimal totalAmount;
    private LocalDateTime vendaDate;
    private String status; // Ex: "COMPLETA", "CANCELADA"
	

    // Getters e Setters
    
    public Long getId() {
		return id;
	}
	public void setId(Long id) {
		this.id = id;
	}
	public Client getClient() {
		return this.client;
	}
	public void setClient(Client client) {
		this.client = client;
	}
	public List<Product> getProducts() {
		return this.products;
	}
	public void setProducts(List<Product> products) {
		this.products = products;
	}
	public BigDecimal getTotalAmount() {
		return this.totalAmount;
	}
	public void setTotalAmount(BigDecimal totalAmount) {
		this.totalAmount = totalAmount;
	}
	public LocalDateTime getVendaDate() {
		return this.vendaDate;
	}
	public void setVendaDate(LocalDateTime vendaDate) {
		this.vendaDate = vendaDate;
	}
	public String getStatus() {
		return this.status;
	}
	public void setStatus(String status) {
		this.status = status;
	}
}
