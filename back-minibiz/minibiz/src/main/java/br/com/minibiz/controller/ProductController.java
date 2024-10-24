package br.com.minibiz.controller;

import br.com.minibiz.model.ApiResponse;
import br.com.minibiz.model.products.Products;
import br.com.minibiz.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
@RestController
@RequestMapping("/products")
public class ProductController {
	
	@Autowired
	private ProductService productService;
	
	@GetMapping
	public ResponseEntity<List<Products>> getAllProducts() {
	    List<Products> products = productService.getAllProducts();
	    return ResponseEntity.ok(products);
	}
	
	@GetMapping("/{id}")
	public ResponseEntity<?> getProductById(@PathVariable Long id) {
	    Products product = productService.getProductById(id);
	    return ResponseEntity.ok(product);
	}
	
	@PostMapping
	public ResponseEntity<ApiResponse> createProduct(@RequestBody Products product) {
	    productService.createProduct(product);
	    return ResponseEntity.status(HttpStatus.CREATED).body(new ApiResponse("Produto criado com sucesso", true));
	}
	
	@PutMapping("/{id}")
	public ResponseEntity<ApiResponse> updateProduct(@PathVariable Long id, @RequestBody Products productDetails) {
	    productService.updateProduct(id, productDetails);
	    return ResponseEntity.ok(new ApiResponse("Produto atualizado com sucesso", true));
	}

	
	@DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse> deleteProduct(@PathVariable Long id){
        try {
            productService.deleteProduct(id);
            return ResponseEntity.ok(new ApiResponse("Produto excluído com sucesso", true));
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(new ApiResponse("Produto não encontrado", false));
        }
    }
}
