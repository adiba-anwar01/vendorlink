package com.arif.vl.presentation.screens.home

import android.Manifest
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.grid.*
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.Sort
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.NearMe
import androidx.compose.material.icons.outlined.Close
import androidx.compose.material.icons.outlined.NearMe
import androidx.compose.material.icons.filled.MyLocation
import androidx.compose.material.ExperimentalMaterialApi
import androidx.compose.material3.*
import androidx.compose.material.pullrefresh.PullRefreshIndicator
import androidx.compose.material.pullrefresh.pullRefresh
import androidx.compose.material.pullrefresh.rememberPullRefreshState
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavController
import com.arif.vl.core.components.*
import com.arif.vl.core.theme.VLShapes
import com.arif.vl.core.theme.VLSpacing
import com.arif.vl.navigation.NavRoutes
import com.arif.vl.presentation.viewmodel.HomeViewModel
import com.arif.vl.presentation.viewmodel.SortOption
import kotlin.math.roundToInt

@OptIn(ExperimentalMaterialApi::class, ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen(
    navController: NavController,
    viewModel: HomeViewModel = hiltViewModel()
) {
    val state by viewModel.uiState.collectAsState()
    val locationPermissionLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestPermission()
    ) { granted ->
        if (granted) {
            viewModel.useAutoGps()
        } else {
            viewModel.onLocationPermissionDenied()
        }
    }
    var showSortSheet     by remember { mutableStateOf(false) }
    var showNearbySheet   by remember { mutableStateOf(false) }
    var showLocationSheet by remember { mutableStateOf(false) }

    // ── Sort bottom sheet ──────────────────────────────────────────────────────
    if (showSortSheet) {
        SortBottomSheet(
            current   = state.sortOption,
            onSelect  = { viewModel.onSortSelected(it); showSortSheet = false },
            onDismiss = { showSortSheet = false }
        )
    }

    // ── Nearby range bottom sheet ─────────────────────────────────────────────
    if (showNearbySheet) {
        NearbyFilterSheet(
            pendingRadius = state.pendingRadius,
            isEnabled     = state.isNearbyOnly,
            onApply = { radius, enabled ->
                viewModel.onNearbyApply(radius, enabled)
                showNearbySheet = false
            },
            onDismiss = { showNearbySheet = false }
        )
    }

    // ── Location selection bottom sheet ───────────────────────────────────────
    if (showLocationSheet) {
        LocationBottomSheet(
            onLocationSelect = { city ->
                viewModel.updateLocation(city)
                showLocationSheet = false
            },
            onAutoGps = {
                locationPermissionLauncher.launch(Manifest.permission.ACCESS_FINE_LOCATION)
                showLocationSheet = false
            },
            onDismiss = { showLocationSheet = false }
        )
    }

    if (state.isLoading && state.products.isEmpty()) {
        LoadingIndicator()
        return
    }

    // ── Pull-to-refresh state ──────────────────────────────────────────────
    val pullRefreshState = rememberPullRefreshState(
        refreshing = state.isRefreshing,
        onRefresh = { viewModel.onRefresh() }
    )

    // key = { it } on category strings; key = { it.id } on products → eliminates ghost recompositions
    Box(
        modifier = Modifier
            .fillMaxSize()
            .pullRefresh(pullRefreshState)
    ) {
        LazyVerticalGrid(
        columns        = GridCells.Fixed(2),
        modifier       = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(
            start  = VLSpacing.md,
            end    = VLSpacing.md,
            top    = VLSpacing.sm,
            bottom = VLSpacing.xxl
        ),
        horizontalArrangement = Arrangement.spacedBy(VLSpacing.sm),
        verticalArrangement   = Arrangement.spacedBy(VLSpacing.sm)
    ) {

        // ── Location + title header ─────────────────────────────────────────
        item(span = { GridItemSpan(maxLineSpan) }) {
            Column {
                Spacer(Modifier.height(VLSpacing.sm))
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text(
                        text  = "VendorLink",
                        style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Bold)
                    )
                    Surface(
                        onClick = { showLocationSheet = true },
                        color = MaterialTheme.colorScheme.background,
                        shape = VLShapes.small
                    ) {
                        Row(
                            modifier = Modifier.padding(horizontal = 4.dp, vertical = 2.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(2.dp)
                        ) {
                            Icon(
                                Icons.Filled.LocationOn, null,
                                modifier = Modifier.size(14.dp),
                                tint     = MaterialTheme.colorScheme.primary
                            )
                            Text(
                                text  = state.userCity,
                                style = MaterialTheme.typography.labelMedium,
                                color = MaterialTheme.colorScheme.primary,
                                fontWeight = FontWeight.SemiBold
                            )
                        }
                    }
                }
                Spacer(Modifier.height(VLSpacing.sm))
                VLSearchBar(
                    query         = state.searchQuery,
                    onQueryChange = viewModel::onSearchQueryChange,
                    onSearch      = { viewModel.loadProducts() }
                )
                Spacer(Modifier.height(VLSpacing.sm))
            }
        }

        // ── Filter row: Nearby chip | Category chips | Sort ─────────────────
        item(span = { GridItemSpan(maxLineSpan) }) {
            Column {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    // Nearby chip – tap opens the range sheet
                    NearbyChip(
                        active  = state.isNearbyOnly,
                        radiusKm = state.nearbyRadiusKm.roundToInt(),
                        onClick = { showNearbySheet = true },
                        onClear = { viewModel.onNearbyClear() }
                    )
                    Spacer(Modifier.width(VLSpacing.xs))

                    // Category chips
                    LazyRow(
                        modifier = Modifier.weight(1f),
                        horizontalArrangement = Arrangement.spacedBy(VLSpacing.xs),
                        contentPadding        = PaddingValues(horizontal = 0.dp)
                    ) {
                        items(state.categories, key = { it }) { category ->
                            CategoryChip(
                                label    = category,
                                selected = state.selectedCategory == category,
                                onClick  = { viewModel.onCategorySelected(category) }
                            )
                        }
                    }

                    Spacer(Modifier.width(VLSpacing.xs))
                    SortButton(onClick = { showSortSheet = true })
                }

                // Active filter badges
                AnimatedVisibility(
                    visible = state.sortOption != SortOption.LATEST,
                    enter   = fadeIn(tween(200)),
                    exit    = fadeOut(tween(200))
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(top = VLSpacing.xs),
                        horizontalArrangement = Arrangement.spacedBy(VLSpacing.xs)
                    ) {
                        ActiveFilterBadge("Sort: ${state.sortOption.label}")
                    }
                }
                Spacer(Modifier.height(VLSpacing.sm))
            }
        }

        // ── All products header ──────────────────────────────────────────────
        item(span = { GridItemSpan(maxLineSpan) }) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment     = Alignment.CenterVertically
            ) {
                SectionHeader(if (state.isNearbyOnly) "Nearby Products" else "All Products")
                Text(
                    text  = "${state.products.size} items",
                    style = MaterialTheme.typography.labelMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }

        // ── Product grid ────────────────────────────────────────────────────
        if (state.products.isEmpty()) {
            item(span = { GridItemSpan(maxLineSpan) }) {
                EmptyStateComponent(
                    message  = if (state.isNearbyOnly) "No products nearby" else "No products found",
                    subtitle = if (state.isNearbyOnly)
                        "Try increasing the radius or turn off Nearby"
                    else
                        "Try a different category or search term"
                )
            }
        } else {
            // Stable key → only changed cards recompose on sort/filter
            items(state.products, key = { it.id }) { product ->
                ProductCard(
                    product = product,
                    onClick = { navController.navigate(NavRoutes.productDetails(product.id)) }
                )
            }
        }
    }
        
        // ── Pull-to-refresh indicator ──────────────────────────────────────
        PullRefreshIndicator(
            refreshing = state.isRefreshing,
            state = pullRefreshState,
            modifier = Modifier.align(Alignment.TopCenter),
            backgroundColor = MaterialTheme.colorScheme.surface,
            contentColor = MaterialTheme.colorScheme.primary
        )
    }
}

