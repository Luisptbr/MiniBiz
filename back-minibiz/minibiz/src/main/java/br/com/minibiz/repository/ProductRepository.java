package br.com.minibiz.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import br.com.minibiz.model.products.Products;

@Repository
public interface ProductRepository extends JpaRepository<Products, Long> {
    Optional<Products> findByName(String name);
}
