package com.arif.vl.data.repository

import com.arif.vl.data.model.UpdateProfileRequest
import com.arif.vl.data.model.User
import com.arif.vl.data.model.UserResponse
import com.arif.vl.data.remote.ApiService
import com.arif.vl.domain.repository.UserRepository
import com.google.gson.Gson
import com.google.gson.JsonObject
import timber.log.Timber
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Implementation of [UserRepository].
 * Handles user profile operations.
 */
@Singleton
class UserRepositoryImpl @Inject constructor(
    private val apiService: ApiService,
    private val gson: Gson
) : UserRepository {

    /**
     * Get the authenticated user's profile.
     */
    override suspend fun getUserProfile(): Result<UserResponse> = runCatching {
        Timber.d("Fetching user profile")
        apiService.getUserProfile()
    }

    /**
     * Update the authenticated user's profile.
     */
    override suspend fun updateUserProfile(user: User): Result<User> = runCatching {
        Timber.d("Updating user profile for: %s", user.id)
        val response = apiService.updateUserProfile(
            UpdateProfileRequest(
                name = user.name,
                email = user.email,
                phone = user.phone.ifBlank { null }
            )
        )
        parseUpdatedUser(response, fallback = user)
    }

    private fun parseUpdatedUser(response: JsonObject, fallback: User): User {
        val userJson = when {
            response.has("user") && response.get("user").isJsonObject -> response.getAsJsonObject("user")
            else -> response
        }

        val parsedUser = runCatching {
            gson.fromJson(userJson, User::class.java)
        }.getOrElse {
            Timber.w(it, "Failed to parse update profile response, using submitted payload")
            fallback
        }

        return parsedUser.copy(id = parsedUser.id.ifBlank { fallback.id })
    }
}