// ── Nearby chip ───────────────────────────────────────────────────────────────
@Composable
private fun NearbyChip(
    active: Boolean,
    radiusKm: Int,
    onClick: () -> Unit,
    onClear: () -> Unit
) {
    val bgColor      = if (active) MaterialTheme.colorScheme.onSurface else MaterialTheme.colorScheme.surfaceVariant
    val contentColor = if (active) MaterialTheme.colorScheme.surface    else MaterialTheme.colorScheme.onSurfaceVariant

    Surface(
        onClick  = onClick,
        shape    = VLShapes.extraLarge,
        color    = bgColor,
        modifier = Modifier.height(36.dp)
    ) {
        Row(
            modifier = Modifier.padding(start = VLSpacing.sm, end = if (active) 4.dp else VLSpacing.sm),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(4.dp)
        ) {
            Icon(
                imageVector = if (active) Icons.Filled.NearMe else Icons.Outlined.NearMe,
                contentDescription = "Nearby",
                tint     = contentColor,
                modifier = Modifier.size(14.dp)
            )
            Text(
                text  = if (active) "≤ ${radiusKm} km" else "Nearby",
                style = MaterialTheme.typography.labelMedium,
                color = contentColor
            )
            // X to clear when active
            if (active) {
                IconButton(onClick = onClear, modifier = Modifier.size(20.dp)) {
                    Icon(
                        Icons.Outlined.Close, "Clear nearby",
                        tint     = contentColor,
                        modifier = Modifier.size(12.dp)
                    )
                }
            }
        }
    }
}

