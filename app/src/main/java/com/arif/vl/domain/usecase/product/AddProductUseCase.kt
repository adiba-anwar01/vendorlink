package com.arif.vl.domain.usecase.product

import com.arif.vl.data.model.CreateProductRequest
import com.arif.vl.data.model.Product
import com.arif.vl.domain.repository.ProductRepository
import javax.inject.Inject

class AddProductUseCase @Inject constructor(
    private val productRepository: ProductRepository
) {
    suspend operator fun invoke(request: CreateProductRequest): Result<Product> = runCatching {
        productRepository.addProduct(request).getOrThrow()
    }
}
