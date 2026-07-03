package com.arif.vl.domain.usecase.product

import com.arif.vl.data.model.ProductDetailResponse
import com.arif.vl.data.model.UpdateProductRequest
import com.arif.vl.domain.repository.ProductRepository
import javax.inject.Inject

class UpdateProductUseCase @Inject constructor(
    private val productRepository: ProductRepository
) {
    suspend operator fun invoke(
        productId: String,
        request: UpdateProductRequest
    ): Result<ProductDetailResponse> =
        productRepository.updateProduct(productId, request)
}

class DeleteProductUseCase @Inject constructor(
    private val productRepository: ProductRepository
) {
    suspend operator fun invoke(productId: String): Result<Unit> =
        productRepository.deleteProduct(productId)
}
