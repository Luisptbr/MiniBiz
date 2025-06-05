import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss']
})
export class ProductComponent implements OnInit {
  products: any[] = [];
  filteredProducts: any[] = [];
  productForm!: FormGroup;
  isFormVisible = false;
  isEditMode = false;
  currentProductId!: number;

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.productForm = this.fb.group({
      nome: ['', Validators.required],
      descricao: ['', Validators.required],
      preco: ['', Validators.required],
      quantidadeEmEstoque: ['', Validators.required],
      codigoProduto: ['', Validators.required],
      categoria: ['', Validators.required]
    });

    this.loadProducts();
  }

  loadProducts() {
    this.productService.getProducts().subscribe(products => {
      this.products = products;
      this.filteredProducts = products;
    });
  }

  newProduct() {
    this.clearForm();
    this.isFormVisible = true;
  }

  submit() {
    if (this.isEditMode) {
      this.productService.updateProduct(this.currentProductId, this.productForm.value).subscribe(() => {
        this.isEditMode = false;
        this.productForm.reset();
        this.loadProducts();
      });
    } else {
      this.productService.addProduct(this.productForm.value).subscribe(() => {
        this.productForm.reset();
        this.loadProducts();
      });
    }
    this.isFormVisible = false;
  }

  editProduct(product: any) {
    this.isEditMode = true;
    this.currentProductId = product.id;
    this.productForm.patchValue(product);
    this.isFormVisible = true;
  }

  deleteProduct(id: number) {
    this.productService.deleteProduct(id).subscribe(() => {
      this.loadProducts();
    });
  }

  clearForm() {
    this.isEditMode = false;
    this.productForm.reset();
    this.isFormVisible = false;
  }

  applyFilter(event: Event, filterType: string) {
    const filterValue = (event.target as HTMLInputElement).value.toLowerCase();
    this.filteredProducts = this.products.filter(product => {
      return product[filterType].toString().toLowerCase().includes(filterValue);
    });
  }
}
