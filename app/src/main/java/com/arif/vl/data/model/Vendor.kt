package com.arif.vl.data.model

/**
 * Vendor/seller data model.
 */
data class Vendor(
    val id: String = "",
    val name: String = "",
    val email: String = "",
    val description: String = "",
    val imageUrl: String = "",
    val rating: Float = 0f,
    val productCount: Int = 0,
    val joinedDate: String = ""
)
