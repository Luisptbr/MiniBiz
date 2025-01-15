package br.com.minibiz.repository;

import br.com.minibiz.model.venda.ItemVenda;
import br.com.minibiz.model.venda.Venda;
import br.com.minibiz.model.client.Client;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface VendaRepository extends JpaRepository<Venda, Long> {
    boolean existsByClientAndItemsInAndVendaDateBetween(Client client, List<ItemVenda> items, LocalDateTime startDate, LocalDateTime endDate);
}

