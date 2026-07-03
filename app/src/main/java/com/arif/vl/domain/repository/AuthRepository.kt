package com.arif.vl.domain.repository

import com.arif.vl.data.model.AuthResponse
import com.arif.vl.data.model.LoginRequest
import com.arif.vl.data.model.RegisterRequest

/**
 * Contract for authentication operations.
 */
interface AuthRepository {
    suspend fun login(request: LoginRequest): Result<AuthResponse>
    suspend fun register(request: RegisterRequest): Result<AuthResponse>
    suspend fun logout(): Result<Unit>
    suspend fun updateLocation(latitude: Double, longitude: Double): Result<Unit>
    fun isLoggedIn(): Boolean
    fun getUserId(): String?
    fun getUserEmail(): String?
    fun getUserName(): String?
    fun updateStoredUserInfo(userId: String, email: String, name: String)
}
