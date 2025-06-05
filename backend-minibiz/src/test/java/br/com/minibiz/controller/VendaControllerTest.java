package br.com.minibiz.controller;

import br.com.minibiz.dto.*;
import br.com.minibiz.model.venda.StatusVenda;
import br.com.minibiz.model.venda.Venda;
import br.com.minibiz.service.VendaService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(VendaController.class)
public class VendaControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private VendaService vendaService;

    private ObjectMapper objectMapper;
    private Venda venda;
    private VendaResponse vendaResponse;
    private VendaRequest vendaRequest;
    private List<VendaDTO> produtosDTO;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());

        // Set up test data
        venda = new Venda();
        venda.setId(1L);
        venda.setValorTotal(BigDecimal.valueOf(199.99));
        venda.setVendaDate(LocalDateTime.now());
        venda.setStatus(StatusVenda.AGUARDANDO);

        // Create product DTOs for the response
        List<ProductDTO> productDTOs = new ArrayList<>();
        ProductDTO productDTO = new ProductDTO();
        productDTO.setId(1L);
        productDTO.setNome("Produto Teste");
        productDTO.setPreco(BigDecimal.valueOf(99.99));
        productDTO.setQuantidade(2);
        productDTOs.add(productDTO);

        // Set up VendaResponse
        vendaResponse = new VendaResponse();
        vendaResponse.setId(1L);
        vendaResponse.setClientId(1L);
        vendaResponse.setProducts(productDTOs);
        vendaResponse.setValorTotal(BigDecimal.valueOf(199.99));
        vendaResponse.setVendaDate(LocalDateTime.now());
        vendaResponse.setStatus(StatusVenda.AGUARDANDO);

        // Set up VendaDTO for request
        produtosDTO = new ArrayList<>();
        VendaDTO vendaDTO = new VendaDTO();
        vendaDTO.setProductId(1L);
        vendaDTO.setQuantidade(2);
        produtosDTO.add(vendaDTO);

        // Set up VendaRequest
        vendaRequest = new VendaRequest();
        vendaRequest.setClientId(1L);
        vendaRequest.setProdutosDTO(produtosDTO);
    }

    @Test
    void criarVenda_Success() throws Exception {
        when(vendaService.registrarVenda(anyLong(), anyList())).thenReturn(venda);

        mockMvc.perform(post("/api/vendas")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(vendaRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", is(1)))
                .andExpect(jsonPath("$.status", is(StatusVenda.AGUARDANDO.toString())));

        verify(vendaService, times(1)).registrarVenda(eq(1L), anyList());
    }

    @Test
    void listarVendas_Success() throws Exception {
        List<VendaResponse> vendaList = Arrays.asList(vendaResponse);
        Page<VendaResponse> vendaPage = new PageImpl<>(vendaList);

        when(vendaService.findAll(any(Pageable.class))).thenReturn(vendaPage);

        mockMvc.perform(get("/api/vendas"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)))
                .andExpect(jsonPath("$.content[0].id", is(1)))
                .andExpect(jsonPath("$.content[0].clientId", is(1)))
                .andExpect(jsonPath("$.content[0].valorTotal", is(199.99)));

        verify(vendaService, times(1)).findAll(any(Pageable.class));
    }

    @Test
    void listarVenda_Success() throws Exception {
        when(vendaService.findById(1L)).thenReturn(vendaResponse);

        mockMvc.perform(get("/api/vendas/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(1)))
                .andExpect(jsonPath("$.clientId", is(1)))
                .andExpect(jsonPath("$.valorTotal", is(199.99)));

        verify(vendaService, times(1)).findById(1L);
    }

    @Test
    void listarVenda_NotFound() throws Exception {
        when(vendaService.findById(999L)).thenThrow(new RuntimeException("Venda com ID 999 não encontrada."));

        mockMvc.perform(get("/api/vendas/999"))
                .andExpect(status().isInternalServerError());

        verify(vendaService, times(1)).findById(999L);
    }

    @Test
    void cancelarVenda_Success() throws Exception {
        venda.setStatus(StatusVenda.CANCELADA);
        when(vendaService.cancelar(1L)).thenReturn(venda);

        mockMvc.perform(put("/api/vendas/cancelar/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(1)))
                .andExpect(jsonPath("$.status", is(StatusVenda.CANCELADA.toString())));

        verify(vendaService, times(1)).cancelar(1L);
    }

    @Test
    void cancelarVenda_AlreadyCancelled() throws Exception {
        when(vendaService.cancelar(1L)).thenThrow(new IllegalArgumentException("Esta venda já foi cancelada."));

        mockMvc.perform(put("/api/vendas/cancelar/1"))
                .andExpect(status().isBadRequest());

        verify(vendaService, times(1)).cancelar(1L);
    }

    @Test
    void editarVenda_Success() throws Exception {
        when(vendaService.update(eq(1L), any(VendaRequest.class))).thenReturn(venda);

        mockMvc.perform(put("/api/vendas/editar/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(vendaRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(1)));

        verify(vendaService, times(1)).update(eq(1L), any(VendaRequest.class));
    }

    @Test
    void getSalesReport_Success() throws Exception {
        List<DetalheVendaDTO> reportList = new ArrayList<>();
        DetalheVendaDTO reportItem = new DetalheVendaDTO();
        reportItem.setClientName("Cliente Teste");
        reportItem.setVendaDate(LocalDateTime.now());
        reportItem.setStatus(StatusVenda.CONCLUIDA.toString());
        reportItem.setValorTotal(BigDecimal.valueOf(199.99));
        
        List<ItemVendaDTO> items = new ArrayList<>();
        ItemVendaDTO item = new ItemVendaDTO();
        item.setProductName("Produto Teste");
        item.setQuantity(2);
        items.add(item);
        
        reportItem.setItems(items);
        reportList.add(reportItem);

        VendaRelatorioRequest request = new VendaRelatorioRequest();
        request.setDataInicio(LocalDateTime.now().minusDays(30));
        request.setDataFim(LocalDateTime.now());
        request.setClientId(1L);

        when(vendaService.getSalesReport(any(LocalDateTime.class), any(LocalDateTime.class), 
                eq(1L), isNull())).thenReturn(reportList);

        mockMvc.perform(post("/api/vendas/relatorio")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].clientName", is("Cliente Teste")))
                .andExpect(jsonPath("$[0].status", is(StatusVenda.CONCLUIDA.toString())))
                .andExpect(jsonPath("$[0].valorTotal", is(199.99)))
                .andExpect(jsonPath("$[0].items", hasSize(1)))
                .andExpect(jsonPath("$[0].items[0].productName", is("Produto Teste")))
                .andExpect(jsonPath("$[0].items[0].quantity", is(2)));

        verify(vendaService, times(1)).getSalesReport(any(LocalDateTime.class), 
                any(LocalDateTime.class), eq(1L), isNull());
    }

    @Test
    void getFinancialReport_Success() throws Exception {
        VendaRelatorioFinanceiroResponse financialReport = new VendaRelatorioFinanceiroResponse();
        financialReport.setReceitaTotal(BigDecimal.valueOf(1000.00));
        financialReport.setDespesasTotais(BigDecimal.valueOf(500.00));
        financialReport.setLucroLiquido(BigDecimal.valueOf(500.00));

        VendaRelatorioRequest request = new VendaRelatorioRequest();
        request.setDataInicio(LocalDateTime.now().minusDays(30));
        request.setDataFim(LocalDateTime.now());

        when(vendaService.getFinancialReport(any(LocalDateTime.class), 
                any(LocalDateTime.class))).thenReturn(financialReport);

        mockMvc.perform(post("/api/vendas/relatorio-financeiro")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.receitaTotal", is(1000.00)))
                .andExpect(jsonPath("$.despesasTotais", is(500.00)))
                .andExpect(jsonPath("$.lucroLiquido", is(500.00)));

        verify(vendaService, times(1)).getFinancialReport(any(LocalDateTime.class), 
                any(LocalDateTime.class));
    }
}

