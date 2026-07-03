package com.arif.vl.domain.usecase.product

import com.arif.vl.data.model.Product
import com.arif.vl.domain.repository.ProductRepository
import javax.inject.Inject

class GetProductDetailsUseCase @Inject constructor(
    private val productRepository: ProductRepository
) {
    suspend operator fun invoke(productId: String): Result<Product> = runCatching {
        productRepository.getProductDetails(productId).getOrThrow()
    }
}
