package com.arif.vl.data.repository

import com.arif.vl.data.model.NearbyVendorsResponse
import com.arif.vl.data.remote.ApiService
import com.arif.vl.domain.repository.VendorRepository
import timber.log.Timber
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Implementation of [VendorRepository].
 */
@Singleton
class VendorRepositoryImpl @Inject constructor(
    private val apiService: ApiService
) : VendorRepository {

    /**
     * Get nearby vendors based on location.
     */
    override suspend fun getNearbyVendors(
        latitude: Double,
        longitude: Double
    ): Result<NearbyVendorsResponse> = runCatching {
        Timber.d("Fetching nearby vendors: lat=%f, lng=%f", latitude, longitude)
        apiService.getNearbyVendors(latitude, longitude)
    }
}
