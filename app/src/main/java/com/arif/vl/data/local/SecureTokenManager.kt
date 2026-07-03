package com.arif.vl.data.local

import android.content.Context
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey
import dagger.hilt.android.qualifiers.ApplicationContext
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Manages JWT tokens securely using EncryptedSharedPreferences.
 * Tokens are encrypted at rest on the device.
 */
@Singleton
class SecureTokenManager @Inject constructor(
    @ApplicationContext context: Context
) {
    private val masterKey = MasterKey.Builder(context)
        .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
        .build()

    private val prefs = EncryptedSharedPreferences.create(
        context,
        "auth_tokens",
        masterKey,
        EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
        EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
    )

    companion object {
        private const val KEY_ACCESS_TOKEN = "access_token"
        private const val KEY_TOKEN_EXPIRATION = "token_expiration"
        private const val KEY_USER_ID = "user_id"
        private const val KEY_USER_EMAIL = "user_email"
        private const val KEY_USER_NAME = "user_name"
    }

    /**
     * Save JWT token with expiration time
     * @param token JWT token from backend
     * @param expiresInSeconds Token expiration time in seconds (e.g., 604800 for 7 days)
     */
    fun saveToken(token: String, expiresInSeconds: Long) {
        val expirationTimeMs = System.currentTimeMillis() + (expiresInSeconds * 1000)
        prefs.edit().putString(KEY_ACCESS_TOKEN, token).putLong(KEY_TOKEN_EXPIRATION, expirationTimeMs).apply()
    }

    /**
     * Get stored access token if valid
     * @return JWT token or null if expired/not found
     */
    fun getAccessToken(): String? {
        // Check if token is expired
        if (!isTokenValid()) {
            clearToken()
            return null
        }
        return prefs.getString(KEY_ACCESS_TOKEN, null)
    }

    /**
     * Check if stored token is still valid (not expired)
     * @return true if token exists and not expired
     */
    fun isTokenValid(): Boolean {
        val expirationTime = prefs.getLong(KEY_TOKEN_EXPIRATION, 0)
        if (expirationTime == 0L) {
            return false  // No token saved
        }
        val currentTimeMs = System.currentTimeMillis()
        // Token is valid if current time < expiration time (with 5-second buffer for clock sync)
        val isValid = currentTimeMs < (expirationTime - 5_000)
        timber.log.Timber.d("Token valid: %b (current: %d, expires: %d, buffer: 5s)", isValid, currentTimeMs, expirationTime)
        return isValid
    }

    /**
     * Save user information (user ID, email, name)
     */
    fun saveUserInfo(userId: String, email: String, name: String) {
        prefs.edit()
            .putString(KEY_USER_ID, userId)
            .putString(KEY_USER_EMAIL, email)
            .putString(KEY_USER_NAME, name)
            .apply()
    }

    /**
     * Get saved user ID
     */
    fun getUserId(): String? = prefs.getString(KEY_USER_ID, null)

    /**
     * Get saved user email
     */
    fun getUserEmail(): String? = prefs.getString(KEY_USER_EMAIL, null)

    /**
     * Get saved user name
     */
    fun getUserName(): String? = prefs.getString(KEY_USER_NAME, null)

    /**
     * Clear all authentication data (on logout)
     */
    fun clearToken() {
        prefs.edit()
            .remove(KEY_ACCESS_TOKEN)
            .remove(KEY_TOKEN_EXPIRATION)
            .remove(KEY_USER_ID)
            .remove(KEY_USER_EMAIL)
            .remove(KEY_USER_NAME)
            .apply()
    }

    /**
     * Check if user is logged in (has valid token)
     */
    fun isLoggedIn(): Boolean = isTokenValid() && getAccessToken() != null
}
