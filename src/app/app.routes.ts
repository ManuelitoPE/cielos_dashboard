import { Routes } from '@angular/router';
import { LayoutComponent } from './components/layout/layout';

export const routes: Routes = [
    {
        path: '',
        component: LayoutComponent,
        children: [
            { path: '', redirectTo: 'products', pathMatch: 'full' },
            { 
                path: 'products', 
                loadComponent: () => import('./components/products/products').then(m => m.ProductsComponent) 
            },
            { 
                path: 'inventory', 
                loadComponent: () => import('./components/inventory/inventory').then(m => m.InventoryComponent) 
            },
            { 
                path: 'stats', 
                loadComponent: () => import('./components/stats/stats').then(m => m.StatsComponent) 
            }
        ]
    }
];
