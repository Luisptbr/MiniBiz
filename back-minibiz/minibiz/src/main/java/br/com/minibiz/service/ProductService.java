package br.com.minibiz.service;

import br.com.minibiz.model.product.Product;
import br.com.minibiz.repository.ProductRepository;
import br.com.minibiz.config.exception.ProductNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    public Product create(Product product) {
        product.setDataCriacao(LocalDateTime.now());
        return productRepository.save(product);
    }

    public Product update(Long id, Product produtoAtualizado) {
        Optional<Product> produtoOptional = productRepository.findById(id);
        if (produtoOptional.isPresent()) {
            Product produtoExistente = produtoOptional.get();
            produtoExistente.setNome(produtoAtualizado.getNome());
            produtoExistente.setDescricao(produtoAtualizado.getDescricao());
            produtoExistente.setPreco(produtoAtualizado.getPreco());
            produtoExistente.setQuantidadeEmEstoque(produtoAtualizado.getQuantidadeEmEstoque());
            produtoExistente.setCodigoProduto(produtoAtualizado.getCodigoProduto());
            produtoExistente.setCategoria(produtoAtualizado.getCategoria());
            produtoExistente.setDataAtualizacao(LocalDateTime.now());
            return productRepository.save(produtoExistente);
        } else {
            throw new ProductNotFoundException(id);
        }
    }

    public void delete(Long id) {
        if (productRepository.existsById(id)) {
            productRepository.deleteById(id);
        } else {
            throw new ProductNotFoundException(id);
        }
    }

    public Product findById(Long id) {
        return productRepository.findById(id)
            .orElseThrow(() -> new ProductNotFoundException(id));
    }

    public Page<Product> findAll(Pageable pageable) {
        return productRepository.findAll(pageable);
    }
}
