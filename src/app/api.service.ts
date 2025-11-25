import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product, ProductVariant, InventoryMovement, BestSeller, Order, CreateOrderDto } from './models';

@Injectable({
    providedIn: 'root'
})
export class ApiService {
    private baseUrl = 'https://cielos-back.onrender.com';

    constructor(private http: HttpClient) { }

    // Product endpoints
    getProducts(): Observable<Product[]> {
        return this.http.get<Product[]>(`${this.baseUrl}/products`);
    }

    getProduct(id: string): Observable<Product> {
        return this.http.get<Product>(`${this.baseUrl}/products/${id}`);
    }

    addProduct(data: any): Observable<Product> {
        return this.http.post<Product>(`${this.baseUrl}/products`, data);
    }

    getUploadUrl(filename: string, contentType: string): Observable<{ uploadUrl: string; publicUrl: string }> {
        return this.http.get<{ uploadUrl: string; publicUrl: string }>(`${this.baseUrl}/products/upload-url`, {
            params: { filename, contentType }
        });
    }

    uploadToSignedUrl(url: string, file: File): Observable<any> {
        return this.http.put(url, file, {
            headers: { 'Content-Type': file.type }
        });
    }

    // Inventory endpoints
    createMovement(movement: { variant_id: number; movement_type: 'IN' | 'OUT'; quantity: number; reason: string; user_id: string }): Observable<InventoryMovement> {
        return this.http.post<InventoryMovement>(`${this.baseUrl}/inventory/movement`, movement);
    }

    getInventoryHistory(variantId: number): Observable<InventoryMovement[]> {
        return this.http.get<InventoryMovement[]>(`${this.baseUrl}/inventory/history/${variantId}`);
    }

    getAllInventoryHistory(): Observable<InventoryMovement[]> {
        return this.http.get<InventoryMovement[]>(`${this.baseUrl}/inventory/history`);
    }

    // Order endpoints
    createOrder(order: CreateOrderDto): Observable<Order> {
        return this.http.post<Order>(`${this.baseUrl}/orders`, order);
    }

    getOrders(): Observable<Order[]> {
        return this.http.get<Order[]>(`${this.baseUrl}/orders`);
    }

    // Stats endpoints
    getBestSellers(): Observable<BestSeller[]> {
        return this.http.get<BestSeller[]>(`${this.baseUrl}/stats/best-sellers`);
    }
}
