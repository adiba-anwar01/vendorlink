package com.arif.vl.data.model

import com.google.gson.annotations.SerializedName

/**
 * Product data model - Maps to backend MongoDB product document.
 * Backend returns seller as populated object: { _id, name, role }
 *
 * Status values:
 * - "open": Product is available for sale
 * - "sold": Product has been purchased and is no longer available
 *
 * distanceKm:
 * - Set by backend when fetched via /products/nearby (already computed server-side)
 * - Set by client haversine calculation in plain list mode
 * - -1.0 means unknown (no location data available)
 */
data class Product(
    @SerializedName("_id")
    val id: String = "",

    val title: String = "",
    val description: String = "",
    val price: Double = 0.0,
    val condition: String = "",           // "new" or "used"
    val category: String = "",
    val images: List<String> = emptyList(),

    @SerializedName("seller")
    val sellerObj: SellerObject? = null,

    val sellerRole: String = "",
    val status: String = "open",
    val createdAt: String = "",
    val updatedAt: String = "",
    val location: LocationData? = null,

    // Populated by backend /products/nearby response
    // -1.0 = unknown (no location data on product or user)
    @SerializedName("distanceKm")
    val distanceKm: Double = -1.0,

    // Derived fields (not from JSON — set by HomeViewModel.applyDistances)
    val lat: Double = 0.0,
    val lng: Double = 0.0,
    val address: String = ""
) {
    // Expose vendor info from seller object
    val vendorId: String get() = sellerObj?._id ?: ""
    val vendorName: String get() = sellerObj?.name ?: ""
    val vendorRole: String get() = sellerObj?.role?.ifBlank { sellerRole } ?: sellerRole
    val imageUrls: List<String> get() = images
    
    // Vendor location (from seller object if available, otherwise use product location)
    val vendorLatitude: Double get() = sellerObj?.sellerLat ?: lat
    val vendorLongitude: Double get() = sellerObj?.sellerLng ?: lng
    val vendorAddress: String get() = address  // Address should ideally come from seller's location
    
    val locationLongitude: Double get() = location?.longitude ?: 0.0
    val locationLatitude: Double get() = location?.latitude ?: 0.0
}

/**
 * Seller object as returned by backend (populated reference)
 * May include location if backend returns it populated
 */
data class SellerObject(
    @SerializedName("_id")
    val _id: String = "",
    val name: String = "",
    val role: String = "",
    val location: LocationData? = null  // Seller's location if populated by backend
) {
    // Helper properties for location
    val sellerLat: Double get() = location?.latitude ?: 0.0
    val sellerLng: Double get() = location?.longitude ?: 0.0
}