// ── Sort icon button ──────────────────────────────────────────────────────────
@Composable
private fun SortButton(onClick: () -> Unit) {
    Surface(
        onClick  = onClick,
        shape    = VLShapes.small,
        color    = MaterialTheme.colorScheme.surfaceVariant,
        modifier = Modifier.size(36.dp)
    ) {
        Box(contentAlignment = Alignment.Center) {
            Icon(Icons.AutoMirrored.Filled.Sort, "Sort", modifier = Modifier.size(18.dp))
        }
    }
}

// ── Active filter badge ───────────────────────────────────────────────────────
@Composable
private fun ActiveFilterBadge(label: String) {
    Box(
        modifier = Modifier
            .clip(VLShapes.extraLarge)
            .background(MaterialTheme.colorScheme.surfaceVariant)
            .padding(horizontal = VLSpacing.sm, vertical = 3.dp)
    ) {
        Text(
            text  = label,
            style = MaterialTheme.typography.labelSmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )
    }
}

// ── Nearby filter bottom sheet ────────────────────────────────────────────────
@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun NearbyFilterSheet(
    pendingRadius: Float,
    isEnabled: Boolean,
    onApply: (Float, Boolean) -> Unit,
    onDismiss: () -> Unit
) {
    val sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true)
    // Local slider state so the slider is responsive without hitting ViewModel every frame
    var localRadius by remember { mutableFloatStateOf(pendingRadius) }
    var localEnabled by remember { mutableStateOf(isEnabled) }

    ModalBottomSheet(
        onDismissRequest = onDismiss,
        sheetState       = sheetState
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = VLSpacing.lg)
                .padding(bottom = VLSpacing.xxl),
            verticalArrangement = Arrangement.spacedBy(VLSpacing.md)
        ) {
            // Header
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment     = Alignment.CenterVertically
            ) {
                Text("Nearby Filter", style = MaterialTheme.typography.titleMedium)
                Switch(
                    checked         = localEnabled,
                    onCheckedChange = { localEnabled = it }
                )
            }

            HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant)

            // Slider
            Column {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text(
                        "Search radius",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    Text(
                        "${localRadius.roundToInt()} km",
                        style = MaterialTheme.typography.titleSmall,
                        fontWeight = FontWeight.SemiBold
                    )
                }
                Slider(
                    value         = localRadius,
                    onValueChange = { localRadius = it },
                    valueRange    = 1f..50f,
                    steps         = 48,          // 1-km increments
                    modifier      = Modifier.fillMaxWidth()
                )
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text("1 km",  style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    Text("50 km", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                }
            }

            // Preview label
            Surface(
                shape  = VLShapes.medium,
                color  = MaterialTheme.colorScheme.surfaceVariant,
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    modifier = Modifier.padding(VLSpacing.md),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(VLSpacing.sm)
                ) {
                    Icon(Icons.Filled.NearMe, null, modifier = Modifier.size(18.dp))
                    Text(
                        text  = if (localEnabled)
                                    "Showing products within ${localRadius.roundToInt()} km of ${  "Mumbai"}"
                                else
                                    "Nearby filter is off – showing all products",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }

            // Apply button
            Button(
                onClick  = { onApply(localRadius, localEnabled) },
                modifier = Modifier.fillMaxWidth(),
                shape    = VLShapes.medium
            ) {
                Text("Apply Filter", style = MaterialTheme.typography.labelLarge)
            }
        }
    }
}

