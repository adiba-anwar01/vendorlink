package com.arif.vl.data.network

import com.arif.vl.data.local.SecureTokenManager
import okhttp3.Interceptor
import okhttp3.Response
import timber.log.Timber

/**
 * OkHttp interceptor that automatically adds JWT Authorization header to all requests.
 * This ensures the token is included with every API call without manual header management.
 */
class AuthInterceptor(private val tokenManager: SecureTokenManager) : Interceptor {

    companion object {
        private const val AUTHORIZATION_HEADER = "Authorization"
        private const val BEARER_PREFIX = "Bearer "
    }

    override fun intercept(chain: Interceptor.Chain): Response {
        val originalRequest = chain.request()
        val url = originalRequest.url.toString()
        val method = originalRequest.method

        // Skip adding token for public endpoints
        if (isPublicEndpoint(url, method)) {
            Timber.d("Skipping token for public endpoint: %s %s", method, url)
            return chain.proceed(originalRequest)
        }

        // Get stored token
        val token = tokenManager.getAccessToken()

        // Create request with Authorization header
        val requestWithAuth = if (!token.isNullOrEmpty()) {
            Timber.d("Adding Authorization header to request: %s %s", method, url)
            originalRequest.newBuilder()
                .addHeader(AUTHORIZATION_HEADER, BEARER_PREFIX + token)
                .build()
        } else {
            Timber.w("No token available for protected request: %s %s", method, url)
            originalRequest  // No token, send as-is (will likely get 401)
        }

        var response = chain.proceed(requestWithAuth)

        // Handle 401: Token expired or invalid
        if (response.code == 401) {
            Timber.w("Received 401 Unauthorized - Token invalid or expired")
            tokenManager.clearToken()
            // In a full implementation, you'd attempt token refresh here
            // For now, ViewModel will handle navigation to login
        }

        return response
    }

    /**
     * Determine if an endpoint is public (doesn't require authentication)
     * Takes into account both the URL path AND the HTTP method
     */
    private fun isPublicEndpoint(url: String, method: String): Boolean {
        // Public authentication endpoints (GET token, login, register)
        if ((url.contains("/auth/login") || url.contains("/auth/register") || url.contains("/auth/forgot-password")) && method == "POST") {
            return true
        }

        // GET /api/products (list all) is public
        if (url.contains("/products") && method == "GET" && !url.contains("/api/products/")) {
            return true
        }

        // GET /api/location/nearby is public for discovering nearby vendors
        if (url.contains("/location/nearby") && method == "GET") {
            return true
        }

        // All other endpoints require authentication
        return false
    }
}
