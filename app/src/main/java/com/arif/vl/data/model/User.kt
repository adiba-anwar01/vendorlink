package com.arif.vl.data.model

import com.google.gson.annotations.SerializedName

/**
 * User data model.
 */
data class User(
    @SerializedName("id", alternate = ["_id"])
    val id: String = "",
    val name: String = "",
    val email: String = "",
    val phone: String = "",
    val profileImageUrl: String = "",
    val joinedDate: String = "",
    val role: String = "",
    val location: LocationData? = null
) {
    val latitude: Double get() = location?.latitude ?: 0.0
    val longitude: Double get() = location?.longitude ?: 0.0
}
