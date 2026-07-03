package com.arif.vl.presentation.screens.auth

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.slideInVertically
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Visibility
import androidx.compose.material.icons.filled.VisibilityOff
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavController
import com.arif.vl.core.components.PrimaryButton
import com.arif.vl.core.theme.VLSpacing
import com.arif.vl.navigation.NavRoutes
import com.arif.vl.presentation.viewmodel.AuthUiState
import com.arif.vl.presentation.viewmodel.AuthViewModel

@Composable
fun SignupScreen(
    navController: NavController,
    viewModel: AuthViewModel = hiltViewModel()
) {
    val uiState         by viewModel.uiState.collectAsState()
    val name            by viewModel.name.collectAsState()
    val email           by viewModel.email.collectAsState()
    val password        by viewModel.password.collectAsState()
    val confirmPassword by viewModel.confirmPassword.collectAsState()

    var passwordVisible by remember { mutableStateOf(false) }
    var animVisible     by remember { mutableStateOf(false) }

    LaunchedEffect(Unit) { animVisible = true }

    LaunchedEffect(uiState) {
        if (uiState is AuthUiState.Success) {
            viewModel.resetState()
            navController.navigate(NavRoutes.Main) {
                popUpTo(NavRoutes.Signup) { inclusive = true }
            }
        }
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(
                brush = androidx.compose.ui.graphics.Brush.verticalGradient(
                    colors = listOf(
                        MaterialTheme.colorScheme.surface,
                        MaterialTheme.colorScheme.surfaceVariant
                    )
                )
            )
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(horizontal = com.arif.vl.core.theme.VLSpacing.xl),
            verticalArrangement = Arrangement.Center
        ) {
            AnimatedVisibility(
                visible = animVisible,
                enter = fadeIn() + slideInVertically(initialOffsetY = { 40 })
            ) {
                Column {
                    Text(
                        text = "Create account",
                        style = MaterialTheme.typography.displaySmall,
                        color = MaterialTheme.colorScheme.onBackground
                    )
                    Spacer(Modifier.height(com.arif.vl.core.theme.VLSpacing.xs))
                    Text(
                        text = "Join VendorLink today",
                        style = MaterialTheme.typography.bodyLarge,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )

                    Spacer(Modifier.height(48.dp))

                    OutlinedTextField(
                        value = name, onValueChange = viewModel::onNameChange,
                        label = { Text("Full Name") },
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true, shape = com.arif.vl.core.theme.VLShapes.medium,
                        colors = authFieldColors()
                    )
                    Spacer(Modifier.height(com.arif.vl.core.theme.VLSpacing.md))
                    OutlinedTextField(
                        value = email, onValueChange = viewModel::onEmailChange,
                        label = { Text("Email address") },
                        modifier = Modifier.fillMaxWidth(),
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
                        singleLine = true, shape = com.arif.vl.core.theme.VLShapes.medium,
                        colors = authFieldColors()
                    )
                    Spacer(Modifier.height(com.arif.vl.core.theme.VLSpacing.md))
                    OutlinedTextField(
                        value = password, onValueChange = viewModel::onPasswordChange,
                        label = { Text("Password") },
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true, shape = com.arif.vl.core.theme.VLShapes.medium,
                        visualTransformation = if (passwordVisible) VisualTransformation.None else PasswordVisualTransformation(),
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password),
                        trailingIcon = {
                            IconButton(onClick = { passwordVisible = !passwordVisible }) {
                                Icon(
                                    if (passwordVisible) Icons.Filled.Visibility else Icons.Filled.VisibilityOff,
                                    contentDescription = null
                                )
                            }
                        },
                        colors = authFieldColors()
                    )
                    Spacer(Modifier.height(com.arif.vl.core.theme.VLSpacing.md))
                    OutlinedTextField(
                        value = confirmPassword, onValueChange = viewModel::onConfirmPasswordChange,
                        label = { Text("Confirm Password") },
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true, shape = com.arif.vl.core.theme.VLShapes.medium,
                        visualTransformation = PasswordVisualTransformation(),
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password),
                        colors = authFieldColors()
                    )

                    Spacer(Modifier.height(com.arif.vl.core.theme.VLSpacing.xl))

                    if (uiState is AuthUiState.Error) {
                        Text(
                            text = (uiState as AuthUiState.Error).message,
                            color = MaterialTheme.colorScheme.error,
                            style = MaterialTheme.typography.bodySmall,
                            modifier = Modifier.padding(bottom = com.arif.vl.core.theme.VLSpacing.sm)
                        )
                    }

                    PrimaryButton(
                        text = "Create Account",
                        onClick = viewModel::register,
                        isLoading = uiState is AuthUiState.Loading,
                        shape = com.arif.vl.core.theme.VLShapes.medium
                    )

                    Spacer(Modifier.height(com.arif.vl.core.theme.VLSpacing.xxl))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.Center
                    ) {
                        Text(
                            text = "Already have an account? ",
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                        Text(
                            text = "Sign In",
                            style = MaterialTheme.typography.labelLarge,
                            color = MaterialTheme.colorScheme.primary,
                            modifier = Modifier.clickable { navController.popBackStack() }
                        )
                    }
                }
            }
        }
    }
}
