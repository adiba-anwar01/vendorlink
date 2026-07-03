package com.arif.vl.domain.usecase.user

import com.arif.vl.data.model.User
import com.arif.vl.domain.repository.UserRepository
import javax.inject.Inject

class GetUserProfileUseCase @Inject constructor(
    private val userRepository: UserRepository
) {
    suspend operator fun invoke(): Result<User> = runCatching {
        val response = userRepository.getUserProfile().getOrThrow()
        response.user
            ?: throw IllegalStateException("Server returned a null user object. Check API response shape.")
    }
}
