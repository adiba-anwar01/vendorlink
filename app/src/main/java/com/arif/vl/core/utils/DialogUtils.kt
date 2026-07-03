package com.arif.vl.core.utils

import androidx.activity.compose.BackHandler
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.ui.text.font.FontWeight

/**
 * Utility for handling back button in dialogs consistently.
 * 
 * Usage:
 * var showDialog by remember { mutableStateOf(false) }
 * 
 * DialogBackHandler(
 *     isShowing = showDialog,
 *     onDismiss = { showDialog = false }
 * )
 */
@Composable
fun DialogBackHandler(
    isShowing: Boolean,
    onDismiss: () -> Unit
) {
    if (isShowing) {
        BackHandler { onDismiss() }
    }
}

/**
 * Confirmation dialog with proper back button handling.
 * 
 * Usage:
 * ConfirmationDialog(
 *     isVisible = showDialog,
 *     title = "Discard changes?",
 *     message = "You have unsaved changes.",
 *     confirmText = "Discard",
 *     dismissText = "Keep Editing",
 *     onConfirm = { /* action */ },
 *     onDismiss = { /* close dialog */ }
 * )
 */
@Composable
fun ConfirmationDialog(
    isVisible: Boolean,
    title: String,
    message: String,
    confirmText: String = "Yes",
    dismissText: String = "No",
    isDestructive: Boolean = false,
    onConfirm: () -> Unit,
    onDismiss: () -> Unit
) {
    DialogBackHandler(isVisible) { onDismiss() }

    if (isVisible) {
        AlertDialog(
            onDismissRequest = onDismiss,
            title = {
                Text(
                    text = title,
                    fontWeight = FontWeight.SemiBold,
                    color = if (isDestructive) MaterialTheme.colorScheme.error
                           else MaterialTheme.colorScheme.onSurface
                )
            },
            text = {
                Text(
                    text = message,
                    style = MaterialTheme.typography.bodyMedium
                )
            },
            confirmButton = {
                TextButton(
                    onClick = {
                        onConfirm()
                        onDismiss()
                    }
                ) {
                    Text(
                        text = confirmText,
                        color = if (isDestructive) MaterialTheme.colorScheme.error
                               else MaterialTheme.colorScheme.primary
                    )
                }
            },
            dismissButton = {
                TextButton(onClick = onDismiss) {
                    Text(dismissText)
                }
            }
        )
    }
}

/**
 * Error dialog with back button handling.
 */
@Composable
fun ErrorDialog(
    isVisible: Boolean,
    title: String = "Error",
    message: String,
    onDismiss: () -> Unit
) {
    DialogBackHandler(isVisible) { onDismiss() }

    if (isVisible) {
        AlertDialog(
            onDismissRequest = onDismiss,
            title = {
                Text(
                    text = title,
                    fontWeight = FontWeight.SemiBold,
                    color = MaterialTheme.colorScheme.error
                )
            },
            text = {
                Text(
                    text = message,
                    style = MaterialTheme.typography.bodyMedium
                )
            },
            confirmButton = {
                TextButton(onClick = onDismiss) {
                    Text("OK")
                }
            }
        )
    }
}

/**
 * Info dialog with back button handling.
 */
@Composable
fun InfoDialog(
    isVisible: Boolean,
    title: String,
    message: String,
    onDismiss: () -> Unit
) {
    DialogBackHandler(isVisible) { onDismiss() }

    if (isVisible) {
        AlertDialog(
            onDismissRequest = onDismiss,
            title = {
                Text(
                    text = title,
                    fontWeight = FontWeight.SemiBold
                )
            },
            text = {
                Text(
                    text = message,
                    style = MaterialTheme.typography.bodyMedium
                )
            },
            confirmButton = {
                TextButton(onClick = onDismiss) {
                    Text("Got it")
                }
            }
        )
    }
}
