package com.arif.vl.presentation.screens.vendor

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Star
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavController
import coil.compose.AsyncImage
import com.arif.vl.core.components.LoadingIndicator
import com.arif.vl.core.components.MapPreviewCard
import com.arif.vl.core.components.ProductCard
import com.arif.vl.core.components.VLTopAppBar
import com.arif.vl.core.theme.VLSpacing
import com.arif.vl.navigation.NavRoutes
import com.arif.vl.presentation.viewmodel.VendorViewModel

@Composable
fun VendorProfileScreen(
    vendorId: String,
    navController: NavController,
    viewModel: VendorViewModel = hiltViewModel()
) {
    val state by viewModel.uiState.collectAsState()

    LaunchedEffect(vendorId) { viewModel.loadVendor(vendorId) }

    if (state.isLoading) { LoadingIndicator(); return }

    Scaffold(
        topBar = {
            VLTopAppBar(
                title          = state.vendor?.name ?: "Vendor",
                showBackButton = true,
                onBackClick    = { navController.popBackStack() }
            )
        }
    ) { innerPadding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
        ) {
            // ── Vendor header ─────────────────────────────────────────────────
            item {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(VLSpacing.lg),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    // Avatar
                    Box(
                        modifier = Modifier
                            .size(88.dp)
                            .clip(CircleShape)
                            .background(MaterialTheme.colorScheme.outline)
                    ) {
                        state.vendor?.imageUrl?.let { url ->
                            AsyncImage(
                                model = url.ifBlank { "https://picsum.photos/seed/$vendorId/200" },
                                contentDescription = null,
                                contentScale = ContentScale.Crop,
                                modifier = Modifier.fillMaxSize()
                            )
                        }
                    }
                    Spacer(Modifier.height(VLSpacing.md))
                    Text(
                        text  = state.vendor?.name ?: "",
                        style = MaterialTheme.typography.headlineSmall
                    )
                    Spacer(Modifier.height(VLSpacing.xs))
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(VLSpacing.xs)
                    ) {
                        Icon(Icons.Filled.Star, null, modifier = Modifier.size(16.dp))
                        Text(
                            text  = "${state.vendor?.rating ?: 0f}  ·  ${state.vendor?.productCount ?: 0} listings",
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                    Spacer(Modifier.height(VLSpacing.sm))
                    state.vendor?.description?.takeIf { it.isNotBlank() }?.let { desc ->
                        Text(
                            text  = desc,
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
                HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant)
            }

            // ── Shop location map ──────────────────────────────────────────
            // Placeholder Mumbai coordinates until real vendor API provides them
            item {
                Column(modifier = androidx.compose.ui.Modifier.padding(
                    horizontal = VLSpacing.md, vertical = VLSpacing.sm
                )) {
                    Text("Shop Location", style = MaterialTheme.typography.titleMedium)
                    androidx.compose.foundation.layout.Spacer(
                        androidx.compose.ui.Modifier.height(VLSpacing.sm)
                    )
                    MapPreviewCard(
                        lat     = 19.0760,
                        lng     = 72.8777,
                        label   = state.vendor?.name ?: "Vendor",
                        address = "Bandra West, Mumbai"
                    )
                }
            }

            // ── Products section header ────────────────────────────────────────
            item {
                Text(
                    text  = "Listings",
                    style = MaterialTheme.typography.titleMedium,
                    modifier = Modifier.padding(VLSpacing.md)
                )
            }

            // ── Product grid using items embedded inside LazyColumn ────────────
            // Using chunked rows for correct layout inside LazyColumn
            items(state.products.chunked(2).size) { rowIndex ->
                val rowProducts = state.products.chunked(2)[rowIndex]
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = VLSpacing.md)
                        .padding(bottom = VLSpacing.sm),
                    horizontalArrangement = Arrangement.spacedBy(VLSpacing.sm)
                ) {
                    rowProducts.forEach { product ->
                        ProductCard(
                            product  = product,
                            onClick  = { navController.navigate(NavRoutes.productDetails(product.id)) },
                            modifier = Modifier.weight(1f)
                        )
                    }
                    // Fill empty space if odd number of products
                    if (rowProducts.size == 1) Spacer(Modifier.weight(1f))
                }
            }

            item { Spacer(Modifier.height(VLSpacing.xxl)) }
        }
    }
}
