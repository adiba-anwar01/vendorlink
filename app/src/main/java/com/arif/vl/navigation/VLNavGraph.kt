package com.arif.vl.navigation

import androidx.activity.ComponentActivity
import androidx.activity.compose.BackHandler
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.platform.LocalContext
import androidx.navigation.NavHostController
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import com.arif.vl.core.utils.ConfirmationDialog
import com.arif.vl.presentation.screens.auth.ForgotPasswordScreen
import com.arif.vl.presentation.screens.auth.LoginScreen
import com.arif.vl.presentation.screens.auth.SignupScreen
import com.arif.vl.presentation.screens.conversation.ConversationScreen
import com.arif.vl.presentation.screens.main.MainScreen
import com.arif.vl.presentation.screens.order.OrderSuccessScreen
import com.arif.vl.presentation.screens.product.ProductDetailsScreen
import com.arif.vl.presentation.screens.purchase.PurchaseScreen
import com.arif.vl.presentation.screens.splash.SplashScreen
import com.arif.vl.presentation.screens.vendor.VendorProfileScreen
import com.arif.vl.presentation.screens.wishlist.WishlistScreen

/**
 * Root navigation graph.
 *
 * ┌─ Splash
 * ├─ Login / Signup / ForgotPassword        (auth flow)
 * ├─ Main  ──────────────────────────────── (tab shell with BottomNav)
 * │    ├─ Home
 * │    ├─ Messages
 * │    ├─ AddProduct
 * │    └─ Profile
 * ├─ ProductDetails/{productId}             (full-screen, no bottom bar)
 * ├─ VendorProfile/{vendorId}              (full-screen, no bottom bar)
 * ├─ Conversation/{productId}/{vendorId}   (full-screen, no bottom bar)
 * └─ Purchase/{productId}                  (full-screen, no bottom bar)
 */
@Composable
fun VLNavGraph(
    navController: NavHostController = rememberNavController()
) {
    val backStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = backStackEntry?.destination?.route ?: NavRoutes.Splash
    
    var showExitDialog by remember { mutableStateOf(false) }
    val context = LocalContext.current

    // Show exit confirmation when trying to exit from main app screens
    BackHandler {
        // Show exit dialog for auth screens and main app
        if (currentRoute != NavRoutes.Splash) {
            showExitDialog = true
        }
    }

    NavHost(
        navController    = navController,
        startDestination = NavRoutes.Splash
    ) {

        // ── Splash ────────────────────────────────────────────────────────────
        composable(NavRoutes.Splash) {
            SplashScreen(navController = navController)
        }

        // ── Auth ──────────────────────────────────────────────────────────────
        composable(NavRoutes.Login) {
            LoginScreen(navController = navController)
        }
        composable(NavRoutes.Signup) {
            SignupScreen(navController = navController)
        }
        composable(NavRoutes.ForgotPassword) {
            ForgotPasswordScreen(navController = navController)
        }

        // ── Main shell (bottom nav + tabs) ────────────────────────────────────
        composable(
            route     = NavRoutes.MainRoute,
            arguments = listOf(
                navArgument("startTab") {
                    type         = NavType.StringType
                    defaultValue = "home"
                }
            )
        ) { backStackEntry ->
            val startTab = backStackEntry.arguments?.getString("startTab") ?: "home"
            MainScreen(rootNavController = navController, startTab = startTab)
        }

        // ── Full-screen destinations (no bottom bar) ──────────────────────────
        composable(
            route     = NavRoutes.ProductDetails,
            arguments = listOf(navArgument("productId") { type = NavType.StringType })
        ) { backStackEntry ->
            ProductDetailsScreen(
                productId     = backStackEntry.arguments?.getString("productId") ?: "",
                navController = navController
            )
        }

        composable(
            route     = NavRoutes.VendorProfile,
            arguments = listOf(navArgument("vendorId") { type = NavType.StringType })
        ) { backStackEntry ->
            VendorProfileScreen(
                vendorId      = backStackEntry.arguments?.getString("vendorId") ?: "",
                navController = navController
            )
        }

        composable(
            route     = NavRoutes.Conversation,
            arguments = listOf(
                navArgument("productId") { type = NavType.StringType },
                navArgument("vendorId")  { type = NavType.StringType }
            )
        ) { backStackEntry ->
            ConversationScreen(
                productId     = backStackEntry.arguments?.getString("productId") ?: "",
                vendorId      = backStackEntry.arguments?.getString("vendorId") ?: "",
                conversationId = null,
                navController = navController
            )
        }

        composable(
            route     = NavRoutes.ConversationFromInbox,
            arguments = listOf(
                navArgument("productId") { type = NavType.StringType },
                navArgument("conversationId")  { type = NavType.StringType }
            )
        ) { backStackEntry ->
            ConversationScreen(
                productId     = backStackEntry.arguments?.getString("productId") ?: "",
                vendorId      = "", // Not needed from inbox
                conversationId = backStackEntry.arguments?.getString("conversationId") ?: "",
                navController = navController
            )
        }

        composable(
            route     = NavRoutes.Purchase,
            arguments = listOf(
                navArgument("productId") { type = NavType.StringType },
                navArgument("negotiatedPrice") { 
                    type         = NavType.FloatType
                    defaultValue = -1f  // -1 indicates no negotiated price
                }
            )
        ) { backStackEntry ->
            val negotiatedPriceFloat = backStackEntry.arguments?.getFloat("negotiatedPrice") ?: -1f
            val negotiatedPrice = if (negotiatedPriceFloat > 0) negotiatedPriceFloat.toDouble() else null
            
            PurchaseScreen(
                productId        = backStackEntry.arguments?.getString("productId") ?: "",
                negotiatedPrice  = negotiatedPrice,
                navController    = navController
            )
        }

        // ── Order Success ────────────────────────────────────────────────
        composable(
            route     = NavRoutes.OrderSuccess,
            arguments = listOf(navArgument("productTitle") { type = NavType.StringType })
        ) { backStackEntry ->
            OrderSuccessScreen(
                productTitle  = backStackEntry.arguments?.getString("productTitle") ?: "",
                navController = navController
            )
        }

        // ── Wishlist ─────────────────────────────────────────────────────
        composable(NavRoutes.Wishlist) {
            WishlistScreen(navController = navController)
        }
    }

    // Exit confirmation dialog
    ConfirmationDialog(
        isVisible = showExitDialog,
        title = "Exit App?",
        message = "Are you sure you want to exit the app?",
        confirmText = "Exit",
        dismissText = "Cancel",
        isDestructive = true,
        onConfirm = {
            // Exit the app by finishing the activity
            (context as? ComponentActivity)?.finish()
        },
        onDismiss = {
            showExitDialog = false
        }
    )
}
