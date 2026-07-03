package com.arif.vl.core.components

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Bookmark
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.Star
import androidx.compose.material.icons.outlined.BookmarkBorder
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import coil.compose.AsyncImage
import coil.request.ImageRequest
import com.arif.vl.core.theme.VLShapes
import com.arif.vl.core.theme.VLSpacing
import com.arif.vl.data.model.Product

/**
 * Performance-optimised Product Card.
 *
 * Key decisions:
 * - Uses ImageRequest (not bare URL string) → triggers Coil's memory & disk cache lookups
 * - No animateColorAsState inside the card
 * - Distance string formatted once via remember(product.distanceKm)
 * - Theme colors resolved once at top of composition
 * - Bookmark keyed by product.id so state survives reordering
 */
@Composable
fun ProductCard(
    product: Product,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    var bookmarked by remember(product.id) { mutableStateOf(false) }

    // Resolve theme colors once – avoids repeated CompositionLocal lookups per frame
    val surfaceColor = MaterialTheme.colorScheme.surfaceVariant
    val onSurface    = MaterialTheme.colorScheme.onSurface
    val onSurfaceVar = MaterialTheme.colorScheme.onSurfaceVariant
    val surfaceTop   = MaterialTheme.colorScheme.surface.copy(alpha = 0.92f)

    // Pre-compute formatted strings outside draw phase
    val distanceStr = remember(product.distanceKm) {
        if (product.distanceKm > 0.0) "%.1f km".format(product.distanceKm) else null
    }
    val priceStr = remember(product.price) { "₹${product.price.toLong()}" }

    // Build an ImageRequest once per image URL – this is what triggers Coil cache hits
    val context = LocalContext.current
    val imageRequest = remember(product.imageUrls.firstOrNull()) {
        ImageRequest.Builder(context)
            .data(product.imageUrls.firstOrNull())
            .crossfade(true)
            .build()
    }

    Card(
        modifier  = modifier
            .fillMaxWidth()
            .clickable(onClick = onClick)
            .shadow(
                elevation = 12.dp,
                shape = VLShapes.medium,
                spotColor = Color.Black.copy(alpha = 0.1f)
            ),
        shape     = VLShapes.medium,
        colors    = CardDefaults.cardColors(containerColor = surfaceColor),
        elevation = CardDefaults.cardElevation(defaultElevation = 0.dp)
    ) {
        Column {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(180.dp)
                    .clip(VLShapes.medium)
                    .background(MaterialTheme.colorScheme.outline)
            ) {
                // Coil AsyncImage – now uses full ImageRequest for cache efficiency
                AsyncImage(
                    model              = imageRequest,
                    contentDescription = product.title,
                    contentScale       = ContentScale.Crop,
                    modifier           = Modifier.fillMaxSize()
                )

                // Condition badge
                BadgeSurface(
                    text     = product.condition,
                    color    = surfaceTop,
                    modifier = Modifier.align(Alignment.TopStart).padding(VLSpacing.sm)
                )

                // Bookmark toggle
                IconButton(
                    onClick  = { bookmarked = !bookmarked },
                    modifier = Modifier.align(Alignment.TopEnd).size(36.dp)
                ) {
                    Icon(
                        imageVector        = if (bookmarked) Icons.Filled.Bookmark else Icons.Outlined.BookmarkBorder,
                        contentDescription = if (bookmarked) "Remove bookmark" else "Bookmark",
                        tint               = if (bookmarked) onSurface else onSurfaceVar,
                        modifier           = Modifier.size(18.dp)
                    )
                }

                // Distance badge (only shown when known)
                if (distanceStr != null) {
                    Row(
                        modifier = Modifier
                            .align(Alignment.BottomStart)
                            .padding(VLSpacing.sm)
                            .clip(VLShapes.extraSmall)
                            .background(surfaceTop)
                            .padding(horizontal = VLSpacing.xs, vertical = 2.dp),
                        verticalAlignment     = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(2.dp)
                    ) {
                        Icon(Icons.Filled.LocationOn, null, modifier = Modifier.size(10.dp), tint = onSurfaceVar)
                        Text(text = distanceStr, style = MaterialTheme.typography.labelSmall, color = onSurfaceVar)
                    }
                }
            }

            Column(modifier = Modifier.padding(VLSpacing.sm)) {
                Text(
                    text     = product.title,
                    style    = MaterialTheme.typography.titleSmall,
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis
                )
                Spacer(Modifier.height(VLSpacing.xxs))
                Text(text = priceStr, style = MaterialTheme.typography.labelLarge, color = onSurface)
                Spacer(Modifier.height(VLSpacing.xxs))
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment     = Alignment.CenterVertically
                ) {
                    Text(
                        text     = product.vendorName,
                        style    = MaterialTheme.typography.bodySmall,
                        color    = onSurfaceVar,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis,
                        modifier = Modifier.weight(1f)
                    )
                    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(1.dp)) {
                        Icon(Icons.Filled.Star, null, modifier = Modifier.size(10.dp), tint = onSurfaceVar)
                        Text("4.5", style = MaterialTheme.typography.labelSmall, color = onSurfaceVar)
                    }
                }
            }
        }
    }
}

@Composable
private fun BadgeSurface(text: String, color: Color, modifier: Modifier = Modifier) {
    Box(
        modifier = modifier
            .clip(VLShapes.extraSmall)
            .background(color)
            .padding(horizontal = VLSpacing.xs, vertical = VLSpacing.xxs)
    ) {
        Text(text = text, style = MaterialTheme.typography.labelSmall)
    }
}
