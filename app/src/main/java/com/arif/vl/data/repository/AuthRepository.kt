package com.arif.vl.data.repository

import com.arif.vl.data.local.SecureTokenManager
import com.arif.vl.data.model.AuthResponse
import com.arif.vl.data.model.LocationUpdateRequest
import com.arif.vl.data.model.LoginRequest
import com.arif.vl.data.model.RegisterRequest
import com.arif.vl.data.remote.ApiService
import com.arif.vl.domain.repository.AuthRepository
import timber.log.Timber
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Implementation of [AuthRepository].
 * Handles login, registration, token management, and logout.
 */
@Singleton
class AuthRepositoryImpl @Inject constructor(
    private val apiService: ApiService,
    private val tokenManager: SecureTokenManager
) : AuthRepository {

    /**
     * Login user with email and password.
     * Saves token securely and returns user info.
     */
    override suspend fun login(request: LoginRequest): Result<AuthResponse> = runCatching {
        Timber.d("Attempting login for: %s", request.email)
        val response = apiService.login(request)

        tokenManager.saveToken(response.token, response.expiresIn)
        tokenManager.saveUserInfo(response.userId, response.email, response.name)

        Timber.d("Login successful for: %s", request.email)
        response
    }

    /**
     * Register new user.
     * Saves token securely after registration.
     */
    override suspend fun register(request: RegisterRequest): Result<AuthResponse> = runCatching {
        Timber.d("Attempting registration for: %s", request.email)
        val response = apiService.register(request)

        tokenManager.saveToken(response.token, response.expiresIn)
        tokenManager.saveUserInfo(response.userId, response.email, response.name)

        Timber.d("Registration successful for: %s", request.email)
        response
    }

    /**
     * Logout user: clear all stored tokens and user info.
     */
    override suspend fun logout(): Result<Unit> = runCatching {
        Timber.d("Logging out user")
        tokenManager.clearToken()
    }

    /**
     * Update user location on backend.
     */
    override suspend fun updateLocation(latitude: Double, longitude: Double): Result<Unit> = runCatching {
        Timber.d("Updating user location: lat=%f, lng=%f", latitude, longitude)
        apiService.updateLocation(LocationUpdateRequest(latitude, longitude))
    }

    override fun isLoggedIn(): Boolean = tokenManager.isLoggedIn()
    override fun getUserId(): String? = tokenManager.getUserId()
    override fun getUserEmail(): String? = tokenManager.getUserEmail()
    override fun getUserName(): String? = tokenManager.getUserName()

    /**
     * Keep locally cached auth user info in sync after profile edits.
     */
    override fun updateStoredUserInfo(userId: String, email: String, name: String) {
        tokenManager.saveUserInfo(userId, email, name)
    }
}
