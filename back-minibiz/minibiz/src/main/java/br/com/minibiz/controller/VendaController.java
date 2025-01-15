package br.com.minibiz.controller;

import br.com.minibiz.dto.VendaRequest;
import br.com.minibiz.dto.VendaResponse;
import br.com.minibiz.model.venda.Venda;
import br.com.minibiz.service.VendaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/vendas")
public class VendaController {
    @Autowired
    private VendaService vendaService;

    @PostMapping
    public ResponseEntity<Venda> criarVenda(@RequestBody VendaRequest vendaRequest) {
        Venda novaVenda = vendaService.registrarVenda(vendaRequest.getClientId(), vendaRequest.getProdutosDTO());
        return ResponseEntity.status(HttpStatus.CREATED).body(novaVenda);
    }

    @GetMapping
    public ResponseEntity<Page<VendaResponse>> listarVendas(Pageable pageable) {
        Page<VendaResponse> vendas = vendaService.findAll(pageable);
        return ResponseEntity.ok(vendas);
    }

    @GetMapping("/{id}")
    public ResponseEntity<VendaResponse> listarVenda(@PathVariable Long id) {
        VendaResponse venda = vendaService.findById(id);
        return ResponseEntity.ok(venda);
    }

    @PutMapping("/cancelar/{id}")
    public ResponseEntity<Venda> cancelarVenda(@PathVariable Long id) {
        Venda vendaCancelada = vendaService.cancelar(id);
        return ResponseEntity.ok(vendaCancelada);
    }

    @PutMapping("/editar/{id}")
    public ResponseEntity<Venda> editarVenda(@PathVariable Long id, @RequestBody VendaRequest vendaRequest) {
        Venda vendaEditada = vendaService.update(id, vendaRequest);
        return ResponseEntity.ok(vendaEditada);
    }
}
