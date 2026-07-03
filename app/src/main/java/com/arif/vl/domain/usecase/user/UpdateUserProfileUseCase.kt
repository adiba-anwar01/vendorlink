package com.arif.vl.domain.usecase.user

import com.arif.vl.data.model.User
import com.arif.vl.domain.repository.UserRepository
import javax.inject.Inject

class UpdateUserProfileUseCase @Inject constructor(
    private val userRepository: UserRepository
) {
    suspend operator fun invoke(user: User): Result<User> =
        userRepository.updateUserProfile(user)
}
