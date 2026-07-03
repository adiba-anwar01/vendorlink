package com.arif.vl.domain.usecase.vendor

import com.arif.vl.data.model.Product
import com.arif.vl.data.model.Vendor
import com.arif.vl.domain.repository.VendorRepository
import javax.inject.Inject

/**
 * Get vendor details use case.
 * NOTE: Backend doesn't have individual vendor endpoint yet.
 * Use getNearbyVendors to find vendors or view their products.
 */
class GetVendorUseCase @Inject constructor(
    private val vendorRepository: VendorRepository
) {
    suspend operator fun invoke(vendorId: String): Result<Vendor> =
        Result.failure(Exception("Vendor details endpoint not yet implemented"))
}

/**
 * Get products from a specific vendor.
 * NOTE: Backend doesn't have this endpoint yet.
 * Browse all products and filter by vendor.
 */
class GetVendorProductsUseCase @Inject constructor(
    private val vendorRepository: VendorRepository
) {
    suspend operator fun invoke(vendorId: String): Result<List<Product>> =
        Result.failure(Exception("Vendor products endpoint not yet implemented"))
}
