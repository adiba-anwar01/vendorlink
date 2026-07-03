package com.arif.vl.domain.repository

import com.arif.vl.data.model.CreateProductRequest
import com.arif.vl.data.model.CreateProductResponse
import com.arif.vl.data.model.Product
import com.arif.vl.data.model.ProductDetailResponse
import com.arif.vl.data.model.ProductListResponse
import com.arif.vl.data.model.UpdateProductRequest

/**
 * Contract for product-related data operations.
 */
interface ProductRepository {
    suspend fun getProducts(
        page: Int? = null,
        limit: Int? = null,
        category: String? = null,
        query: String? = null,
        sellerRole: String? = null
    ): Result<ProductListResponse>

    suspend fun getProductDetails(productId: String): Result<ProductDetailResponse>

    suspend fun searchNearby(
        lat: Double,
        lng: Double,
        radiusMeters: Int = 5000,
        query: String? = null,
        page: Int = 1,
        limit: Int = 20
    ): Result<List<Product>>

    suspend fun addProduct(request: CreateProductRequest): Result<CreateProductResponse>

    suspend fun updateProduct(
        productId: String,
        request: UpdateProductRequest
    ): Result<ProductDetailResponse>

    suspend fun deleteProduct(productId: String): Result<Unit>
}
