package com.arif.vl.domain.usecase.auth

import com.arif.vl.domain.repository.AuthRepository
import javax.inject.Inject

/**
 * Forgot password use case.
 * NOTE: This feature is not yet implemented in the backend.
 * Contact support to reset your password.
 */
class ForgotPasswordUseCase @Inject constructor(
    private val authRepository: AuthRepository
) {
    suspend operator fun invoke(email: String): Result<Unit> =
        Result.failure(Exception("Forgot password feature not yet implemented"))
}
