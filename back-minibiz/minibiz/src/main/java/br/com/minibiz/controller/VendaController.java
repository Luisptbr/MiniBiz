package br.com.minibiz.controller;

import br.com.minibiz.model.venda.Venda;
import br.com.minibiz.service.VendaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/vendas")
public class VendaController {
	@Autowired
	private VendaService vendaService;

	@PostMapping
	public ResponseEntity<Venda> registrarVenda(@RequestBody Venda venda) {
		Venda novaVenda = vendaService.registrarVenda(venda);
		return ResponseEntity.status(HttpStatus.CREATED).body(novaVenda);
	}

	@GetMapping
	public ResponseEntity<Page<Venda>> listarVendas(Pageable pageable) {
		Page<Venda> vendas = vendaService.listarVendas(pageable);
		return ResponseEntity.ok(vendas);
	}

	@GetMapping("/{id}")
	public ResponseEntity<Venda> findById(@PathVariable Long id) {
		Venda venda = vendaService.findById(id);
		return ResponseEntity.ok(venda);
	}

	@PutMapping("/cancelar/{id}")
	public ResponseEntity<Venda> cancelarVenda(@PathVariable Long id) {
		Venda vendaCancelada = vendaService.cancelarVenda(id);
		return ResponseEntity.ok(vendaCancelada);
	}
}
