package com.arif.vl.core.extensions

import androidx.navigation.NavController

/**
 * Safe, non-blocking back navigation.
 * Executes popBackStack on the UI thread without blocking.
 */
fun NavController.safePopBackStack() {
    try {
        popBackStack()
    } catch (e: Exception) {
        e.printStackTrace()
    }
}

/**
 * Navigates without blocking the UI.
 * Use for immediate navigation feedback.
 */
fun NavController.safeNavigate(route: String) {
    try {
        navigate(route)
    } catch (e: Exception) {
        e.printStackTrace()
    }
}
