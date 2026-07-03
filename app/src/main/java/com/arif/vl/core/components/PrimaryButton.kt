package com.arif.vl.core.components

import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.scale
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Shape
import androidx.compose.ui.graphics.Color
import androidx.compose.foundation.background
import androidx.compose.ui.unit.dp
import com.arif.vl.core.theme.VLShapes
import com.arif.vl.core.theme.VLSpacing

/**
 * Full-width primary action button with press animation.
 */
@Composable
fun PrimaryButton(
    text: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    enabled: Boolean = true,
    isLoading: Boolean = false,
    shape: Shape = VLShapes.medium
) {
    var pressed by remember { mutableStateOf(false) }
    val scale by animateFloatAsState(
        targetValue = if (pressed) 0.97f else 1f,
        label = "primaryBtnScale"
    )

    // A subtle gradient background for a premium look
    val gradientColors = listOf(
        com.arif.vl.core.theme.BrandGradientStart,
        com.arif.vl.core.theme.BrandGradientEnd
    )
    val gradientBrush = androidx.compose.ui.graphics.Brush.horizontalGradient(gradientColors)

    Button(
        onClick = {
            if (!isLoading) onClick()
        },
        modifier = modifier
            .fillMaxWidth()
            .height(56.dp)
            .scale(scale)
            .shadow(
                elevation = if (enabled && !isLoading) 8.dp else 0.dp,
                shape = shape,
                spotColor = com.arif.vl.core.theme.BrandGradientEnd.copy(alpha = 0.5f)
            ),
        enabled = enabled && !isLoading,
        shape = shape,
        colors = ButtonDefaults.buttonColors(
            containerColor = Color.Transparent // Transparent so gradient shows
        ),
        contentPadding = PaddingValues(0.dp) // Reset padding so Box fills it
    ) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(
                    brush = if (enabled) gradientBrush else androidx.compose.ui.graphics.SolidColor(MaterialTheme.colorScheme.surfaceVariant),
                    shape = shape
                ),
            contentAlignment = Alignment.Center
        ) {
            if (isLoading) {
                CircularProgressIndicator(
                    modifier = Modifier.size(24.dp),
                    strokeWidth = 2.dp,
                    color = MaterialTheme.colorScheme.onPrimary
                )
            } else {
                Text(
                    text = text,
                    style = MaterialTheme.typography.labelLarge,
                    color = if (enabled) MaterialTheme.colorScheme.onPrimary else MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }
    }
}
