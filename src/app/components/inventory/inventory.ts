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
    this.loadGlobalHistory();
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

  loadGlobalHistory() {
    this.apiService.getAllInventoryHistory().subscribe({
      next: (transactions) => {
        this.transactions.set(transactions);
      },
      error: (error) => {
        console.error('Error loading global history:', error);
      }
    });
  }

  selectProduct(product: Product) {
    this.selectedProduct.set(product);
    this.selectedVariant.set(null);
    // When deselecting variant, show global history or product history?
    // For now, let's show global history again or clear it.
    // User wants "all movements", so let's reload global history.
    this.loadGlobalHistory();
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
    const product = this.selectedProduct();

    if (!variant || !product || this.quantity <= 0) {
      alert('Por favor selecciona una variante y una cantidad válida');
      return;
    }

    // Backend expects snake_case for DTO
    const payload = {
      variant_id: variant.id,
      movement_type: this.transactionType,
      quantity: this.quantity,
      reason: this.reason || 'Sin motivo especificado',
      user_id: '1' // Hardcoded for now
    };

    this.apiService.createMovement(payload).subscribe({
      next: () => {
        // Reload products to update stock
        this.loading.set(true);
        this.apiService.getProducts().subscribe({
          next: (products) => {
            this.products.set(products);
            this.loading.set(false);

            // CRITICAL: Update references to the new objects from the fresh list
            const updatedProduct = products.find(p => p.id === product.id);
            if (updatedProduct) {
              this.selectedProduct.set(updatedProduct);
              const updatedVariant = updatedProduct.variants?.find(v => v.id === variant.id);
              if (updatedVariant) {
                this.selectedVariant.set(updatedVariant);
              }
            }
          },
          error: (err) => {
            console.error('Error reloading products', err);
            this.loading.set(false);
          }
        });

        // Reload transactions
        this.loadTransactions(variant.id);

        // Reset form
        this.quantity = 0;
        this.reason = '';
        alert('Movimiento registrado exitosamente');
      },
      error: (error) => {
        console.error('Error creating movement:', error);
        alert('Error al registrar el movimiento: ' + (error.error?.message || error.message));
      }
    });
  }

  // Helper to calculate total stock of a product
  getProductTotalStock(product: Product): number {
    return product.variants?.reduce((acc, v) => acc + v.stock, 0) || 0;
  }
}
