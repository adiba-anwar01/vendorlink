package com.arif.vl.presentation.screens.wishlist

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.FavoriteBorder
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.navigation.NavController
import com.arif.vl.core.components.EmptyStateComponent
import com.arif.vl.core.components.ProductCard
import com.arif.vl.core.components.VLTopAppBar
import com.arif.vl.core.theme.VLSpacing
import com.arif.vl.data.model.Product
import com.arif.vl.navigation.NavRoutes


/**
 * Wishlist / Saved screen.
 * Currently uses a static subset of sample products as placeholder.
 * Wire up a WishlistViewModel once the bookmark state is persisted server-side.
 */
@Composable
fun WishlistScreen(navController: NavController) {
    // TODO: Wire up to WishlistViewModel once server-side bookmarks are implemented
    val savedProducts: List<Product> = remember { emptyList() }

    Scaffold(
        topBar = {
            VLTopAppBar(
                title          = "Saved",
                showBackButton = true,
                onBackClick    = { navController.popBackStack() }
            )
        }
    ) { innerPadding ->
        if (savedProducts.isEmpty()) {
            EmptyStateComponent(
                modifier  = Modifier.padding(innerPadding),
                icon      = Icons.Outlined.FavoriteBorder,
                message   = "No saved items",
                subtitle  = "Tap the bookmark icon on any product to save it here"
            )
        } else {
            LazyVerticalGrid(
                columns        = GridCells.Fixed(2),
                modifier       = Modifier
                    .fillMaxSize()
                    .padding(innerPadding),
                contentPadding = PaddingValues(VLSpacing.md),
                horizontalArrangement = Arrangement.spacedBy(VLSpacing.sm),
                verticalArrangement   = Arrangement.spacedBy(VLSpacing.sm)
            ) {
                item(span = { GridItemSpan(maxLineSpan) }) {
                    Text(
                        "${savedProducts.size} saved items",
                        style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.SemiBold),
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
                items(savedProducts, key = { it.id }) { product ->
                    ProductCard(
                        product = product,
                        onClick = { navController.navigate(NavRoutes.productDetails(product.id)) }
                    )
                }
            }
        }
    }
}
