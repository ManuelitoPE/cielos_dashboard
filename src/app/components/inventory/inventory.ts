import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../api.service';
import { Product, ProductVariant, InventoryMovement } from '../../models';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inventory.html',
  styleUrl: './inventory.css'
})
export class InventoryComponent implements OnInit {
  products = signal<Product[]>([]);
  selectedProduct = signal<Product | null>(null);
  selectedVariant = signal<ProductVariant | null>(null);
  transactions = signal<InventoryMovement[]>([]);
  loading = signal(true);

  // Form fields
  transactionType: 'IN' | 'OUT' = 'IN';
  quantity: number = 0;
  reason: string = '';

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

  selectProduct(product: Product) {
    this.selectedProduct.set(product);
    this.selectedVariant.set(null);
    this.transactions.set([]);
  }

  selectVariant(variant: ProductVariant) {
    this.selectedVariant.set(variant);
    this.loadTransactions(variant.id);
  }

  loadTransactions(variantId: number) {
    this.apiService.getInventoryHistory(variantId).subscribe({
      next: (transactions) => {
        this.transactions.set(transactions);
      },
      error: (error) => {
        console.error('Error loading transactions:', error);
      }
    });
  }

  submitTransaction() {
    const variant = this.selectedVariant();
    if (!variant || this.quantity <= 0) {
      alert('Por favor selecciona una variante y una cantidad válida');
      return;
    }

    this.apiService.createMovement({
      variant_id: variant.id,
      movement_type: this.transactionType,
      quantity: this.quantity,
      reason: this.reason || 'Sin motivo especificado',
      user_id: '1' // Hardcoded for now, should come from auth service
    }).subscribe({
      next: () => {
        // Reload products to update stock
        this.loadProducts();
        // Reload transactions
        this.loadTransactions(variant.id);

        // Reset form
        this.quantity = 0;
        this.reason = '';
        alert('Movimiento registrado exitosamente');
      },
      error: (error) => {
        console.error('Error creating movement:', error);
        alert('Error al registrar el movimiento');
      }
    });
  }

  // Helper to calculate total stock of a product
  getProductTotalStock(product: Product): number {
    return product.variants?.reduce((acc, v) => acc + v.stock, 0) || 0;
  }
}
