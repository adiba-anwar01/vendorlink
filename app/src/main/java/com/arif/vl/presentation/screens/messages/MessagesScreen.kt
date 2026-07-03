package com.arif.vl.presentation.screens.messages

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavController
import com.arif.vl.core.components.LoadingIndicator
import com.arif.vl.core.components.VLTopAppBar
import com.arif.vl.core.theme.VLSpacing
import com.arif.vl.data.model.Conversation
import com.arif.vl.navigation.NavRoutes
import com.arif.vl.presentation.viewmodel.ConversationOfferSummary
import com.arif.vl.presentation.viewmodel.MessagesViewModel

/**
 * Messages screen – clean list of conversations from API.
 * Simple, natural design with WhatsApp-inspired layout.
 */
@Composable
fun MessagesScreen(
    navController: NavController,
    viewModel: MessagesViewModel = hiltViewModel()
) {
    val state by viewModel.uiState.collectAsState()

    // Load conversations on first show only
    LaunchedEffect(Unit) {
        viewModel.loadConversations()
    }

    Scaffold(
        topBar = {
            VLTopAppBar(
                title = "Messages",
                actions = {
                    IconButton(onClick = { viewModel.loadConversations() }) {
                        Icon(Icons.Filled.Refresh, contentDescription = "Refresh")
                    }
                }
            )
        }
    ) { innerPadding ->
        when {
            state.isLoading -> {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(innerPadding),
                    contentAlignment = Alignment.Center
                ) {
                    LoadingIndicator()
                }
            }
            state.error != null && state.conversations.isEmpty() -> {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(innerPadding),
                    contentAlignment = Alignment.Center
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text(
                            state.error ?: "Failed to load conversations",
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.error
                        )
                        Spacer(Modifier.height(VLSpacing.sm))
                        TextButton(onClick = { viewModel.loadConversations() }) {
                            Text("Retry")
                        }
                    }
                }
            }
            state.conversations.isEmpty() -> {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(innerPadding),
                    contentAlignment = Alignment.Center
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text("No conversations yet", style = MaterialTheme.typography.titleMedium)
                        Spacer(Modifier.height(VLSpacing.xs))
                        Text(
                            "Browse products and message a vendor to get started",
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
            }
            else -> {
                LazyColumn(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(innerPadding),
                    reverseLayout = false
                ) {
                    itemsIndexed(state.conversations.sortedByDescending { it.updatedAt ?: it.createdAt }) { index, conv ->

                        ConversationRow(
                            conversation = conv,
                            currentUserId = state.currentUserId,
                            latestOffer = state.latestOffers[conv.id],
                            onClick = {
                                val productId = conv.product?.id ?: return@ConversationRow
                                val conversationId = conv.id
                                navController.navigate(
                                    NavRoutes.conversationFromInbox(productId, conversationId)
                                )
                            },
                            onDelete = {
                                viewModel.deleteConversation(conv.id)
                            },
                            onAcceptOffer = {
                                viewModel.acceptConversation(conv.id)
                            }
                        )
                        if (index < state.conversations.lastIndex) {
                            HorizontalDivider(
                                modifier = Modifier.padding(start = 72.dp),
                                color = MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.3f)
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun ConversationRow(
    conversation: Conversation,
    currentUserId: String?,
    latestOffer: ConversationOfferSummary?,
    onClick: () -> Unit,
    onDelete: () -> Unit = {},
    onAcceptOffer: () -> Unit = {}
) {
    var showDeleteDialog by remember { mutableStateOf(false) }
    val isSellerView = conversation.seller?.id == currentUserId
    val canAcceptLatestOffer = isSellerView &&
        conversation.status == "active" &&
        latestOffer != null &&
        latestOffer.senderId != null &&
        latestOffer.senderId != currentUserId
    
    if (showDeleteDialog) {
        AlertDialog(
            onDismissRequest = { showDeleteDialog = false },
            title = { Text("Delete Conversation?") },
            text = { Text("This action cannot be undone.") },
            confirmButton = {
                Button(onClick = { 
                    onDelete()
                    showDeleteDialog = false
                }, colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.error)) {
                    Text("Delete")
                }
            },
            dismissButton = {
                TextButton(onClick = { showDeleteDialog = false }) {
                    Text("Cancel")
                }
            }
        )
    }

    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick)
            .padding(horizontal = VLSpacing.md, vertical = VLSpacing.sm),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(VLSpacing.md)
    ) {
        // Avatar
        Box(
            modifier = Modifier
                .size(48.dp)
                .clip(CircleShape)
                .background(MaterialTheme.colorScheme.primary.copy(alpha = 0.2f)),
            contentAlignment = Alignment.Center
        ) {
            Text(
                text = conversation.seller?.name?.take(1)?.uppercase()
                    ?: conversation.buyer?.name?.take(1)?.uppercase()
                    ?: "?",
                style = MaterialTheme.typography.titleSmall,
                color = MaterialTheme.colorScheme.primary,
                fontWeight = FontWeight.Bold
            )
        }

        // Text info
        Column(modifier = Modifier.weight(1f)) {
            val otherName = conversation.seller?.name ?: conversation.buyer?.name ?: "Unknown"
            val productTitle = conversation.product?.title ?: "Unknown Product"
            val timeText = remember(conversation.updatedAt ?: conversation.createdAt) {
                formatRelativeTime(conversation.updatedAt ?: conversation.createdAt)
            }
            val statusText = when (conversation.status) {
                "accepted" -> latestOffer?.let { "Accepted at ₹${it.offerPrice.toLong()}" } ?: "Accepted"
                "rejected" -> "Rejected"
                else -> "Open"
            }

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = otherName,
                    style = MaterialTheme.typography.titleSmall,
                    color = MaterialTheme.colorScheme.onSurface,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis,
                    modifier = Modifier.weight(1f),
                    fontWeight = FontWeight.SemiBold
                )
                Text(
                    text = timeText,
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    fontSize = 12.sp
                )
            }
            Spacer(Modifier.height(4.dp))
            
            Text(
                text = productTitle,
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurface,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis,
                fontSize = 12.sp
            )
            Spacer(Modifier.height(4.dp))

            latestOffer?.let { offer ->
                Text(
                    text = when {
                        conversation.status == "accepted" -> "Deal price: ₹${offer.offerPrice.toLong()}"
                        canAcceptLatestOffer -> "Latest offer: ₹${offer.offerPrice.toLong()}"
                        else -> "Negotiated: ₹${offer.offerPrice.toLong()}"
                    },
                    style = MaterialTheme.typography.labelMedium,
                    color = MaterialTheme.colorScheme.primary,
                    fontWeight = FontWeight.SemiBold
                )
                Spacer(Modifier.height(6.dp))
            }
            
            Surface(
                color = when (conversation.status) {
                    "accepted" -> MaterialTheme.colorScheme.inversePrimary.copy(alpha = 0.5f)
                    "rejected" -> MaterialTheme.colorScheme.errorContainer.copy(alpha = 0.5f)
                    else -> MaterialTheme.colorScheme.surfaceVariant
                },
                shape = MaterialTheme.shapes.extraSmall,
                modifier = Modifier.clip(MaterialTheme.shapes.extraSmall)
            ) {
                Text(
                    text = statusText,
                    style = MaterialTheme.typography.labelSmall,
                    fontSize = 11.sp,
                    color = MaterialTheme.colorScheme.onSurface,
                    modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp),
                    fontWeight = FontWeight.Medium
                )
            }

            if (canAcceptLatestOffer) {
                Spacer(Modifier.height(8.dp))
                latestOffer?.let { offer ->
                    Button(
                        onClick = onAcceptOffer,
                        contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp)
                    ) {
                        Text("Accept ₹${offer.offerPrice.toLong()}")
                    }
                }
            }
        }
        
        // Delete button
        IconButton(onClick = { showDeleteDialog = true }, modifier = Modifier.size(32.dp)) {
            Icon(Icons.Filled.Delete, contentDescription = "Delete", 
                tint = MaterialTheme.colorScheme.error, modifier = Modifier.size(18.dp))
        }
    }
}

/**
 * Format an ISO date string to relative time (e.g., "2m ago", "1h ago", "3d ago")
 */
private fun formatRelativeTime(isoString: String): String {
    return try {
        val formats = arrayOf(
            java.text.SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", java.util.Locale.US),
            java.text.SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'", java.util.Locale.US)
        )
        var date: java.util.Date? = null
        for (fmt in formats) {
            fmt.timeZone = java.util.TimeZone.getTimeZone("UTC")
            try { date = fmt.parse(isoString); break } catch (_: Exception) {}
        }
        if (date == null) return isoString

        val diff = System.currentTimeMillis() - date.time
        val mins = diff / 60000
        when {
            mins < 1 -> "now"
            mins < 60 -> "${mins}m"
            mins < 1440 -> "${mins / 60}h"
            mins < 10080 -> "${mins / 1440}d"
            else -> {
                val sdf = java.text.SimpleDateFormat("MMM d", java.util.Locale.US)
                sdf.format(date)
            }
        }
    } catch (_: Exception) {
        isoString
    }
}
