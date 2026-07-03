package com.arif.vl.presentation.screens.auth

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.slideInVertically
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.KeyboardType
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavController
import com.arif.vl.core.components.PrimaryButton
import com.arif.vl.core.components.VLTopAppBar
import com.arif.vl.core.theme.VLSpacing
import com.arif.vl.presentation.viewmodel.AuthUiState
import com.arif.vl.presentation.viewmodel.AuthViewModel

@Composable
fun ForgotPasswordScreen(
    navController: NavController,
    viewModel: AuthViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    val email   by viewModel.email.collectAsState()

    var animVisible by remember { mutableStateOf(false) }
    var successShown by remember { mutableStateOf(false) }
    LaunchedEffect(Unit) { animVisible = true }

    LaunchedEffect(uiState) {
        if (uiState is AuthUiState.Success) {
            successShown = true
            viewModel.resetState()
        }
    }

    Scaffold(
        topBar = {
            VLTopAppBar(
                title = "Reset Password",
                showBackButton = true,
                onBackClick = { navController.popBackStack() }
            )
        }
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .padding(VLSpacing.lg),
            verticalArrangement = Arrangement.Center
        ) {
            AnimatedVisibility(
                visible = animVisible,
                enter = fadeIn() + slideInVertically(initialOffsetY = { -40 })
            ) {
                Column {
                    Text(
                        text = "Forgot your password?",
                        style = MaterialTheme.typography.headlineSmall,
                        color = MaterialTheme.colorScheme.onBackground
                    )
                    Spacer(Modifier.height(VLSpacing.xs))
                    Text(
                        text = "Enter your email address and we'll send you a link to reset it.",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )

                    Spacer(Modifier.height(VLSpacing.xl))

                    OutlinedTextField(
                        value = email,
                        onValueChange = viewModel::onEmailChange,
                        label = { Text("Email") },
                        modifier = Modifier.fillMaxWidth(),
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
                        singleLine = true,
                        shape = MaterialTheme.shapes.medium,
                        colors = authFieldColors()
                    )

                    Spacer(Modifier.height(VLSpacing.lg))

                    if (uiState is AuthUiState.Error) {
                        Text(
                            text = (uiState as AuthUiState.Error).message,
                            color = MaterialTheme.colorScheme.error,
                            style = MaterialTheme.typography.bodySmall,
                            modifier = Modifier.padding(bottom = VLSpacing.sm)
                        )
                    }

                    if (successShown) {
                        Card(
                            colors = CardDefaults.cardColors(
                                containerColor = MaterialTheme.colorScheme.surfaceVariant
                            ),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text(
                                text = "✓ Reset link sent — check your inbox.",
                                style = MaterialTheme.typography.bodyMedium,
                                modifier = Modifier.padding(VLSpacing.md)
                            )
                        }
                        Spacer(Modifier.height(VLSpacing.md))
                    }

                    PrimaryButton(
                        text = "Send Reset Link",
                        onClick = viewModel::forgotPassword,
                        isLoading = uiState is AuthUiState.Loading,
                        enabled = !successShown
                    )
                }
            }
        }
    }
}
