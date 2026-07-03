package com.arif.vl.presentation.screens.order

import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.automirrored.outlined.ReceiptLong
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import com.arif.vl.core.theme.VLShapes
import com.arif.vl.core.theme.VLSpacing
import com.arif.vl.navigation.NavRoutes

/**
 * Shown after a successful purchase.
 * Features an animated success check, order summary, and navigation back to Home.
 */
@Composable
fun OrderSuccessScreen(
    productTitle: String,
    navController: NavController
) {
    // Pulsing scale animation on the checkmark
    val infiniteTransition = rememberInfiniteTransition(label = "pulse")
    val scale by infiniteTransition.animateFloat(
        initialValue   = 1f,
        targetValue    = 1.08f,
        animationSpec  = infiniteRepeatable(
            animation = tween(900, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "check_scale"
    )

    Scaffold { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .padding(VLSpacing.lg),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            // ── Animated check icon ─────────────────────────────────────────────
            Box(
                modifier = Modifier
                    .size(120.dp)
                    .scale(scale)
                    .clip(CircleShape)
                    .background(MaterialTheme.colorScheme.onSurface.copy(alpha = 0.08f)),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector        = Icons.Filled.CheckCircle,
                    contentDescription = "Order placed",
                    tint               = MaterialTheme.colorScheme.onSurface,
                    modifier           = Modifier.size(72.dp)
                )
            }

            Spacer(Modifier.height(VLSpacing.xl))

            Text(
                text       = "Order Placed!",
                style      = MaterialTheme.typography.headlineMedium,
                fontWeight = FontWeight.Bold
            )
            Spacer(Modifier.height(VLSpacing.sm))
            Text(
                text      = "Your order for",
                style     = MaterialTheme.typography.bodyLarge,
                color     = MaterialTheme.colorScheme.onSurfaceVariant,
                textAlign = TextAlign.Center
            )
            Text(
                text       = productTitle,
                style      = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.SemiBold,
                textAlign  = TextAlign.Center
            )
            Text(
                text      = "has been placed successfully.",
                style     = MaterialTheme.typography.bodyLarge,
                color     = MaterialTheme.colorScheme.onSurfaceVariant,
                textAlign = TextAlign.Center
            )

            Spacer(Modifier.height(VLSpacing.xl))
            Text(
                text      = "This item is now reserved for you!",
                style     = MaterialTheme.typography.bodyLarge,
                color     = MaterialTheme.colorScheme.primary,
                textAlign = TextAlign.Center,
                fontWeight = FontWeight.SemiBold
            )

            Spacer(Modifier.height(VLSpacing.lg))

            // ── Info card ───────────────────────────────────────────────────────
            Card(
                modifier  = Modifier.fillMaxWidth(),
                shape     = VLShapes.medium,
                colors    = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.5f)),
                elevation = CardDefaults.cardElevation(0.dp)
            ) {
                Column(
                    modifier = Modifier.padding(VLSpacing.md),
                    verticalArrangement = Arrangement.spacedBy(VLSpacing.sm)
                ) {
                    Text(
                        text = "What happens next?",
                        style = MaterialTheme.typography.labelLarge,
                        fontWeight = FontWeight.SemiBold
                    )
                    Text(
                        text = "• Your order has been confirmed\n• The seller will review your details\n• You'll receive shipping information soon\n• Track your order in My Orders",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }

            Spacer(Modifier.height(VLSpacing.xl))

            // ── Order status timeline ───────────────────────────────────────────────
            Card(
                modifier  = Modifier.fillMaxWidth(),
                shape     = VLShapes.medium,
                colors    = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant),
                elevation = CardDefaults.cardElevation(0.dp)
            ) {
                Column(modifier = Modifier.padding(VLSpacing.md)) {
                    OrderStatusRow("Order Confirmed", "✅", "Just now")
                    OrderStatusRow("Item Reserved", "✓", "Done")
                    OrderStatusRow("Seller Processing", "👀", "In Progress")
                    OrderStatusRow("Shipped & Delivery", "🚚", "Upcoming")
                }
            }

            Spacer(Modifier.height(VLSpacing.xl))

            // ── Actions ─────────────────────────────────────────────────────────
            Button(
                onClick  = {
                    navController.navigate(NavRoutes.Main) {
                        popUpTo(0) { inclusive = true }
                    }
                },
                modifier = Modifier.fillMaxWidth(),
                shape    = VLShapes.medium
            ) {
                Icon(Icons.Filled.Home, null, modifier = Modifier.size(18.dp))
                Spacer(Modifier.width(VLSpacing.sm))
                Text("Back to Home", style = MaterialTheme.typography.labelLarge)
            }

            Spacer(Modifier.height(VLSpacing.sm))

            OutlinedButton(
                onClick  = {
                    // Navigate to Main shell and switch to Messages tab
                    navController.navigate(NavRoutes.main("messages")) {
                        popUpTo(0) { inclusive = true }
                    }
                },
                modifier = Modifier.fillMaxWidth(),
                shape    = VLShapes.medium
            ) {
                Icon(Icons.AutoMirrored.Outlined.ReceiptLong, null, modifier = Modifier.size(18.dp))
                Spacer(Modifier.width(VLSpacing.sm))
                Text("View Messages", style = MaterialTheme.typography.labelLarge)
            }
        }
    }
}

@Composable
private fun OrderStatusRow(label: String, emoji: String, status: String) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = VLSpacing.xs),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(VLSpacing.sm)
        ) {
            Text(emoji, style = MaterialTheme.typography.titleMedium)
            Text(label, style = MaterialTheme.typography.bodyMedium)
        }
        Text(
            text  = status,
            style = MaterialTheme.typography.labelSmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )
    }
}