// ── Sort bottom sheet ─────────────────────────────────────────────────────────
@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun SortBottomSheet(
    current: SortOption,
    onSelect: (SortOption) -> Unit,
    onDismiss: () -> Unit
) {
    val sheetState = rememberModalBottomSheetState()

    ModalBottomSheet(
        onDismissRequest = onDismiss,
        sheetState       = sheetState
    ) {
        Column(modifier = Modifier.padding(bottom = VLSpacing.xxl)) {
            Text(
                "Sort By",
                style    = MaterialTheme.typography.titleMedium,
                modifier = Modifier.padding(horizontal = VLSpacing.md, vertical = VLSpacing.sm)
            )
            HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant)
            SortOption.entries.forEach { option ->
                val selected = option == current
                Surface(
                    onClick = { onSelect(option) },
                    color   = MaterialTheme.colorScheme.background
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = VLSpacing.md, vertical = VLSpacing.md),
                        verticalAlignment     = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(
                            text       = option.label,
                            style      = MaterialTheme.typography.bodyLarge,
                            color      = if (selected) MaterialTheme.colorScheme.onSurface
                                         else MaterialTheme.colorScheme.onSurfaceVariant,
                            fontWeight = if (selected) FontWeight.SemiBold else FontWeight.Normal
                        )
                        if (selected) {
                            Icon(
                                Icons.Filled.NearMe, null,
                                modifier = Modifier.size(16.dp)
                            )
                        }
                    }
                }
            }
        }
    }
}

// ── Section header ────────────────────────────────────────────────────────────
@Composable
private fun SectionHeader(title: String) {
    Text(
        text     = title,
        style    = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.SemiBold),
        modifier = Modifier.padding(bottom = VLSpacing.sm)
    )
}

// ── Location bottom sheet ───────────────────────────────────────────────────────
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LocationBottomSheet(
    onLocationSelect: (String) -> Unit,
    onAutoGps: () -> Unit,
    onDismiss: () -> Unit
) {
    val sheetState = rememberModalBottomSheetState()
    var inputCity by remember { mutableStateOf("") }

    ModalBottomSheet(
        onDismissRequest = onDismiss,
        sheetState       = sheetState
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = VLSpacing.lg)
                .padding(bottom = VLSpacing.xxl),
            verticalArrangement = Arrangement.spacedBy(VLSpacing.md)
        ) {
            Text(
                "Change Location",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold
            )

            HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant)

            // Auto GPS Button
            Button(
                onClick = onAutoGps,
                modifier = Modifier.fillMaxWidth(),
                shape = VLShapes.medium,
                colors = ButtonDefaults.buttonColors(
                    containerColor = MaterialTheme.colorScheme.primaryContainer,
                    contentColor = MaterialTheme.colorScheme.onPrimaryContainer
                )
            ) {
                Icon(Icons.Filled.MyLocation, contentDescription = null, modifier = Modifier.size(18.dp))
                Spacer(modifier = Modifier.width(VLSpacing.sm))
                Text("Use Auto GPS Location", style = MaterialTheme.typography.labelLarge)
            }

            Text(
                "Or enter location manually:",
                style = MaterialTheme.typography.labelMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                modifier = Modifier.padding(top = VLSpacing.sm)
            )

            // Manual Location Input
            OutlinedTextField(
                value = inputCity,
                onValueChange = { inputCity = it },
                placeholder = { Text("e.g. Delhi, Bangalore...") },
                modifier = Modifier.fillMaxWidth(),
                shape = VLShapes.medium,
                singleLine = true
            )

            Button(
                onClick = { onLocationSelect(inputCity) },
                modifier = Modifier.fillMaxWidth(),
                shape = VLShapes.medium,
                enabled = inputCity.isNotBlank()
            ) {
                Text("Apply Location", style = MaterialTheme.typography.labelLarge)
            }
        }
    }
}

