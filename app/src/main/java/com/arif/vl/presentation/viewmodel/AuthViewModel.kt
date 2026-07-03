package com.arif.vl.presentation.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.arif.vl.domain.usecase.auth.ForgotPasswordUseCase
import com.arif.vl.domain.usecase.auth.LoginUseCase
import com.arif.vl.domain.usecase.auth.RegisterUseCase
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject
import com.arif.vl.data.local.SecureTokenManager

// ─── UI State ─────────────────────────────────────────────────────────────────
sealed class AuthUiState {
    object Idle    : AuthUiState()
    object Loading : AuthUiState()
    object Success : AuthUiState()
    data class Error(val message: String) : AuthUiState()
}



@HiltViewModel
class AuthViewModel @Inject constructor(
    private val loginUseCase: LoginUseCase,
    private val registerUseCase: RegisterUseCase,
    private val forgotPasswordUseCase: ForgotPasswordUseCase,
    private val secureTokenManager: SecureTokenManager
) : ViewModel() {

    fun checkAuthStatus(): Boolean {
        return secureTokenManager.isLoggedIn()
    }

    private val _uiState = MutableStateFlow<AuthUiState>(AuthUiState.Idle)
    val uiState: StateFlow<AuthUiState> = _uiState.asStateFlow()

    // ── Form fields ───────────────────────────────────────────────────────────
    private val _name     = MutableStateFlow("")
    val name: StateFlow<String> = _name.asStateFlow()

    private val _email    = MutableStateFlow("")
    val email: StateFlow<String> = _email.asStateFlow()

    private val _password = MutableStateFlow("")
    val password: StateFlow<String> = _password.asStateFlow()

    private val _confirmPassword = MutableStateFlow("")
    val confirmPassword: StateFlow<String> = _confirmPassword.asStateFlow()

    // ── Field updaters ────────────────────────────────────────────────────────
    fun onNameChange(value: String)            { _name.value = value }
    fun onEmailChange(value: String)           { _email.value = value }
    fun onPasswordChange(value: String)        { _password.value = value }
    fun onConfirmPasswordChange(value: String) { _confirmPassword.value = value }

    // ── Actions ───────────────────────────────────────────────────────────────
    fun login() {
        viewModelScope.launch {
            _uiState.value = AuthUiState.Loading
            val result = loginUseCase(_email.value.trim(), _password.value)
            _uiState.value = result.fold(
                onSuccess = { AuthUiState.Success },
                onFailure = { AuthUiState.Error(it.message ?: "Login failed") }
            )
        }
    }

    fun register() {
        if (_password.value != _confirmPassword.value) {
            _uiState.value = AuthUiState.Error("Passwords do not match")
            return
        }
        viewModelScope.launch {
            _uiState.value = AuthUiState.Loading
            val result = registerUseCase(_name.value.trim(), _email.value.trim(), _password.value)
            _uiState.value = result.fold(
                onSuccess = { AuthUiState.Success },
                onFailure = { AuthUiState.Error(it.message ?: "Registration failed") }
            )
        }
    }

    fun forgotPassword() {
        viewModelScope.launch {
            _uiState.value = AuthUiState.Loading
            val result = forgotPasswordUseCase(_email.value.trim())
            _uiState.value = result.fold(
                onSuccess = { AuthUiState.Success },
                onFailure = { AuthUiState.Error(it.message ?: "Request failed") }
            )
        }
    }

    fun resetState() {
        _uiState.value = AuthUiState.Idle
    }
}
