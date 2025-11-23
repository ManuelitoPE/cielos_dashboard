import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../api.service';
import { Product, ProductVariant } from '../../models';

@Component({
  selector: 'app-products',
  imports: [CommonModule, FormsModule],
  templateUrl: './products.html',
  styleUrl: './products.css'
})
export class ProductsComponent implements OnInit {
  products = signal<Product[]>([]);
  loading = signal(true);
  showAddForm = signal(false);

  // New product form
  newProduct: {
    name: string;
    description: string;
    price: number;
    imageUrl: string;
    initialStock: number; // Used to set stock for all generated variants
  } = {
      name: '',
      description: '',
      price: 0,
      imageUrl: '',
      initialStock: 0
    };

  // Helper for comma-separated inputs
  sizesInput = '';
  colorsInput = '';

  constructor(private apiService: ApiService) { }

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.loading.set(true);
    this.apiService.getProducts().subscribe({
      next: (products) => {
        this.products.set(products);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.loading.set(false);
      }
    });
  }

  toggleAddForm() {
    this.showAddForm.update(v => !v);
  }

  addProduct() {
    if (!this.newProduct.name || !this.newProduct.price) {
      alert('Por favor completa los campos obligatorios (Nombre y Precio)');
      return;
    }

    const sizes = this.sizesInput.split(',').map(s => s.trim()).filter(s => s);
    const colors = this.colorsInput.split(',').map(c => c.trim()).filter(c => c);

    if (sizes.length === 0 || colors.length === 0) {
      alert('Debes especificar al menos una talla y un color');
      return;
    }

    // Generate variants
    const variants: Omit<ProductVariant, 'id' | 'product_id'>[] = [];
    sizes.forEach(size => {
      colors.forEach(color => {
        variants.push({
          size,
          color,
          sku: `${this.newProduct.name.substring(0, 3).toUpperCase()}-${size}-${color.substring(0, 3).toUpperCase()}`,
          stock: this.newProduct.initialStock
        });
      });
    });

    const productData = {
      name: this.newProduct.name,
      description: this.newProduct.description,
      price: this.newProduct.price,
      imageUrl: this.newProduct.imageUrl,
      variants: variants
    };

    this.apiService.addProduct(productData).subscribe({
      next: (product) => {
        this.products.update(products => [...products, product]);
        this.showAddForm.set(false);
        this.resetForm();
        alert('Producto agregado exitosamente');
      },
      error: (error) => {
        console.error('Error adding product:', error);
        alert('Error al agregar el producto');
      }
    });
  }

  resetForm() {
    this.newProduct = {
      name: '',
      description: '',
      price: 0,
      imageUrl: '',
      initialStock: 0
    };
    this.sizesInput = '';
    this.colorsInput = '';
  }

  // Helpers for template
  getTotalStock(product: Product): number {
    return product.variants?.reduce((acc, v) => acc + v.stock, 0) || 0;
  }

  getUniqueSizes(product: Product): string {
    const sizes = new Set(product.variants?.map(v => v.size));
    return Array.from(sizes).join(', ');
  }

  getUniqueColors(product: Product): string {
    const colors = new Set(product.variants?.map(v => v.color));
    return Array.from(colors).join(', ');
  }
}
