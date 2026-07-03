package com.arif.vl.domain.repository

import com.arif.vl.data.model.User
import com.arif.vl.data.model.UserResponse

/**
 * Contract for user profile operations.
 */
interface UserRepository {
    suspend fun getUserProfile(): Result<UserResponse>
    suspend fun updateUserProfile(user: User): Result<User>
}
