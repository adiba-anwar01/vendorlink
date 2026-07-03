package com.arif.vl.presentation.screens.product

import android.content.Intent
import androidx.compose.animation.animateColorAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.pager.HorizontalPager
import androidx.compose.foundation.pager.rememberPagerState
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Share
import androidx.compose.material.icons.filled.Star
import androidx.compose.material.icons.outlined.ChevronRight
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavController
import android.util.Log
import coil.compose.AsyncImage
import com.arif.vl.core.components.LoadingIndicator
import com.arif.vl.core.components.MapPreviewCard
import com.arif.vl.core.components.PrimaryButton
import com.arif.vl.core.components.SecondaryButton
import com.arif.vl.core.components.VLTopAppBar
import com.arif.vl.core.theme.VLShapes
import com.arif.vl.core.theme.VLSpacing
import com.arif.vl.navigation.NavRoutes
import com.arif.vl.presentation.viewmodel.ProductViewModel

@Composable
fun ProductDetailsScreen(
    productId: String,
    navController: NavController,
    viewModel: ProductViewModel = hiltViewModel()
) {
    val state by viewModel.uiState.collectAsState()
    val context = LocalContext.current

    LaunchedEffect(productId) { viewModel.loadProduct(productId) }

    // Debug logging
    LaunchedEffect(state.vendor) {
        Log.d("ProductDetailsScreen", "Vendor state changed: ${state.vendor?.name}, lat=${state.vendor?.latitude}, lng=${state.vendor?.longitude}")
    }

    if (state.isLoading) { LoadingIndicator(); return }

    val product = state.product ?: return
    val vendor = state.vendor  // May be null if vendor fetch fails, will fall back to product location

    // Check if product is sold
    val isSold = product.status == "sold"

    val images = product.imageUrls.ifEmpty {
        listOf("https://picsum.photos/seed/$productId/800/600")
    }
    val pagerState = rememberPagerState(pageCount = { images.size })

    Scaffold(
        topBar = {
            VLTopAppBar(
                title          = "",
                showBackButton = true,
                onBackClick    = { navController.popBackStack() },
                actions = {
                    IconButton(onClick = {
                        val shareText = "Check out ${product.title} for ₹${product.price.toLong()} on VendorLink!\n" +
                            "https://vendorlink.app/products/${product.id}"
                        val intent = Intent(Intent.ACTION_SEND).apply {
                            type = "text/plain"
                            putExtra(Intent.EXTRA_TEXT, shareText)
                        }
                        context.startActivity(Intent.createChooser(intent, "Share via"))
                    }) {
                        Icon(Icons.Filled.Share, contentDescription = "Share product")
                    }
                }
            )
        },
        bottomBar = {
            // ── Sticky dual CTA bottom bar ────────────────────────────────────
            Surface(shadowElevation = 12.dp) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .navigationBarsPadding()
                        .padding(horizontal = VLSpacing.md, vertical = VLSpacing.sm),
                    horizontalArrangement = Arrangement.spacedBy(VLSpacing.sm)
                ) {
                    if (isSold) {
                        // Sold Out State
                        Button(
                            onClick = {},
                            enabled = false,
                            modifier = Modifier.fillMaxWidth(),
                            colors = ButtonDefaults.buttonColors(
                                disabledContainerColor = MaterialTheme.colorScheme.error.copy(alpha = 0.5f)
                            )
                        ) {
                            Text("Sold Out", style = MaterialTheme.typography.labelLarge)
                        }
                    } else {
                        // Available State: Message Vendor + Buy Now
                        SecondaryButton(
                            text     = "Message Vendor",
                            onClick  = {
                                navController.navigate(
                                    NavRoutes.conversation(productId, product.vendorId)
                                )
                            },
                            modifier = Modifier.weight(1f)
                        )
                        // Primary: Buy Now
                        PrimaryButton(
                            text     = "Buy Now",
                            onClick  = {
                                navController.navigate(NavRoutes.purchase(productId))
                            },
                            modifier = Modifier.weight(1f)
                        )
                    }
                }
            }
        }
    ) { innerPadding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
        ) {
            // ── Image carousel ────────────────────────────────────────────────
            item {
                Box {
                    HorizontalPager(
                        state = pagerState,
                        modifier = Modifier.fillMaxWidth().height(400.dp)
                    ) { page ->
                        AsyncImage(
                            model = images[page],
                            contentDescription = "Product image ${page + 1}",
                            contentScale = ContentScale.Crop,
                            modifier = Modifier.fillMaxSize()
                        )
                    }
                    // Page dots
                    if (images.size > 1) {
                        Row(
                            modifier = Modifier
                                .align(Alignment.BottomCenter)
                                .padding(bottom = VLSpacing.sm),
                            horizontalArrangement = Arrangement.spacedBy(VLSpacing.xxs)
                        ) {
                            repeat(images.size) { idx ->
                                val dotColor by animateColorAsState(
                                    targetValue = if (pagerState.currentPage == idx)
                                        MaterialTheme.colorScheme.onSurface
                                    else
                                        MaterialTheme.colorScheme.onSurface.copy(alpha = 0.4f),
                                    animationSpec = tween(200),
                                    label = "dot_color"
                                )
                                Box(
                                    modifier = Modifier
                                        .size(if (pagerState.currentPage == idx) 8.dp else 6.dp)
                                        .clip(VLShapes.extraLarge)
                                        .background(dotColor)
                                )
                            }
                        }
                    }
                }
            }

            // ── Details ───────────────────────────────────────────────────────
            item {
                Surface(
                    shape = androidx.compose.foundation.shape.RoundedCornerShape(topStart = 32.dp, topEnd = 32.dp),
                    color = MaterialTheme.colorScheme.background,
                    modifier = Modifier.offset(y = (-32).dp).fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(VLSpacing.xl)) {

                    // Condition chip
                    Surface(
                        shape = VLShapes.extraSmall,
                        color = MaterialTheme.colorScheme.surfaceVariant
                    ) {
                        Text(
                            text = product.condition,
                            style = MaterialTheme.typography.labelSmall,
                            modifier = Modifier.padding(horizontal = VLSpacing.sm, vertical = VLSpacing.xxs)
                        )
                    }

                    Spacer(Modifier.height(VLSpacing.sm))

                    Text(
                        text  = product.title,
                        style = MaterialTheme.typography.headlineSmall
                    )

                    Spacer(Modifier.height(VLSpacing.xs))

                    Text(
                        text  = "₹${product.price.toLong()}",
                        style = MaterialTheme.typography.titleLarge
                    )

                    Spacer(Modifier.height(VLSpacing.xs))

                    Text(
                        text  = "Posted recently",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )

                    Spacer(Modifier.height(VLSpacing.md))
                    HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant)
                    Spacer(Modifier.height(VLSpacing.md))

                    Text("Description", style = MaterialTheme.typography.titleSmall)
                    Spacer(Modifier.height(VLSpacing.xs))
                    Text(
                        text  = product.description.ifBlank { "No description provided." },
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )

                    Spacer(Modifier.height(VLSpacing.md))
                    HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant)
                    Spacer(Modifier.height(VLSpacing.md))

                    // Vendor strip (clickable → VendorProfileScreen)
                    Text("Seller", style = MaterialTheme.typography.titleSmall)
                    Spacer(Modifier.height(VLSpacing.sm))
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(VLSpacing.sm),
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(VLShapes.medium)
                            .clickable {
                                navController.navigate(NavRoutes.vendorProfile(product.vendorId))
                            }
                            .padding(vertical = VLSpacing.xs)
                    ) {
                        Box(
                            modifier = Modifier
                                .size(44.dp)
                                .clip(VLShapes.extraLarge)
                                .background(MaterialTheme.colorScheme.surfaceVariant),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text  = product.vendorName.take(1).uppercase(),
                                style = MaterialTheme.typography.titleMedium,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                        Column(modifier = Modifier.weight(1f)) {
                            Text(product.vendorName, style = MaterialTheme.typography.titleSmall)
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(Icons.Filled.Star, null, modifier = Modifier.size(12.dp))
                                Spacer(Modifier.width(2.dp))
                                Text(
                                    "4.5 · 12 listings",
                                    style = MaterialTheme.typography.bodySmall,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                            }
                        }
                        Icon(
                            Icons.Outlined.ChevronRight,
                            contentDescription = "View vendor",
                            tint = MaterialTheme.colorScheme.onSurfaceVariant,
                            modifier = Modifier.size(20.dp)
                        )
                    }

                    // ── Vendor location map (shown when vendor has coordinates) ──
                    // Try to use vendor profile location first, then fall back to seller object in product, then product location
                    val vendorLat = vendor?.latitude 
                        ?: product.sellerObj?.sellerLat 
                        ?: product.vendorLatitude
                    val vendorLng = vendor?.longitude 
                        ?: product.sellerObj?.sellerLng 
                        ?: product.vendorLongitude
                    
                    // Debug logging for vendor location
                    LaunchedEffect(vendorLat, vendorLng) {
                        Log.d("ProductDetailsScreen", "Map coordinates: lat=$vendorLat, lng=$vendorLng")
                        Log.d("ProductDetailsScreen", "Vendor from state: lat=${vendor?.latitude}, lng=${vendor?.longitude}")
                        Log.d("ProductDetailsScreen", "SellerObj location: lat=${product.sellerObj?.sellerLat}, lng=${product.sellerObj?.sellerLng}")
                        Log.d("ProductDetailsScreen", "Product fallback: lat=${product.vendorLatitude}, lng=${product.vendorLongitude}")
                    }
                    
                    if (vendorLat != 0.0 && vendorLng != 0.0) {
                        Spacer(Modifier.height(VLSpacing.md))
                        HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant)
                        Spacer(Modifier.height(VLSpacing.md))
                        Text("Vendor Location", style = MaterialTheme.typography.titleSmall)
                        Spacer(Modifier.height(VLSpacing.sm))
                        MapPreviewCard(
                            lat     = vendorLat,
                            lng     = vendorLng,
                            label   = product.vendorName,
                            address = product.vendorAddress
                        )
                    }

                    Spacer(Modifier.height(VLSpacing.xxxl))
                }
                } // Close Surface
            }
        }
    }
}
