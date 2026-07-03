package com.arif.vl.presentation.screens.purchase

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.ChevronRight
import androidx.compose.material.icons.outlined.LocalShipping
import androidx.compose.material.icons.outlined.Payment
import androidx.compose.material.icons.outlined.Store
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavController
import coil.compose.AsyncImage
import com.arif.vl.core.components.LoadingIndicator
import com.arif.vl.core.components.PrimaryButton
import com.arif.vl.core.components.VLTopAppBar
import com.arif.vl.core.theme.VLShapes
import com.arif.vl.core.theme.VLSpacing
import com.arif.vl.navigation.NavRoutes
import com.arif.vl.presentation.viewmodel.OrderViewModel
import com.arif.vl.presentation.viewmodel.ProductViewModel

/**
 * Purchase screen – order summary before confirming a purchase.
 * Now connected to real product data and order API.
 * Handles both:
 * - Direct "Buy Now" from product details
 * - "Proceed to Buy" after accepting negotiated offer
 * 
 * @param productId Product to purchase
 * @param negotiatedPrice Optional negotiated price from conversation (null = direct buy)
 */
@Composable
fun PurchaseScreen(
    productId: String,
    negotiatedPrice: Double? = null,
    navController: NavController,
    productViewModel: ProductViewModel = hiltViewModel(),
    orderViewModel: OrderViewModel = hiltViewModel()
) {
    val productState by productViewModel.uiState.collectAsState()
    val orderState by orderViewModel.uiState.collectAsState()

    // Load product data
    LaunchedEffect(productId) { productViewModel.loadProduct(productId) }

    // Navigate to success on order placed
    LaunchedEffect(orderState.selectedOrder) {
        orderState.selectedOrder?.let { order ->
            val title = order.product?.title ?: "Product"
            navController.navigate(NavRoutes.orderSuccess(title)) {
                popUpTo(NavRoutes.Purchase) { inclusive = true }
            }
            orderViewModel.clearSuccess()
        }
    }

    // Form fields for order
    var deliveryAddress by remember { mutableStateOf("") }
    var phoneNumber by remember { mutableStateOf("") }
    var notes by remember { mutableStateOf("") }
    var showFormError by remember { mutableStateOf(false) }

    if (productState.isLoading) { LoadingIndicator(); return }

    val product = productState.product
    if (product == null) {
        Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            Text("Product not found", style = MaterialTheme.typography.bodyMedium)
        }
        return
    }

    // Check if product is sold out
    if (product.status == "sold") {
        Box(
            modifier = Modifier.fillMaxSize(),
            contentAlignment = Alignment.Center
        ) {
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                modifier = Modifier.padding(VLSpacing.lg)
            ) {
                Text(
                    text = "Oops! This item has been sold out.",
                    style = MaterialTheme.typography.titleLarge,
                    modifier = Modifier.padding(bottom = VLSpacing.md)
                )
                Text(
                    text = "${product.title} was purchased by another buyer.",
                    style = MaterialTheme.typography.bodyLarge,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    modifier = Modifier.padding(bottom = VLSpacing.lg)
                )
                Button(
                    onClick = {
                        navController.popBackStack()
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(48.dp)
                ) {
                    Text("Go Back")
                }
                Spacer(Modifier.height(VLSpacing.sm))
                OutlinedButton(
                    onClick = {
                        navController.navigate(NavRoutes.Main) {
                            popUpTo(0) { inclusive = true }
                        }
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(48.dp)
                ) {
                    Text("Find Similar Items")
                }
            }
        }
        return
    }

    val displayPrice = negotiatedPrice ?: product.price
    val formattedPrice = "₹${displayPrice.toLong()}"
    val priceLabel = if (negotiatedPrice != null) "Negotiated Price" else "Item price"
    val buttonText = if (negotiatedPrice != null) "Buy at Negotiated Price" else "Confirm Purchase"
    val images = product.imageUrls.ifEmpty { listOf("https://picsum.photos/seed/$productId/400/300") }

    Scaffold(
        topBar = {
            VLTopAppBar(
                title          = "Confirm Purchase",
                showBackButton = true,
                onBackClick    = { navController.popBackStack() }
            )
        },
        bottomBar = {
            Surface(shadowElevation = 12.dp) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .navigationBarsPadding()
                        .padding(VLSpacing.md)
                ) {
                    // Error message
                    if (orderState.error != null) {
                        Text(
                            text = orderState.error ?: "",
                            color = MaterialTheme.colorScheme.error,
                            style = MaterialTheme.typography.bodySmall,
                            modifier = Modifier.padding(bottom = VLSpacing.xs)
                        )
                        if (orderState.duplicateOrderExists) {
                            TextButton(
                                onClick = {
                                    navController.navigate(NavRoutes.main(NavRoutes.Profile)) {
                                        popUpTo(NavRoutes.Main) {
                                            inclusive = true
                                        }
                                    }
                                },
                                modifier = Modifier.padding(bottom = VLSpacing.xs)
                            ) {
                                Text("View My Orders")
                            }
                        }
                        if (orderState.productSoldOut) {
                            TextButton(
                                onClick = {
                                    navController.navigate(NavRoutes.Main) {
                                        popUpTo(0) { inclusive = true }
                                    }
                                },
                                modifier = Modifier.padding(bottom = VLSpacing.xs)
                            ) {
                                Text("Browse Similar Items")
                            }
                        }
                    }
                    PrimaryButton(
                        text     = if (orderState.orderPlacing) "Placing Order…" else buttonText,
                        onClick  = {
                            if (deliveryAddress.isBlank() || phoneNumber.isBlank()) {
                                showFormError = true
                                return@PrimaryButton
                            }
                            if (!phoneNumber.trim().matches(Regex("^\\d{10}$"))) {
                                showFormError = true
                                return@PrimaryButton
                            }
                            showFormError = false
                            orderViewModel.placeOrder(
                                productId = productId,
                                deliveryAddress = deliveryAddress.trim(),
                                phoneNumber = phoneNumber.trim(),
                                notes = notes.ifBlank { null }
                            )
                        },
                        enabled  = !orderState.orderPlacing,
                        modifier = Modifier.fillMaxWidth()
                    )
                }
            }
        }
    ) { innerPadding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding),
            contentPadding = PaddingValues(bottom = VLSpacing.xxl)
        ) {

            // ── Product summary card ──────────────────────────────────────────
            item {
                Spacer(Modifier.height(VLSpacing.md))
                Text(
                    text     = "Order Summary",
                    style    = MaterialTheme.typography.titleMedium,
                    modifier = Modifier.padding(horizontal = VLSpacing.md)
                )
                Spacer(Modifier.height(VLSpacing.sm))
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = VLSpacing.md),
                    shape  = VLShapes.medium,
                    colors = CardDefaults.cardColors(
                        containerColor = MaterialTheme.colorScheme.surfaceVariant
                    ),
                    elevation = CardDefaults.cardElevation(0.dp)
                ) {
                    Row(
                        modifier = Modifier.padding(VLSpacing.md),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(VLSpacing.md)
                    ) {
                        Box(
                            modifier = Modifier
                                .size(80.dp)
                                .clip(VLShapes.medium)
                                .background(MaterialTheme.colorScheme.outline)
                        ) {
                            AsyncImage(
                                model              = images.first(),
                                contentDescription = product.title,
                                contentScale       = ContentScale.Crop,
                                modifier           = Modifier.fillMaxSize()
                            )
                        }
                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text  = product.title,
                                style = MaterialTheme.typography.titleSmall,
                                maxLines = 2
                            )
                            Spacer(Modifier.height(VLSpacing.xs))
                            Surface(
                                shape = VLShapes.extraSmall,
                                color = MaterialTheme.colorScheme.surface
                            ) {
                                Text(
                                    text  = product.condition.ifBlank { "Used" },
                                    style = MaterialTheme.typography.labelSmall,
                                    modifier = Modifier.padding(horizontal = VLSpacing.xs, vertical = 2.dp)
                                )
                            }
                            Spacer(Modifier.height(VLSpacing.xs))
                            
                            if (negotiatedPrice != null) {
                                Surface(
                                    shape = VLShapes.extraSmall,
                                    color = MaterialTheme.colorScheme.inversePrimary
                                ) {
                                    Text(
                                        text  = "₹${negotiatedPrice.toLong()} (Negotiated)",
                                        style = MaterialTheme.typography.labelSmall,
                                        modifier = Modifier.padding(horizontal = VLSpacing.xs, vertical = 2.dp)
                                    )
                                }
                            } else {
                                Text(
                                    text  = formattedPrice,
                                    style = MaterialTheme.typography.titleMedium
                                )
                            }
                        }
                    }
                }
            }

            // ── Seller info ───────────────────────────────────────────────────
            item {
                Spacer(Modifier.height(VLSpacing.lg))
                SectionLabel("Seller")
                InfoRow(
                    icon  = Icons.Outlined.Store,
                    label = product.vendorName.ifBlank { "Seller" },
                    value = product.category.ifBlank { "VendorLink" }
                )
            }

            // ── Delivery details form ──────────────────────────────────────────
            item {
                Spacer(Modifier.height(VLSpacing.md))
                SectionLabel("Delivery Details")
                Column(
                    modifier = Modifier.padding(horizontal = VLSpacing.md),
                    verticalArrangement = Arrangement.spacedBy(VLSpacing.sm)
                ) {
                    OutlinedTextField(
                        value = deliveryAddress,
                        onValueChange = { deliveryAddress = it },
                        label = { Text("Delivery Address *") },
                        placeholder = { Text("Enter your full delivery address") },
                        modifier = Modifier.fillMaxWidth(),
                        isError = showFormError && deliveryAddress.isBlank(),
                        minLines = 2,
                        maxLines = 3
                    )
                    OutlinedTextField(
                        value = phoneNumber,
                        onValueChange = { phoneNumber = it.filter { c -> c.isDigit() }.take(10) },
                        label = { Text("Phone Number *") },
                        placeholder = { Text("10-digit mobile number") },
                        modifier = Modifier.fillMaxWidth(),
                        isError = showFormError && (phoneNumber.isBlank() || !phoneNumber.matches(Regex("^\\d{10}$"))),
                        singleLine = true
                    )
                    OutlinedTextField(
                        value = notes,
                        onValueChange = { notes = it },
                        label = { Text("Notes (optional)") },
                        placeholder = { Text("Any special instructions...") },
                        modifier = Modifier.fillMaxWidth(),
                        minLines = 2,
                        maxLines = 3
                    )
                    if (showFormError) {
                        Text(
                            text = "Please fill in delivery address and a valid 10-digit phone number",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.error
                        )
                    }
                }
            }

            // ── Info about seller's acceptance if negotiated ───────────────────
            if (negotiatedPrice != null) {
                item {
                    Spacer(Modifier.height(VLSpacing.md))
                    Surface(
                        color = MaterialTheme.colorScheme.inversePrimary.copy(alpha = 0.1f),
                        shape = VLShapes.medium,
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = VLSpacing.md)
                    ) {
                        Row(
                            modifier = Modifier.padding(VLSpacing.md),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(VLSpacing.sm)
                        ) {
                            Text(
                                text = "✓ Seller has accepted your offer",
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.primary
                            )
                        }
                    }
                }
            }

            // ── Price breakdown ───────────────────────────────────────────────
            item {
                Spacer(Modifier.height(VLSpacing.lg))
                HorizontalDivider(
                    modifier = Modifier.padding(horizontal = VLSpacing.md),
                    color    = MaterialTheme.colorScheme.outlineVariant
                )
                Spacer(Modifier.height(VLSpacing.md))
                Column(modifier = Modifier.padding(horizontal = VLSpacing.md)) {
                    PriceRow(label = priceLabel, value = formattedPrice)
                    PriceRow(label = "Delivery",   value = "Free")
                    PriceRow(label = "VL Fee",     value = "₹0")
                    Spacer(Modifier.height(VLSpacing.sm))
                    HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant)
                    Spacer(Modifier.height(VLSpacing.sm))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text("Total", style = MaterialTheme.typography.titleMedium)
                        Text(formattedPrice, style = MaterialTheme.typography.titleMedium)
                    }
                }
            }
        }
    }
}

// ── Small helper composables ──────────────────────────────────────────────────
@Composable
private fun SectionLabel(text: String) {
    Text(
        text     = text,
        style    = MaterialTheme.typography.titleSmall,
        modifier = Modifier.padding(horizontal = VLSpacing.md, vertical = VLSpacing.xs)
    )
}

@Composable
private fun InfoRow(icon: ImageVector, label: String, value: String) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = VLSpacing.md, vertical = VLSpacing.sm),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(VLSpacing.md)
    ) {
        Icon(icon, contentDescription = null, modifier = Modifier.size(22.dp))
        Column(modifier = Modifier.weight(1f)) {
            Text(label, style = MaterialTheme.typography.bodyMedium)
            Text(value, style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant)
        }
    }
}

@Composable
private fun PriceRow(label: String, value: String) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Text(
            text  = label,
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )
        Text(
            text  = value,
            style = MaterialTheme.typography.bodyMedium
        )
    }
}
