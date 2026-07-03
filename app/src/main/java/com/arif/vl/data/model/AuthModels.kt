package com.arif.vl.data.model

import com.arif.vl.BuildConfig
import com.google.gson.annotations.SerializedName

/** Request body for login. */
data class LoginRequest(
    val email: String,
    val password: String
)

/** Request body for registration. */
data class RegisterRequest(
    val name: String,
    val email: String,
    val password: String,
    val role: String = "user",  // "user" or "vendor"
    val latitude: Double? = null,
    val longitude: Double? = null
)

/**
 * Response from auth endpoints.
 * Backend returns:
 *   Login:    { token, user: { id, name, email, role, location } }
 *   Register: { message, user: { id, name, email, role, location } }
 */
data class AuthResponse(
    val token: String = "",
    val message: String? = null,
    val user: AuthUser? = null
) {
    // Convenience accessors matching existing code
    val userId: String get() = user?.id ?: ""
    val name: String get() = user?.name ?: ""
    val email: String get() = user?.email ?: ""
    val expiresIn: Long get() = BuildConfig.TOKEN_EXPIRY_SECONDS
}

data class AuthUser(
    @SerializedName("id", alternate = ["_id"])
    val id: String = "",
    val name: String = "",
    val email: String = "",
    val role: String = "user",
    val location: LocationData? = null
)

data class LocationData(
    val type: String = "Point",
    val coordinates: List<Double> = emptyList()
) {
    val longitude: Double get() = coordinates.getOrNull(0) ?: 0.0
    val latitude: Double get() = coordinates.getOrNull(1) ?: 0.0
}
