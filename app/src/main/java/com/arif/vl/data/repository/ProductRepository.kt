package com.arif.vl.data.repository

import com.arif.vl.data.model.CreateProductRequest
import com.arif.vl.data.model.CreateProductResponse
import com.arif.vl.data.model.Product
import com.arif.vl.data.model.ProductDetailResponse
import com.arif.vl.data.model.ProductListResponse
import com.arif.vl.data.model.UpdateProductRequest
import com.arif.vl.data.remote.ApiService
import com.arif.vl.domain.repository.ProductRepository
import timber.log.Timber
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Implementation of [ProductRepository].
 * All calls aligned with the real backend endpoints.
 */
@Singleton
class ProductRepositoryImpl @Inject constructor(
    private val apiService: ApiService
) : ProductRepository {

    /**
     * Fetch paginated products, optionally filtered by category, query, sellerRole, etc.
     */
    override suspend fun getProducts(
        page: Int?,
        limit: Int?,
        category: String?,
        query: String?,
        sellerRole: String?
    ): Result<ProductListResponse> = runCatching {
        Timber.d("Fetching products: page=%d, limit=%d, category=%s, sellerRole=%s", page, limit, category, sellerRole)
        apiService.getProducts(
            page = page,
            limit = limit,
            category = category,
            query = query,
            sellerRole = sellerRole
        )
    }

    /**
     * Fetch a single product by productId.
     */
    override suspend fun getProductDetails(productId: String): Result<ProductDetailResponse> = runCatching {
        Timber.d("Fetching product details for: %s", productId)
        apiService.getProductById(productId)
    }

    /**
     * Search for nearby products using the backend's $geoNear pipeline.
     *
     * @param lat           User's latitude
     * @param lng           User's longitude
     * @param radiusMeters  Search radius in meters (e.g. 5000 = 5 km)
     * @param query         Optional title search string
     * @param page          Page number (default 1)
     * @param limit         Results per page (default 20)
     */
    override suspend fun searchNearby(
        lat: Double,
        lng: Double,
        radiusMeters: Int,
        query: String?,
        page: Int,
        limit: Int
    ): Result<List<Product>> = runCatching {
        Timber.d("Searching nearby products: lat=%f, lng=%f, radiusMeters=%d", lat, lng, radiusMeters)
        apiService.getNearbyProducts(
            lat = lat,
            lng = lng,
            radiusMeters = radiusMeters,
            page = page,
            limit = limit,
            query = query
        )
    }

    /**
     * Submit a new product listing.
     */
    override suspend fun addProduct(request: CreateProductRequest): Result<CreateProductResponse> = runCatching {
        Timber.d("Adding product: %s", request.title)
        apiService.addProduct(request)
    }

    /**
     * Update an existing product listing.
     */
    override suspend fun updateProduct(
        productId: String,
        request: UpdateProductRequest
    ): Result<ProductDetailResponse> = runCatching {
        Timber.d("Updating product: %s", productId)
        apiService.updateProduct(productId, request)
    }

    /**
     * Delete a product listing by productId.
     */
    override suspend fun deleteProduct(productId: String): Result<Unit> = runCatching {
        Timber.d("Deleting product: %s", productId)
        apiService.deleteProduct(productId)
    }
}
