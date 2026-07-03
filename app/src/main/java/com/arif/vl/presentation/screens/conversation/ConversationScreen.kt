package com.arif.vl.presentation.screens.conversation

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.automirrored.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalSoftwareKeyboardController
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavController
import coil.compose.AsyncImage
import com.arif.vl.core.components.LoadingIndicator
import com.arif.vl.core.theme.VLShapes
import com.arif.vl.core.theme.VLSpacing
import com.arif.vl.data.model.Message
import com.arif.vl.data.model.Product
import com.arif.vl.navigation.NavRoutes
import com.arif.vl.presentation.viewmodel.ConversationViewModel
import com.arif.vl.presentation.viewmodel.MessagesViewModel
import kotlinx.coroutines.launch

/**
 * Conversation screen – clean, performant chat UI between buyer and vendor.
 * Optimized for performance with theme-consistent styling.
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ConversationScreen(
    productId: String,
    vendorId: String,
    conversationId: String? = null,
    navController: NavController,
    viewModel: ConversationViewModel = hiltViewModel(),
    messagesViewModel: MessagesViewModel = hiltViewModel()
) {
    val state by viewModel.uiState.collectAsState()
    var inputText by remember { mutableStateOf("") }
    var showOfferSheet by remember { mutableStateOf(false) }
    var offerAmount by remember { mutableStateOf("") }
    var showMenuSheet by remember { mutableStateOf(false) }
    val listState = rememberLazyListState()


    LaunchedEffect(productId, conversationId) {
        viewModel.initialize(productId, conversationId)
    }

    // Auto-scroll to latest message when new messages arrive
    val scope = rememberCoroutineScope()
    LaunchedEffect(state.messages.size) {
        if (state.messages.isNotEmpty()) {
            scope.launch {
                listState.animateScrollToItem(state.messages.lastIndex + 1)
            }
        }
    }

    val isCurrentUserBuyer = state.currentUserId != null &&
        state.product?.vendorId != state.currentUserId
    val isCurrentUserSeller = state.currentUserId != null &&
        state.product?.vendorId == state.currentUserId

    // ── Offer / Counter Offer Dialog ──────────────────────────────────────────
    if (showOfferSheet) {
        val dialogTitle = if (isCurrentUserSeller) "Counter Offer" else "Make an Offer"
        val dialogSubtitle = if (isCurrentUserSeller) "Enter your counter offer price" else "Enter your offer price"
        AlertDialog(
            onDismissRequest = { showOfferSheet = false },
            title = { Text(dialogTitle) },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(VLSpacing.md)) {
                    Text(dialogSubtitle, style = MaterialTheme.typography.bodyMedium)
                    OutlinedTextField(
                        value = offerAmount,
                        onValueChange = { offerAmount = it },
                        label = { Text("Price in ₹") },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                        modifier = Modifier.fillMaxWidth()
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        val price = offerAmount.toDoubleOrNull()
                        if (price != null && price > 0) {
                            viewModel.sendOffer(price)
                            state.conversationId?.let { messagesViewModel.moveConversationToTop(it) }
                            offerAmount = ""
                            showOfferSheet = false
                        }
                    }
                ) {
                    Text("Send Offer")
                }
            },
            dismissButton = {
                TextButton(onClick = { showOfferSheet = false }) {
                    Text("Cancel")
                }
            }
        )
    }

    // ── More Options Menu ─────────────────────────────────────────────────────
    if (showMenuSheet) {
        ModalBottomSheet(
            onDismissRequest = { showMenuSheet = false },
            sheetState = rememberModalBottomSheetState()
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(VLSpacing.md)
            ) {
                // Clear Chat
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable(enabled = true) {
                            viewModel.clearMessages()
                            showMenuSheet = false
                        }
                        .padding(VLSpacing.md),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(VLSpacing.md)
                ) {
                    Icon(Icons.Filled.Delete, contentDescription = null, 
                        tint = MaterialTheme.colorScheme.error)
                    Text("Clear Chat")
                }

                HorizontalDivider()

                // Block User
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable(enabled = true) {}
                        .padding(VLSpacing.md),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(VLSpacing.md)
                ) {
                    Icon(Icons.Filled.Block, contentDescription = null,
                        tint = MaterialTheme.colorScheme.error)
                    Text("Block User")
                }

                Spacer(Modifier.height(VLSpacing.lg))
            }
        }
    }

    if (state.isLoading) { 
        LoadingIndicator()
        return 
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text(
                            state.sellerName.ifBlank { "Chat" },
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.SemiBold
                        )
                        Text(
                            if (state.isOnline) "Online" else "Offline",
                            style = MaterialTheme.typography.labelSmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                },
                navigationIcon = {
                    IconButton(onClick = { navController.popBackStack() }) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
                    }
                },
                actions = {
                    IconButton(onClick = { showMenuSheet = true }) {
                        Icon(Icons.Filled.MoreVert, contentDescription = "More")
                    }
                }
            )
        },
        bottomBar = {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(MaterialTheme.colorScheme.surface)
                    .imePadding()
                    .navigationBarsPadding()
            ) {
                // Action buttons based on role and status
                when {
                    // Buyer in open conversation — can make offers
                    isCurrentUserBuyer && state.conversationStatus == "active" -> {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(VLSpacing.sm),
                            horizontalArrangement = Arrangement.spacedBy(VLSpacing.xs)
                        ) {
                            OutlinedButton(
                                onClick = { showOfferSheet = true },
                                modifier = Modifier.weight(1f)
                            ) {
                                Text("Make Offer")
                            }
                        }
                    }
                    // Seller in active conversation — can counter offer or accept
                    isCurrentUserSeller && state.conversationStatus == "active" -> {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(VLSpacing.sm),
                            horizontalArrangement = Arrangement.spacedBy(VLSpacing.xs)
                        ) {
                            OutlinedButton(
                                onClick = { showOfferSheet = true },
                                modifier = Modifier.weight(1f)
                            ) {
                                Text("Counter Offer")
                            }
                            Button(
                                onClick = { viewModel.acceptConversation() },
                                modifier = Modifier.weight(1f)
                            ) {
                                Icon(Icons.Filled.Check, null, modifier = Modifier.size(16.dp))
                                Spacer(Modifier.width(4.dp))
                                Text("Accept")
                            }
                        }
                    }
                    // Buyer after acceptance — can proceed to buy
                    isCurrentUserBuyer && state.conversationStatus == "accepted" -> {
                        val offerPrice = state.latestOfferPrice
                        val priceText = if (offerPrice != null) " at ₹${offerPrice.toLong()}" else ""
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(VLSpacing.sm)
                        ) {
                            Button(
                                onClick = {
                                    state.product?.id?.let { productId ->
                                        navController.navigate(
                                            NavRoutes.purchase(productId, offerPrice)
                                        )
                                    }
                                },
                                modifier = Modifier.fillMaxWidth(),
                                colors = ButtonDefaults.buttonColors(
                                    containerColor = MaterialTheme.colorScheme.primary
                                )
                            ) {
                                Icon(Icons.Filled.ShoppingCart, null, modifier = Modifier.size(18.dp))
                                Spacer(Modifier.width(8.dp))
                                Text("Proceed to Buy$priceText")
                            }
                        }
                    }
                    // Seller after acceptance — waiting for buyer
                    isCurrentUserSeller && state.conversationStatus == "accepted" -> {
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(VLSpacing.md)
                                .background(MaterialTheme.colorScheme.inversePrimary.copy(alpha = 0.3f), RoundedCornerShape(8.dp))
                                .padding(VLSpacing.md),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = "✓ Offer accepted. Waiting for buyer to complete purchase.",
                                style = MaterialTheme.typography.bodyMedium,
                                color = MaterialTheme.colorScheme.onSurface
                            )
                        }
                    }
                }

                // Message input — show for open conversations only
                if (state.conversationStatus == "active") {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(VLSpacing.sm),
                        verticalAlignment = Alignment.Bottom,
                        horizontalArrangement = Arrangement.spacedBy(VLSpacing.xs)
                    ) {
                        OutlinedTextField(
                            value = inputText,
                            onValueChange = { inputText = it },
                            placeholder = { Text("Message...") },
                            modifier = Modifier
                                .weight(1f)
                                .heightIn(min = 40.dp, max = 120.dp),
                            shape = VLShapes.large,
                            singleLine = false,
                            maxLines = 4,
                            keyboardOptions = KeyboardOptions(imeAction = ImeAction.Send),
                            keyboardActions = KeyboardActions(
                                onSend = {
                                    if (inputText.isNotBlank()) {
                                        viewModel.sendTextMessage(inputText.trim())
                                        state.conversationId?.let { messagesViewModel.moveConversationToTop(it) }
                                        inputText = ""
                                    }
                                }
                            ),
                            textStyle = MaterialTheme.typography.bodySmall
                        )
                        FilledIconButton(
                            onClick = {
                                if (inputText.isNotBlank()) {
                                    viewModel.sendTextMessage(inputText.trim())
                                    state.conversationId?.let { messagesViewModel.moveConversationToTop(it) }
                                    inputText = ""
                                }
                            },
                            enabled = inputText.isNotBlank() && !state.isSending,
                            modifier = Modifier.size(40.dp)
                        ) {
                            Icon(Icons.AutoMirrored.Filled.Send, contentDescription = "Send", modifier = Modifier.size(18.dp))
                        }
                    }
                }
            }
        }
    ) { innerPadding ->
        LazyColumn(
            state = listState,
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding),
            contentPadding = PaddingValues(vertical = VLSpacing.sm),
            reverseLayout = false
        ) {
            // Product preview card
            item {
                state.product?.let { product ->
                    ProductPreviewCard(product)
                }
                HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant)

                when (state.conversationStatus) {
                    "accepted" -> StatusBadge(
                        text = "Offer Accepted ✓",
                        color = MaterialTheme.colorScheme.inversePrimary
                    )
                    "rejected" -> StatusBadge(
                        text = "Conversation Rejected",
                        color = MaterialTheme.colorScheme.errorContainer
                    )
                }

                state.error?.let { error ->
                    Text(
                        text = error,
                        color = MaterialTheme.colorScheme.error,
                        style = MaterialTheme.typography.bodySmall,
                        modifier = Modifier.padding(horizontal = VLSpacing.md, vertical = VLSpacing.xs)
                    )
                }

                Spacer(Modifier.height(VLSpacing.sm))
            }

            // Messages - simple design, no complex grouping
            items(state.messages, key = { it.id }) { message ->
                val isSentByMe = message.sender?.id == state.currentUserId
                if (message.messageType == "offer") {
                    OfferBubble(message, isSentByMe)
                } else {
                    ChatBubble(message, isSentByMe)
                }
            }

            item { Spacer(Modifier.height(VLSpacing.md)) }
        }
    }
}

// ── Status Badge ──────────────────────────────────────────────────────────────
@Composable
private fun StatusBadge(
    text: String,
    color: androidx.compose.ui.graphics.Color
) {
    Surface(
        color = color,
        modifier = Modifier
            .fillMaxWidth()
            .padding(VLSpacing.md)
    ) {
        Text(
            text,
            style = MaterialTheme.typography.labelSmall,
            modifier = Modifier.padding(VLSpacing.md),
            fontWeight = FontWeight.SemiBold
        )
    }
}

// ── Product preview card ──────────────────────────────────────────────────────
@Composable
private fun ProductPreviewCard(product: Product) {
    val imageUrl = product.imageUrls.firstOrNull()
        ?: "https://picsum.photos/seed/${product.id}/400/300"

    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = VLSpacing.md, vertical = VLSpacing.sm),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(VLSpacing.md)
    ) {
        Box(
            modifier = Modifier
                .size(64.dp)
                .clip(VLShapes.medium)
                .background(MaterialTheme.colorScheme.surfaceVariant)
        ) {
            AsyncImage(
                model = imageUrl,
                contentDescription = product.title,
                contentScale = ContentScale.Crop,
                modifier = Modifier.fillMaxSize()
            )
        }
        Column(modifier = Modifier.weight(1f)) {
            Text(product.title, style = MaterialTheme.typography.titleSmall, maxLines = 2)
            Spacer(Modifier.height(2.dp))
            Text(
                text = "₹${product.price.toLong()}",
                style = MaterialTheme.typography.labelLarge
            )
            Spacer(Modifier.height(2.dp))
            if (product.condition.isNotBlank()) {
                Surface(
                    shape = VLShapes.extraSmall,
                    color = MaterialTheme.colorScheme.surfaceVariant
                ) {
                    Text(
                        text = product.condition,
                        style = MaterialTheme.typography.labelSmall,
                        modifier = Modifier.padding(horizontal = VLSpacing.xs, vertical = 2.dp)
                    )
                }
            }
        }
    }
}

// ── Chat Bubble ───────────────────────────────────────────────────────────────
@Composable
private fun ChatBubble(
    message: Message,
    isSentByMe: Boolean
) {
    if (message.text.isNullOrBlank()) return

    val timeText = formatMessageTime(message.createdAt)

    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(
                start = if (isSentByMe) VLSpacing.lg else VLSpacing.sm,
                end = if (isSentByMe) VLSpacing.sm else VLSpacing.lg,
                top = 4.dp,
                bottom = 4.dp
            ),
        horizontalArrangement = if (isSentByMe) Arrangement.End else Arrangement.Start
    ) {
        Column(
            horizontalAlignment = if (isSentByMe) Alignment.End else Alignment.Start,
            modifier = Modifier.widthIn(max = 260.dp)
        ) {
            Surface(
                shape = RoundedCornerShape(
                    topStart = 12.dp,
                    topEnd = 12.dp,
                    bottomStart = if (isSentByMe) 12.dp else 2.dp,
                    bottomEnd = if (isSentByMe) 2.dp else 12.dp
                ),
                color = if (isSentByMe)
                    MaterialTheme.colorScheme.primary.copy(alpha = 0.15f)
                else
                    MaterialTheme.colorScheme.surfaceVariant,
            ) {
                Text(
                    text = message.text,
                    style = MaterialTheme.typography.bodyMedium,
                    color = if (isSentByMe)
                        MaterialTheme.colorScheme.primary
                    else
                        MaterialTheme.colorScheme.onSurfaceVariant,
                    modifier = Modifier.padding(horizontal = 10.dp, vertical = 8.dp)
                )
            }

            Text(
                text = timeText,
                style = MaterialTheme.typography.bodySmall.copy(fontSize = 11.sp),
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
            )
        }
    }
}

// ── Offer Bubble ──────────────────────────────────────────────────────────────
@Composable
private fun OfferBubble(
    message: Message,
    isSentByMe: Boolean
) {
    if (message.offerPrice == null) return

    val timeText = formatMessageTime(message.createdAt)

    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(
                start = if (isSentByMe) VLSpacing.lg else VLSpacing.sm,
                end = if (isSentByMe) VLSpacing.sm else VLSpacing.lg,
                top = 4.dp,
                bottom = 4.dp
            ),
        horizontalArrangement = if (isSentByMe) Arrangement.End else Arrangement.Start
    ) {
        Column(
            horizontalAlignment = if (isSentByMe) Alignment.End else Alignment.Start,
            modifier = Modifier.widthIn(max = 280.dp)
        ) {
            Surface(
                shape = RoundedCornerShape(12.dp),
                color = if (isSentByMe)
                    MaterialTheme.colorScheme.primary.copy(alpha = 0.2f)
                else
                    MaterialTheme.colorScheme.tertiaryContainer,
            ) {
                Column(
                    modifier = Modifier.padding(VLSpacing.md),
                    verticalArrangement = Arrangement.spacedBy(VLSpacing.sm)
                ) {
                    Text(
                        text = if (isSentByMe) "Your Offer:" else "Their Offer:",
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    Text(
                        text = "₹${message.offerPrice.toLong()}",
                        style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Bold),
                        color = MaterialTheme.colorScheme.primary
                    )
                    if (!message.text.isNullOrBlank()) {
                        Text(
                            text = message.text,
                            style = MaterialTheme.typography.bodySmall
                        )
                    }
                }
            }

            Text(
                text = timeText,
                style = MaterialTheme.typography.bodySmall.copy(fontSize = 11.sp),
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
            )
        }
    }
}

/**
 * Format ISO timestamp to time string (e.g., "10:30 AM")
 */
private fun formatMessageTime(isoString: String): String {
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
        if (date == null) return ""

        val sdf = java.text.SimpleDateFormat("h:mm a", java.util.Locale.US)
        sdf.timeZone = java.util.TimeZone.getDefault()
        sdf.format(date)
    } catch (_: Exception) { "" }
}
