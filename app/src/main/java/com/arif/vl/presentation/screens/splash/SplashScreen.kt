package com.arif.vl.presentation.screens.splash

import androidx.compose.animation.core.Animatable
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.scale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import com.arif.vl.navigation.NavRoutes
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

import androidx.hilt.navigation.compose.hiltViewModel
import com.arif.vl.presentation.viewmodel.AuthViewModel

/**
 * Splash screen: fades + scales in the VL logo, then navigates to Login or Main based on Auth state.
 */
@Composable
fun SplashScreen(
    navController: NavController,
    authViewModel: AuthViewModel = hiltViewModel()
) {

    val scale = remember { Animatable(0.7f) }
    val alpha = remember { Animatable(0f) }

    LaunchedEffect(Unit) {
        // Run scale and alpha animations in parallel
        launch { scale.animateTo(1f, animationSpec = tween(durationMillis = 700)) }
        alpha.animateTo(1f, animationSpec = tween(durationMillis = 700))

        delay(1400L)

        val destination = if (authViewModel.checkAuthStatus()) {
            NavRoutes.Main
        } else {
            NavRoutes.Login
        }

        navController.navigate(destination) {
            popUpTo(NavRoutes.Splash) { inclusive = true }
        }
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background),
        contentAlignment = Alignment.Center
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center,
            modifier = Modifier
                .scale(scale.value)
                .alpha(alpha.value)
        ) {
            Text(
                text = "VL",
                style = MaterialTheme.typography.displayMedium.copy(
                    fontWeight = FontWeight.ExtraBold,
                    letterSpacing = 4.sp
                ),
                color = MaterialTheme.colorScheme.onBackground
            )
            Spacer(Modifier.height(8.dp))
            Text(
                text  = "VendorLink",
                style = MaterialTheme.typography.titleMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}
