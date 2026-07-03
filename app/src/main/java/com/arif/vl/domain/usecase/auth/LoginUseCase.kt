package com.arif.vl.domain.usecase.auth

import com.arif.vl.data.model.AuthResponse
import com.arif.vl.data.model.LoginRequest
import com.arif.vl.domain.repository.AuthRepository
import javax.inject.Inject

class LoginUseCase @Inject constructor(
    private val authRepository: AuthRepository
) {
    suspend operator fun invoke(email: String, password: String): Result<AuthResponse> =
        authRepository.login(LoginRequest(email, password))
}
