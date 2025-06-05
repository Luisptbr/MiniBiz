package br.com.minibiz.controller;

import br.com.minibiz.model.product.Product;
import br.com.minibiz.service.ProductService;
import br.com.minibiz.config.exception.ProductNotFoundException;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ProductController.class)
public class ProductControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ProductService productService;

    @Autowired
    private ObjectMapper objectMapper;

    private Product produto1;
    private Product produto2;
    private List<Product> produtos;
    private Page<Product> produtosPage;

    @BeforeEach
    void setUp() {
        // Configura produtos de teste
        produto1 = new Product();
        produto1.setId(1L);
        produto1.setNome("Notebook Dell");
        produto1.setDescricao("Notebook Dell Inspiron 15");
        produto1.setPreco(new BigDecimal("3500.00"));
        produto1.setQuantidadeEmEstoque(10);
        produto1.setCodigoProduto("DELL-001");
        produto1.setCategoria("Informática");
        produto1.setDataCriacao(LocalDateTime.now());

        produto2 = new Product();
        produto2.setId(2L);
        produto2.setNome("Mouse Logitech");
        produto2.setDescricao("Mouse sem fio Logitech");
        produto2.setPreco(new BigDecimal("120.00"));
        produto2.setQuantidadeEmEstoque(50);
        produto2.setCodigoProduto("LOG-001");
        produto2.setCategoria("Periféricos");
        produto2.setDataCriacao(LocalDateTime.now());

        produtos = Arrays.asList(produto1, produto2);
        produtosPage = new PageImpl<>(produtos);
    }

    @Test
    void listarTodosProdutos_DeveRetornarPaginaComProdutos() throws Exception {
        // Configura o mock para retornar a página de produtos
        when(productService.findAll(any(Pageable.class))).thenReturn(produtosPage);

        // Executa a requisição e verifica o resultado
        mockMvc.perform(get("/api/products")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(2)))
                .andExpect(jsonPath("$.content[0].id", is(1)))
                .andExpect(jsonPath("$.content[0].nome", is("Notebook Dell")))
                .andExpect(jsonPath("$.content[1].id", is(2)))
                .andExpect(jsonPath("$.content[1].nome", is("Mouse Logitech")));

        // Verifica se o método do serviço foi chamado
        verify(productService).findAll(any(Pageable.class));
    }

    @Test
    void listarProduto_QuandoExiste_DeveRetornarProduto() throws Exception {
        // Configura o mock para retornar um produto quando buscado pelo ID
        when(productService.findById(1L)).thenReturn(produto1);

        // Executa a requisição e verifica o resultado
        mockMvc.perform(get("/api/products/1")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(1)))
                .andExpect(jsonPath("$.nome", is("Notebook Dell")))
                .andExpect(jsonPath("$.preco", is(3500.00)))
                .andExpect(jsonPath("$.codigoProduto", is("DELL-001")));

        // Verifica se o método do serviço foi chamado
        verify(productService).findById(1L);
    }

    @Test
    void listarProduto_QuandoNaoExiste_DeveRetornarNotFound() throws Exception {
        // Configura o mock para lançar exceção quando o produto não existe
        when(productService.findById(999L)).thenThrow(new ProductNotFoundException(999L));

        // Executa a requisição e verifica o resultado
        mockMvc.perform(get("/api/products/999")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());

        // Verifica se o método do serviço foi chamado
        verify(productService).findById(999L);
    }

    @Test
    void criarProduto_ComDadosValidos_DeveCriarERetornarProduto() throws Exception {
        // Configura produto para criar
        Product novoProduto = new Product();
        novoProduto.setNome("Teclado Mecânico");
        novoProduto.setDescricao("Teclado Mecânico RGB");
        novoProduto.setPreco(new BigDecimal("250.00"));
        novoProduto.setQuantidadeEmEstoque(15);
        novoProduto.setCodigoProduto("TEC-001");
        novoProduto.setCategoria("Periféricos");

        // Configura produto criado com ID
        Product produtoCriado = new Product();
        produtoCriado.setId(3L);
        produtoCriado.setNome("Teclado Mecânico");
        produtoCriado.setDescricao("Teclado Mecânico RGB");
        produtoCriado.setPreco(new BigDecimal("250.00"));
        produtoCriado.setQuantidadeEmEstoque(15);
        produtoCriado.setCodigoProduto("TEC-001");
        produtoCriado.setCategoria("Periféricos");
        produtoCriado.setDataCriacao(LocalDateTime.now());

        // Configura o mock para retornar o produto criado
        when(productService.create(any(Product.class))).thenReturn(produtoCriado);

        // Executa a requisição e verifica o resultado
        mockMvc.perform(post("/api/products")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(novoProduto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", is(3)))
                .andExpect(jsonPath("$.nome", is("Teclado Mecânico")))
                .andExpect(jsonPath("$.preco", is(250.00)))
                .andExpect(jsonPath("$.codigoProduto", is("TEC-001")));

        // Verifica se o método do serviço foi chamado
        verify(productService).create(any(Product.class));
    }

    @Test
    void editarProduto_QuandoExiste_DeveAtualizarERetornarProduto() throws Exception {
        // Configura produto atualizado
        Product produtoAtualizado = new Product();
        produtoAtualizado.setNome("Notebook Dell XPS");
        produtoAtualizado.setDescricao("Notebook Dell XPS 13");
        produtoAtualizado.setPreco(new BigDecimal("4500.00"));
        produtoAtualizado.setQuantidadeEmEstoque(5);
        produtoAtualizado.setCodigoProduto("DELL-002");
        produtoAtualizado.setCategoria("Informática Premium");

        // Configura produto após atualização
        Product produtoAposAtualizacao = new Product();
        produtoAposAtualizacao.setId(1L);
        produtoAposAtualizacao.setNome("Notebook Dell XPS");
        produtoAposAtualizacao.setDescricao("Notebook Dell XPS 13");
        produtoAposAtualizacao.setPreco(new BigDecimal("4500.00"));
        produtoAposAtualizacao.setQuantidadeEmEstoque(5);
        produtoAposAtualizacao.setCodigoProduto("DELL-002");
        produtoAposAtualizacao.setCategoria("Informática Premium");
        produtoAposAtualizacao.setDataCriacao(LocalDateTime.now());
        produtoAposAtualizacao.setDataAtualizacao(LocalDateTime.now());

        // Configura o mock para retornar o produto atualizado
        when(productService.update(eq(1L), any(Product.class))).thenReturn(produtoAposAtualizacao);

        // Executa a requisição e verifica o resultado
        mockMvc.perform(put("/api/products/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(produtoAtualizado)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(1)))
                .andExpect(jsonPath("$.nome", is("Notebook Dell XPS")))
                .andExpect(jsonPath("$.preco", is(4500.00)))
                .andExpect(jsonPath("$.codigoProduto", is("DELL-002")));

        // Verifica se o método do serviço foi chamado
        verify(productService).update(eq(1L), any(Product.class));
    }

    @Test
    void editarProduto_QuandoNaoExiste_DeveRetornarNotFound() throws Exception {
        // Configura produto atualizado
        Product produtoAtualizado = new Product();
        produtoAtualizado.setNome("Produto Inexistente");
        produtoAtualizado.setDescricao("Descrição do produto inexistente");
        produtoAtualizado.setPreco(new BigDecimal("100.00"));
        produtoAtualizado.setQuantidadeEmEstoque(1);
        produtoAtualizado.setCodigoProduto("INEX-001");
        produtoAtualizado.setCategoria("Inexistente");

        // Configura o mock para lançar exceção quando o produto não existe
        when(productService.update(eq(999L), any(Product.class))).thenThrow(new ProductNotFoundException(999L));

        // Executa a requisição e verifica o resultado
        mockMvc.perform(put("/api/products/999")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(produtoAtualizado)))
                .andExpect(status().isNotFound());

        // Verifica se o método do serviço foi chamado
        verify(productService).update(eq(999L), any(Product.class));
    }

    @Test
    void deletarProduto_QuandoExiste_DeveRemoverERetornarSucesso() throws Exception {
        // Não precisa configurar mock para este caso, pois o método não retorna nada

        // Executa a requisição e verifica o resultado
        mockMvc.perform(delete("/api/products/1")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().string("Produto deletado com sucesso!"));

        // Verifica se o método do serviço foi chamado
        verify(productService).delete(1L);
    }

    @Test
    void deletarProduto_QuandoNaoExiste_DeveRetornarNotFound() throws Exception {
        // Configura o mock para lançar exceção quando o produto não existe
        doThrow(new ProductNotFoundException(999L)).when(productService).delete(999L);

        // Executa a requisição e verifica o resultado
        mockMvc.perform(delete("/api/products/999")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound())
                .andExpect(content().string("Produto não encontrado."));

        // Verifica se o método do serviço foi chamado
        verify(productService).delete(999L);
    }

    @Test
    void deletarProduto_QuandoErroInterno_DeveRetornarInternalServerError() throws Exception {
        // Configura o mock para lançar uma exceção genérica
        doThrow(new RuntimeException("Erro interno")).when(productService).delete(1L);

        // Executa a requisição e verifica o resultado
        mockMvc.perform(delete("/api/products/1")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isInternalServerError())
                .andExpect(content().string(containsString("Erro ao deletar cliente:")));

        // Verifica se o método do serviço foi chamado
        verify(productService).delete(1L);
    }
}

