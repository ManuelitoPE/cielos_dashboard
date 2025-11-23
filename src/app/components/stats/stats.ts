import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../api.service';
import { BestSeller } from '../../models';

@Component({
  selector: 'app-stats',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stats.html',
  styleUrl: './stats.css'
})
export class StatsComponent implements OnInit {
  bestSellers = signal<BestSeller[]>([]);
  loading = signal(true);

  maxQuantity = computed(() => {
    const sellers = this.bestSellers();
    if (sellers.length === 0) return 0;
    return Math.max(...sellers.map(item => item.total_sold));
  });

  totalSales = computed(() => {
    return this.bestSellers().reduce((sum, item) => sum + item.total_sold, 0);
  });

  constructor(private apiService: ApiService) { }

  ngOnInit() {
    this.loadBestSellers();
  }

  loadBestSellers() {
    this.loading.set(true);
    this.apiService.getBestSellers().subscribe({
      next: (data) => {
        this.bestSellers.set(data);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading best sellers:', error);
        this.loading.set(false);
      }
    });
  }

  getBarWidth(quantity: number): number {
    const max = this.maxQuantity();
    return max > 0 ? (quantity / max) * 100 : 0;
  }
}
