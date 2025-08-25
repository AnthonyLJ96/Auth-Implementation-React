import { authApiClient } from '../clients/AuthApiClient';

/**
 * Product Service - Example of how to add new services
 * 
 * This is an example file showing how you can extend the architecture
 * for other entities like products, categories, orders, etc.
 */

// Types for products (you can add these to a separate types file)
export interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    category_id: number;
    is_active: boolean;
    image_url?: string;
    created_at: string;
    updated_at: string;
}

export interface CreateProductData {
    name: string;
    description: string;
    price: number;
    category_id: number;
    is_active?: boolean;
    image_url?: string;
}

export interface UpdateProductData extends Partial<CreateProductData> {
    id?: never; // Prevent updating ID
}

export interface ProductsResponse {
    products: Product[];
    total: number;
    page: number;
    total_pages: number;
}

export interface ProductFilters {
    page?: number;
    limit?: number;
    search?: string;
    category_id?: number;
    is_active?: boolean;
    price_min?: number;
    price_max?: number;
}

export class ProductService {
    /**
     * Get all products with optional filters
     */
    async getProducts(filters?: ProductFilters): Promise<ProductsResponse> {
        const params = new URLSearchParams();
        
        if (filters?.page) params.append('page', filters.page.toString());
        if (filters?.limit) params.append('limit', filters.limit.toString());
        if (filters?.search) params.append('search', filters.search);
        if (filters?.category_id) params.append('category_id', filters.category_id.toString());
        if (filters?.is_active !== undefined) params.append('is_active', filters.is_active.toString());
        if (filters?.price_min) params.append('price_min', filters.price_min.toString());
        if (filters?.price_max) params.append('price_max', filters.price_max.toString());

        const queryString = params.toString();
        const endpoint = queryString ? `/products?${queryString}` : '/products';
        
        return await authApiClient.get<ProductsResponse>(endpoint);
    }

    /**
     * Get product by ID
     */
    async getProductById(productId: number): Promise<Product> {
        return await authApiClient.get<Product>(`/products/${productId}`);
    }

    /**
     * Create new product
     */
    async createProduct(productData: CreateProductData): Promise<Product> {
        return await authApiClient.post<Product>('/products', productData);
    }

    /**
     * Update existing product
     */
    async updateProduct(productId: number, productData: UpdateProductData): Promise<Product> {
        return await authApiClient.put<Product>(`/products/${productId}`, productData);
    }

    /**
     * Delete product
     */
    async deleteProduct(productId: number): Promise<{ message: string }> {
        return await authApiClient.delete(`/products/${productId}`);
    }

    /**
     * Toggle product active status
     */
    async toggleProductStatus(productId: number, isActive: boolean): Promise<Product> {
        return await authApiClient.patch<Product>(`/products/${productId}/status`, {
            is_active: isActive
        });
    }

    /**
     * Upload product image
     */
    async uploadProductImage(productId: number, imageFile: File): Promise<{ image_url: string }> {
        const formData = new FormData();
        formData.append('image', imageFile);

        return await authApiClient.request<{ image_url: string }>(`/products/${productId}/image`, {
            method: 'POST',
            body: formData,
            headers: {
                // Don't set Content-Type for FormData - browser will set it with boundary
            }
        });
    }

    /**
     * Get products by category
     */
    async getProductsByCategory(categoryId: number, filters?: Omit<ProductFilters, 'category_id'>): Promise<ProductsResponse> {
        return this.getProducts({ ...filters, category_id: categoryId });
    }

    /**
     * Search products
     */
    async searchProducts(searchTerm: string, filters?: Omit<ProductFilters, 'search'>): Promise<ProductsResponse> {
        return this.getProducts({ ...filters, search: searchTerm });
    }

    /**
     * Get featured/popular products
     */
    async getFeaturedProducts(): Promise<Product[]> {
        return await authApiClient.get<Product[]>('/products/featured');
    }

    /**
     * Bulk update products
     */
    async bulkUpdateProducts(updates: Array<{ id: number; data: UpdateProductData }>): Promise<Product[]> {
        return await authApiClient.post<Product[]>('/products/bulk-update', { updates });
    }
}

// Export singleton instance
export const productService = new ProductService();

/**
 * Usage Examples:
 * 
 * // Get all products
 * const products = await productService.getProducts();
 * 
 * // Get products with filters
 * const filteredProducts = await productService.getProducts({
 *     page: 1,
 *     limit: 10,
 *     search: 'pizza',
 *     is_active: true,
 *     price_min: 10,
 *     price_max: 50
 * });
 * 
 * // Create new product
 * const newProduct = await productService.createProduct({
 *     name: 'Margherita Pizza',
 *     description: 'Classic Italian pizza with tomato and mozzarella',
 *     price: 15.99,
 *     category_id: 1,
 *     is_active: true
 * });
 * 
 * // Update product
 * const updatedProduct = await productService.updateProduct(1, {
 *     price: 17.99,
 *     is_active: false
 * });
 * 
 * // Error handling is automatic
 * try {
 *     const product = await productService.getProductById(999);
 * } catch (error) {
 *     console.error('Product not found:', error.message);
 * }
 */
