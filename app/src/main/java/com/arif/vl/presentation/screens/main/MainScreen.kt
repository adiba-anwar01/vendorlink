package com.arif.vl.presentation.screens.main

import androidx.activity.compose.BackHandler
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Scaffold
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.navigation.NavController
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import com.arif.vl.core.components.VLBottomNavigationBar
import com.arif.vl.navigation.NavRoutes
import com.arif.vl.presentation.screens.home.HomeScreen
import com.arif.vl.presentation.screens.messages.MessagesScreen
import com.arif.vl.presentation.screens.product.AddProductScreen
import com.arif.vl.presentation.screens.profile.UserProfileScreen

/**
 * Main shell: bottom navigation bar + tab content NavHost.
 *
 * Full-screen destinations (ProductDetails, VendorProfile, Conversation, Purchase)
 * live in the outer NavGraph so they render without the bottom bar.
 *
 * @param rootNavController  The root NavController used to navigate to
 *                           full-screen destinations and back to auth.
 * @param startTab           Optional tab route to switch to on first load
 *                           (e.g. "messages" when coming from OrderSuccessScreen).
 */
@Composable
fun MainScreen(
    rootNavController: NavController,
    startTab: String = NavRoutes.Home
) {
    // Inner NavController drives the tab content only
    val tabNavController = rememberNavController()
    val backStackEntry by tabNavController.currentBackStackEntryAsState()
    val currentRoute   = backStackEntry?.destination?.route

    // If caller specified a tab other than Home, navigate to it once
    LaunchedEffect(startTab) {
        if (startTab != NavRoutes.Home && startTab.isNotBlank()) {
            tabNavController.navigate(startTab) {
                popUpTo(tabNavController.graph.findStartDestination().id) {
                    saveState = true
                }
                launchSingleTop = true
                restoreState    = true
            }
        }
    }

    // Handle back button: navigate to Home tab if not already there, otherwise let root nav handle it
    BackHandler {
        if (currentRoute != NavRoutes.Home) {
            tabNavController.navigate(NavRoutes.Home) {
                popUpTo(tabNavController.graph.findStartDestination().id) {
                    saveState = true
                }
                launchSingleTop = true
                restoreState = true
            }
        } else {
            // Already on Home, let system handle back (exit)
            rootNavController.popBackStack()
        }
    }

    Scaffold(
        bottomBar = {
            VLBottomNavigationBar(
                currentRoute    = currentRoute,
                unreadMessages  = 3,          // replace with live count from MessagesViewModel
                onNavigate = { route ->
                    tabNavController.navigate(route) {
                        popUpTo(tabNavController.graph.findStartDestination().id) {
                            saveState = true
                        }
                        launchSingleTop = true
                        restoreState    = true
                    }
                }
            )
        }
    ) { innerPadding ->
        NavHost(
            navController    = tabNavController,
            startDestination = NavRoutes.Home,
            modifier         = Modifier.padding(innerPadding)
        ) {
            composable(NavRoutes.Home) {
                HomeScreen(navController = rootNavController)
            }
            composable(NavRoutes.Messages) {
                MessagesScreen(navController = rootNavController)
            }
            composable(NavRoutes.AddProduct) {
                AddProductScreen(navController = rootNavController)
            }
            composable(NavRoutes.Profile) {
                UserProfileScreen(navController = rootNavController)
            }
        }
    }
}
