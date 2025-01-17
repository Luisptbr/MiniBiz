package br.com.minibiz.service;

import br.com.minibiz.dto.DetalheVendaDTO;
import br.com.minibiz.dto.ItemVendaDTO;
import br.com.minibiz.dto.ProductDTO;
import br.com.minibiz.dto.VendaDTO;
import br.com.minibiz.dto.VendaRelatorioFinanceiroResponse;
import br.com.minibiz.dto.VendaRequest;
import br.com.minibiz.dto.VendaResponse;
import br.com.minibiz.model.venda.ItemVenda;
import br.com.minibiz.model.venda.StatusVenda;
import br.com.minibiz.model.venda.Venda;
import br.com.minibiz.model.client.Client;
import br.com.minibiz.model.product.Product;
import br.com.minibiz.repository.VendaRepository;
import br.com.minibiz.repository.ClientRepository;
import br.com.minibiz.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class VendaService {

	@Autowired
	private VendaRepository vendaRepository;

	@Autowired
	private ClientRepository clientRepository;

	@Autowired
	private ProductRepository productRepository;

	@Transactional
	public Venda registrarVenda(Long clientId, List<VendaDTO> produtosDTO) {
		Client client = clientRepository.findById(clientId)
				.orElseThrow(() -> new IllegalArgumentException("Cliente não encontrado"));

		Venda venda = new Venda();
		venda.setClient(client);
		venda.setVendaDate(LocalDateTime.now());
		venda.setStatus(StatusVenda.AGUARDANDO);

		List<ItemVenda> items = produtosDTO.stream().map(produtoDTO -> {
			Product product = productRepository.findById(produtoDTO.getProductId())
					.orElseThrow(() -> new IllegalArgumentException("Produto não encontrado"));

			int novaQuantidade = product.getQuantidadeEmEstoque() - produtoDTO.getQuantidade();
			if (novaQuantidade < 0) {
				throw new IllegalArgumentException("Estoque insuficiente para o produto: " + product.getNome());
			}
			product.setQuantidadeEmEstoque(novaQuantidade);
			productRepository.save(product);

			ItemVenda item = new ItemVenda();
			item.setProduct(product);
			item.setQuantidade(produtoDTO.getQuantidade());
			item.setVenda(venda);

			return item;
		}).collect(Collectors.toList());

		venda.setItems(items);
		venda.setValorTotal(calcularTotal(items));

		return vendaRepository.save(venda);
	}

	@Transactional(readOnly = true)
	public Page<VendaResponse> findAll(Pageable pageable) {
		return vendaRepository.findAll(pageable).map(this::convertToVendaResponse);
	}

	@Transactional(readOnly = true)
	public VendaResponse findById(Long id) {
		Venda venda = vendaRepository.findById(id)
				.orElseThrow(() -> new RuntimeException("Venda com ID " + id + " não encontrada."));
		return convertToVendaResponse(venda);
	}

	private VendaResponse convertToVendaResponse(Venda venda) {
		VendaResponse response = new VendaResponse();
		response.setId(venda.getId());
		response.setClientId(venda.getClient().getId());
		response.setValorTotal(venda.getValorTotal());
		response.setVendaDate(venda.getVendaDate());
		response.setStatus(venda.getStatus());

		List<ProductDTO> productDTOs = venda.getItems().stream().map(item -> {
			ProductDTO dto = new ProductDTO();
			dto.setId(item.getProduct().getId());
			dto.setNome(item.getProduct().getNome());
			dto.setPreco(item.getProduct().getPreco());
			dto.setQuantidade(item.getQuantidade());
			return dto;
		}).collect(Collectors.toList());

		response.setProducts(productDTOs);

		return response;
	}

	@Transactional
	public Venda cancelar(Long id) {
		Venda vendaExistente = vendaRepository.findById(id)
				.orElseThrow(() -> new RuntimeException("Venda com ID " + id + " não encontrada."));

		if (StatusVenda.CANCELADA.equals(vendaExistente.getStatus())) {
			throw new IllegalArgumentException("Esta venda já foi cancelada.");
		}

		vendaExistente.getItems().forEach(item -> {
			Product product = item.getProduct();
			product.setQuantidadeEmEstoque(product.getQuantidadeEmEstoque() + item.getQuantidade());
			productRepository.save(product);
		});

		vendaExistente.setStatus(StatusVenda.CANCELADA);
		return vendaRepository.save(vendaExistente);
	}

	@Transactional
	public Venda update(Long id, VendaRequest vendaRequest) {
		Venda vendaExistente = vendaRepository.findById(id)
				.orElseThrow(() -> new RuntimeException("Venda com ID " + id + " não encontrada."));

		Client client = clientRepository.findById(vendaRequest.getClientId())
				.orElseThrow(() -> new IllegalArgumentException("Cliente não encontrado"));
		vendaExistente.setClient(client);

		List<ItemVenda> itemsAtualizados = vendaRequest.getProdutosDTO().stream().map(produtoDTO -> {
			Product product = productRepository.findById(produtoDTO.getProductId())
					.orElseThrow(() -> new IllegalArgumentException("Produto não encontrado"));

			int novaQuantidade = product.getQuantidadeEmEstoque() - produtoDTO.getQuantidade();
			if (novaQuantidade < 0) {
				throw new IllegalArgumentException("Estoque insuficiente para o produto: " + product.getNome());
			}
			product.setQuantidadeEmEstoque(novaQuantidade);
			productRepository.save(product);

			ItemVenda item = new ItemVenda();
			item.setProduct(product);
			item.setQuantidade(produtoDTO.getQuantidade());
			item.setVenda(vendaExistente);

			return item;
		}).collect(Collectors.toList());

		vendaExistente.setItems(itemsAtualizados);
		vendaExistente.setValorTotal(calcularTotal(itemsAtualizados));
		vendaExistente.setVendaDate(LocalDateTime.now());

		return vendaRepository.save(vendaExistente);
	}

	private BigDecimal calcularTotal(List<ItemVenda> items) {
		return items.stream()
				.map(item -> item.getProduct().getPreco().multiply(BigDecimal.valueOf(item.getQuantidade())))
				.reduce(BigDecimal.ZERO, BigDecimal::add);
	}

	public List<DetalheVendaDTO> getSalesReport(LocalDateTime startDate, LocalDateTime endDate, Long clientId, String clientName) {
	    List<Venda> vendas;
	    if (clientId != null) {
	        vendas = vendaRepository.findAllByClientIdAndVendaDateBetween(clientId, startDate, endDate);
	    } else if (clientName != null) {
	        vendas = vendaRepository.findAllByClientNameAndVendaDateBetween(clientName, startDate, endDate);
	    } else {
	        vendas = vendaRepository.findAllByVendaDateBetween(startDate, endDate);
	    }

	    return vendas.stream().map(venda -> {
	        DetalheVendaDTO dto = new DetalheVendaDTO();
	        dto.setVendaDate(venda.getVendaDate());
	        dto.setClientName(venda.getClient().getNome());
	        dto.setStatus(venda.getStatus().toString());
	        dto.setValorTotal(venda.getValorTotal());

	        List<ItemVendaDTO> itemDTOs = venda.getItems().stream().map(item -> {
	            ItemVendaDTO itemDTO = new ItemVendaDTO();
	            itemDTO.setProductName(item.getProduct().getNome());
	            itemDTO.setQuantity(item.getQuantidade());
	            return itemDTO;
	        }).collect(Collectors.toList());

	        dto.setItems(itemDTOs);
	        return dto;
	    }).collect(Collectors.toList());
	}


	public VendaRelatorioFinanceiroResponse getFinancialReport(LocalDateTime startDate, LocalDateTime endDate) {
		List<Venda> vendas = vendaRepository.findAllByVendaDateBetween(startDate, endDate);

		BigDecimal receitaTotal = vendas.stream().map(Venda::getValorTotal).reduce(BigDecimal.ZERO, BigDecimal::add);

		BigDecimal despesasTotais = calculateTotalExpenses(vendas);

		VendaRelatorioFinanceiroResponse response = new VendaRelatorioFinanceiroResponse();
		response.setReceitaTotal(receitaTotal);
		response.setDespesasTotais(despesasTotais);
		response.setLucroLiquido(receitaTotal.subtract(despesasTotais));

		return response;
	}

	private BigDecimal calculateTotalExpenses(List<Venda> vendas) {
		return BigDecimal.ZERO; // Implementar a lógica para calcular as despesas aqui
	}
}
