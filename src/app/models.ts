export interface User {
    id: string;
    name: string;
    email: string;
    role: string;
}

export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    images: string[];
    created_at: Date;
    // Frontend helper: variants are usually fetched with the product
    variants?: ProductVariant[];
}

export interface ProductVariant {
    id: number;
    product_id: string;
    color: string;
    size: string;
    sku: string;
    stock: number;
}

export interface InventoryMovement {
    id: number;
    variantId: number;
    type: 'IN' | 'OUT';
    quantity: number;
    userId: string;
    reason: string;
    createdAt: Date;
    invoiceId?: string;
    // Expanded info for display
    variant?: ProductVariant;
    productName?: string;
}

export interface OrderItem {
    id: number;
    variant_id: number;
    quantity: number;
    price: number;
    variant?: ProductVariant;
}

export interface Order {
    id: string;
    customer_id: string;
    status: 'PENDING' | 'PAID' | 'SHIPPED' | 'CANCELLED';
    created_at: Date;
    items: OrderItem[];
    total?: number; // Helper for display
}

export interface CreateOrderDto {
    customerId: string;
    items: { variantId: number; quantity: number }[];
}

export interface BestSeller {
    product_id: number;
    product_name: string;
    total_sold: number;
    revenue: number;
}
