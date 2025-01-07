package br.com.minibiz.service;

import br.com.minibiz.model.venda.Venda;
import br.com.minibiz.repository.VendaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class VendaService {
	@Autowired
	private VendaRepository vendaRepository;

	public Venda registrarVenda(Venda venda) {
		venda.setVendaDate(LocalDateTime.now());
		venda.setStatus("COMPLETA");
		return vendaRepository.save(venda);
	}

	public Page<Venda> listarVendas(Pageable pageable) {
		return vendaRepository.findAll(pageable);
	}

	public Venda findById(Long id) {
		return vendaRepository.findById(id)
				.orElseThrow(() -> new RuntimeException("Venda com ID " + id + " não encontrada."));
	}

	public Venda cancelarVenda(Long id) {
		Optional<Venda> vendaOptional = vendaRepository.findById(id);
		if (vendaOptional.isPresent()) {
			Venda vendaExistente = vendaOptional.get();
			vendaExistente.setStatus("CANCELADA");
			return vendaRepository.save(vendaExistente);
		} else {
			throw new RuntimeException("Venda com ID " + id + " não encontrada.");
		}
	}
}
