package com.arif.vl.core.components

import android.content.ActivityNotFoundException
import android.content.Context
import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.automirrored.filled.OpenInNew
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import coil.compose.AsyncImage
import coil.request.ImageRequest
import com.arif.vl.core.theme.VLShapes
import com.arif.vl.core.theme.VLSpacing

// ── Replace with your Google API key for production ───────────────────────────
// Free alternative: leave empty/null and the component gracefully falls back to
// an OSM tile image (no API key required).
private const val MAPS_API_KEY: String = "" // Add your Google API key here if you prefer it over OSM

/**
 * Shows a static Google Maps (or OSM fallback) preview of a location.
 * Tapping it opens the native Maps app at the specified coordinates.
 *
 * @param lat       Latitude  (e.g. 28.6139)
 * @param lng       Longitude (e.g. 77.2090)
 * @param label     Pin label shown in Google Maps (e.g. vendor name)
 * @param address   Human-readable address shown below the map
 * @param height    Height of the map thumbnail (default 180.dp)
 */
@Composable
fun MapPreviewCard(
    lat: Double,
    lng: Double,
    label: String,
    address: String,
    modifier: Modifier = Modifier,
    height: Dp = 180.dp
) {
    val context = LocalContext.current

    // Build the static map image URL
    val mapUrl = remember(lat, lng) {
        buildMapUrl(lat = lat, lng = lng, width = 640, height = 320)
    }

    // Callback that opens the system Maps app
    val openMaps: () -> Unit = remember(lat, lng, label) {
        { launchMaps(context, lat, lng, label) }
    }

    Card(
        modifier  = modifier.fillMaxWidth(),
        shape     = VLShapes.medium,
        colors    = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surfaceVariant
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = 0.dp)
    ) {
        Column {
            // ── Map thumbnail ─────────────────────────────────────────────────
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(height)
                    .clip(VLShapes.medium)
                    .background(MaterialTheme.colorScheme.outline.copy(alpha = 0.3f))
                    .clickable(onClick = openMaps)
            ) {
                AsyncImage(
                    model              = ImageRequest.Builder(context)
                        .data(mapUrl)
                        .crossfade(true)
                        .build(),
                    contentDescription = "Map showing $label",
                    contentScale       = ContentScale.Crop,
                    modifier           = Modifier.fillMaxSize()
                )

                // Overlay pin icon
                Box(
                    modifier = Modifier
                        .size(40.dp)
                        .align(Alignment.Center)
                        .clip(VLShapes.extraLarge)
                        .background(MaterialTheme.colorScheme.surface),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        Icons.Filled.LocationOn,
                        contentDescription = null,
                        tint     = MaterialTheme.colorScheme.onSurface,
                        modifier = Modifier.size(22.dp)
                    )
                }

                // "Tap to open" chip at bottom-right
                Surface(
                    modifier = Modifier
                        .align(Alignment.BottomEnd)
                        .padding(VLSpacing.sm),
                    shape = VLShapes.extraSmall,
                    color = MaterialTheme.colorScheme.surface.copy(alpha = 0.92f)
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = VLSpacing.xs, vertical = 3.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(3.dp)
                    ) {
                        Icon(
                            Icons.AutoMirrored.Filled.OpenInNew,
                            contentDescription = null,
                            modifier = Modifier.size(10.dp),
                            tint     = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                        Text(
                            "Open in Maps",
                            style = MaterialTheme.typography.labelSmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
            }

            // ── Address row ───────────────────────────────────────────────────
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clickable(onClick = openMaps)
                    .padding(VLSpacing.md),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(VLSpacing.sm)
            ) {
                Icon(
                    Icons.Filled.LocationOn,
                    contentDescription = null,
                    tint     = MaterialTheme.colorScheme.onSurfaceVariant,
                    modifier = Modifier.size(18.dp)
                )
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text       = label,
                        style      = MaterialTheme.typography.labelMedium,
                        fontWeight = FontWeight.SemiBold
                    )
                    if (address.isNotBlank()) {
                        Text(
                            text  = address,
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
                Icon(
                    Icons.AutoMirrored.Filled.OpenInNew,
                    contentDescription = "Open in Maps",
                    tint     = MaterialTheme.colorScheme.onSurfaceVariant,
                    modifier = Modifier.size(14.dp)
                )
            }
        }
    }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Builds a static map image URL.
 * - If MAPS_API_KEY is set → Google Static Maps API (high quality)
 * - Otherwise → OpenStreetMap static tiles (no API key, completely free)
 */
private fun buildMapUrl(lat: Double, lng: Double, width: Int, height: Int): String {
    return if (MAPS_API_KEY.isNotBlank()) {
        "https://maps.googleapis.com/maps/api/staticmap" +
            "?center=$lat,$lng" +
            "&zoom=15" +
            "&size=${width}x${height}" +
            "&scale=2" +
            "&markers=color:red%7C$lat,$lng" +
            "&key=$MAPS_API_KEY"
    } else {
        // Free OSM-based static map – no API key needed
        // Uses staticmap.openstreetmap.de (community service, rate-limited)
        "https://staticmap.openstreetmap.de/staticmap.php" +
            "?center=$lat,$lng" +
            "&zoom=15" +
            "&size=${width}x${height}" +
            "&markers=$lat,$lng,red-pushpin"
    }
}

/**
 * Launches Google Maps (or any installed Maps app) to show the given location.
 * Falls back to a browser Google Maps URL if no Maps app is installed.
 */
private fun launchMaps(context: Context, lat: Double, lng: Double, label: String) {
    val encodedLabel = Uri.encode(label)
    // geo: URI opens Google Maps with a pin + label
    val geoUri = Uri.parse("geo:$lat,$lng?q=$lat,$lng($encodedLabel)")
    val mapsIntent = Intent(Intent.ACTION_VIEW, geoUri).apply {
        setPackage("com.google.android.apps.maps")  // prefer Google Maps
    }
    try {
        context.startActivity(mapsIntent)
    } catch (_: ActivityNotFoundException) {
        // Google Maps not installed → open in browser
        val browserUri = Uri.parse(
            "https://maps.google.com/maps?q=$lat,$lng&z=15"
        )
        context.startActivity(Intent(Intent.ACTION_VIEW, browserUri))
    }
}
