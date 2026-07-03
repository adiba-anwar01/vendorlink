package com.arif.vl.domain.usecase.auth

import com.arif.vl.data.model.AuthResponse
import com.arif.vl.data.model.RegisterRequest
import com.arif.vl.domain.repository.AuthRepository
import javax.inject.Inject

class RegisterUseCase @Inject constructor(
    private val authRepository: AuthRepository
) {
    suspend operator fun invoke(name: String, email: String, password: String): Result<AuthResponse> =
        authRepository.register(RegisterRequest(name, email, password))
}
