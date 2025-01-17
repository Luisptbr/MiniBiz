package br.com.minibiz.repository;

import br.com.minibiz.model.venda.ItemVenda;
import br.com.minibiz.model.venda.Venda;
import br.com.minibiz.model.client.Client;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query; 
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface VendaRepository extends JpaRepository<Venda, Long> {
    List<Venda> findAllByVendaDateBetween(LocalDateTime startDate, LocalDateTime endDate);

    boolean existsByClientAndItemsInAndVendaDateBetween(Client client, List<ItemVenda> items, LocalDateTime startDate, LocalDateTime endDate);

    List<Venda> findAllByClientIdAndVendaDateBetween(Long clientId, LocalDateTime startDate, LocalDateTime endDate);

    @Query("SELECT v FROM Venda v WHERE v.client.nome = :clientName AND v.vendaDate BETWEEN :startDate AND :endDate")
    List<Venda> findAllByClientNameAndVendaDateBetween(@Param("clientName") String clientName, @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
}


