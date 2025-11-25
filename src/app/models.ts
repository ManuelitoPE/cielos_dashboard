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
    variant_id: number;
    movement_type: 'IN' | 'OUT';
    quantity: number;
    user_id: string;
    reason: string;
    created_at: Date;
    // Expanded info for display
    variant?: ProductVariant & { product?: Product };
    productName?: string;
}

export interface BestSeller {
    product_id: number;
    product_name: string;
    total_sold: number;
    revenue: number;
}

export interface OrderItem {
    id: string;
    product_variant_id: number;
    quantity: number;
    price: number;
    product_name: string;
    variant_sku: string;
}

export interface Order {
    id: string;
    user_id: string;
    total_amount: number;
    status: string;
    items: OrderItem[];
    created_at: Date;
}

export interface CreateOrderDto {
    items: {
        variant_id: number;
        quantity: number;
    }[];
    user_id: string; // For now, passed from frontend or handled by backend auth
}
