package com.arif.vl.domain.repository

import com.arif.vl.data.model.NearbyVendorsResponse

/**
 * Contract for vendor data operations.
 */
interface VendorRepository {
    suspend fun getNearbyVendors(latitude: Double, longitude: Double): Result<NearbyVendorsResponse>
}
