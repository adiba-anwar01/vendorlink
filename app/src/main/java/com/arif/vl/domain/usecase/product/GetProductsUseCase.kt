package com.arif.vl.domain.usecase.product

import com.arif.vl.data.model.Product
import com.arif.vl.domain.repository.ProductRepository
import javax.inject.Inject

class GetProductsUseCase @Inject constructor(
    private val productRepository: ProductRepository
) {
    suspend operator fun invoke(
        page: Int? = null,
        limit: Int? = null,
        category: String? = null,
        query: String? = null,
        sellerRole: String? = null
    ): Result<List<Product>> = runCatching {
        productRepository.getProducts(
            page = page,
            limit = limit,
            category = category,
            query = query,
            sellerRole = sellerRole
        ).getOrThrow()
    }
}
