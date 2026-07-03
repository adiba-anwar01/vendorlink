package com.arif.vl.core.components

import androidx.compose.animation.animateColorAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.arif.vl.core.theme.VLShapes
import com.arif.vl.core.theme.VLSpacing

/**
 * Category filter chip shown in a horizontal scroll row on HomeScreen.
 * Animates background and text color on selection.
 */
@Composable
fun CategoryChip(
    label: String,
    selected: Boolean,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    val bgColor by animateColorAsState(
        targetValue   = if (selected) MaterialTheme.colorScheme.primary
                        else MaterialTheme.colorScheme.surfaceVariant,
        animationSpec = tween(durationMillis = 200),
        label         = "chip_bg"
    )
    val textColor by animateColorAsState(
        targetValue   = if (selected) MaterialTheme.colorScheme.onPrimary
                        else MaterialTheme.colorScheme.onSurfaceVariant,
        animationSpec = tween(durationMillis = 200),
        label         = "chip_text"
    )

    Surface(
        onClick  = onClick,
        modifier = modifier.height(36.dp),
        shape    = VLShapes.extraLarge,
        color    = bgColor
    ) {
        Box(
            modifier        = Modifier.padding(horizontal = VLSpacing.md),
            contentAlignment = Alignment.Center
        ) {
            Text(
                text       = label,
                style      = MaterialTheme.typography.labelMedium,
                color      = textColor,
                fontWeight = if (selected) FontWeight.SemiBold else FontWeight.Normal
            )
        }
    }
}
