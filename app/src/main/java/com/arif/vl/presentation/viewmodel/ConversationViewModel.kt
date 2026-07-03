package com.arif.vl.presentation.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.arif.vl.data.model.*
import com.arif.vl.data.remote.socket.SocketManager
import com.arif.vl.domain.repository.AuthRepository
import com.arif.vl.domain.usecase.conversation.StartConversationUseCase
import com.arif.vl.domain.usecase.conversation.GetConversationsUseCase
import com.arif.vl.domain.usecase.conversation.GetMessagesUseCase
import com.arif.vl.domain.usecase.conversation.SendMessageUseCase
import com.arif.vl.domain.usecase.conversation.AcceptConversationUseCase
import com.arif.vl.domain.usecase.conversation.RejectConversationUseCase
import com.arif.vl.domain.usecase.product.GetProductDetailsUseCase
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import timber.log.Timber
import javax.inject.Inject

data class ConversationUiState(
    val isLoading: Boolean = false,
    val product: Product? = null,
    val conversationId: String? = null,
    val conversationStatus: String = "active",  // "active", "accepted", "rejected"
    val messages: List<Message> = emptyList(),
    val currentUserId: String? = null,
    val sellerName: String = "",
    val error: String? = null,
    val isSending: Boolean = false,
    val isTyping: Boolean = false,
    val isOnline: Boolean = true,
    val latestOfferPrice: Double? = null
)

/**
 * ViewModel for the Conversation (chat) screen.
 * Handles loading conversation, fetching messages, sending messages/offers,
 * and accepting/rejecting conversations.
 */
@HiltViewModel
class ConversationViewModel @Inject constructor(
    private val startConversationUseCase: StartConversationUseCase,
    private val getConversationsUseCase: GetConversationsUseCase,
    private val getMessagesUseCase: GetMessagesUseCase,
    private val sendMessageUseCase: SendMessageUseCase,
    private val acceptConversationUseCase: AcceptConversationUseCase,
    private val rejectConversationUseCase: RejectConversationUseCase,
    private val getProductDetailsUseCase: GetProductDetailsUseCase,
    private val authRepository: AuthRepository,
    private val socketManager: SocketManager
) : ViewModel() {

    companion object {
        private const val TAG = "ConversationVM"
        private const val POLL_INTERVAL_MS = 15_000L // 15 seconds
    }

    private val _uiState = MutableStateFlow(ConversationUiState())
    val uiState: StateFlow<ConversationUiState> = _uiState.asStateFlow()

    private var pollJob: Job? = null

    init {
        // Listen for new messages from socket
        viewModelScope.launch {
            socketManager.newMessages.collect { msg ->
                val state = _uiState.value
                val currentConvoId = state.conversationId
                
                if (currentConvoId != null && msg.conversation == currentConvoId) {
                    val currentMessages = state.messages
                    if (!currentMessages.any { it.id == msg.id }) {
                        _uiState.value = state.copy(
                            messages = (currentMessages + msg).sortedBy { it.createdAt }
                        )
                        updateLatestOfferPrice()
                    }
                }
            }
        }

        // Listen for offer/status updates from socket
        viewModelScope.launch {
            socketManager.offerUpdates.collect { updatedConvo ->
                if (updatedConvo.id == _uiState.value.conversationId) {
                    _uiState.value = _uiState.value.copy(
                        conversationStatus = updatedConvo.status
                    )
                    // If conversation was just accepted, refresh messages to get system message
                    if (updatedConvo.status == "accepted") {
                        loadMessages()
                    }
                }
            }
        }

        // On socket (re)connect, refresh messages to catch anything missed during disconnect
        viewModelScope.launch {
            socketManager.connected.collect {
                val convoId = _uiState.value.conversationId
                if (convoId != null) {
                    Timber.d("Socket reconnected, refreshing messages for %s", convoId)
                    loadMessages(convoId)
                }
            }
        }
    }

    /**
     * Initialize the conversation screen:
     * 1. Load product details
     * 2. Start or find existing conversation
     * 3. Load messages
     * 4. Start periodic poll fallback
     */
    fun initialize(productId: String, conversationId: String? = null) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(
                isLoading = true,
                currentUserId = authRepository.getUserId()
            )

            // 1. Load product
            val productResult = getProductDetailsUseCase(productId)
            productResult.onSuccess { product ->
                _uiState.value = _uiState.value.copy(product = product)
            }

            if (!conversationId.isNullOrEmpty()) {
                // Opened from inbox - avoid startConversation to prevent 400 or empty chats
                val convoResult = getConversationsUseCase()
                convoResult.onSuccess { conversations ->
                    val conversation = conversations.find { it.id == conversationId }
                    if (conversation != null) {
                        _uiState.value = _uiState.value.copy(
                            conversationId = conversation.id,
                            conversationStatus = conversation.status,
                            sellerName = conversation.seller?.name ?: "Seller"
                        )
                        socketManager.joinChat(conversation.id)
                        loadMessages(conversation.id)
                        startPolling()
                    } else {
                        _uiState.value = _uiState.value.copy(isLoading = false, error = "Conversation not found")
                    }
                }.onFailure {
                    _uiState.value = _uiState.value.copy(isLoading = false, error = it.message)
                }
            } else {
                // 2. Start/find conversation
                val convoResult = startConversationUseCase(
                    productId = productId,
                    request = StartConversationRequest()
                )

                convoResult.fold(
                    onSuccess = { conversation ->
                        Timber.d("Conversation ID: %s, status: %s", conversation.id, conversation.status)
                        _uiState.value = _uiState.value.copy(
                            conversationId = conversation.id,
                            conversationStatus = conversation.status,
                            sellerName = conversation.seller?.name ?: "Seller"
                        )
                        // 3. Load messages and join socket room
                        socketManager.joinChat(conversation.id)
                        loadMessages(conversation.id)
                        startPolling()
                    },
                    onFailure = { err ->
                        Timber.e(err, "Failed to start conversation")
                        _uiState.value = _uiState.value.copy(
                            isLoading = false,
                            error = err.message ?: "Failed to start conversation"
                        )
                    }
                )
            }
        }
    }

    fun loadMessages(conversationId: String? = null) {
        val convoId = conversationId ?: _uiState.value.conversationId ?: return
        viewModelScope.launch {
            val result = getMessagesUseCase(convoId)
            result.fold(
                onSuccess = { messages ->
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        messages = messages.sortedBy { it.createdAt }
                    )
                    updateLatestOfferPrice()
                },
                onFailure = { err ->
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        error = err.message
                    )
                }
            )
        }
    }

    /**
     * Periodic polling fallback — ensures messages arrive even if socket events are missed.
     * Runs every 15 seconds while the chat screen is open.
     */
    private fun startPolling() {
        pollJob?.cancel()
        pollJob = viewModelScope.launch {
            while (isActive) {
                delay(POLL_INTERVAL_MS)
                val convoId = _uiState.value.conversationId ?: continue
                val result = getMessagesUseCase(convoId)
                result.onSuccess { fetchedMessages ->
                    val currentMessages = _uiState.value.messages
                    val currentIds = currentMessages.map { it.id }.toSet()
                    val newMessages = fetchedMessages.filter { it.id !in currentIds }
                    if (newMessages.isNotEmpty()) {
                        Timber.d("Poll found %d new messages", newMessages.size)
                        _uiState.value = _uiState.value.copy(
                            messages = (currentMessages + newMessages).sortedBy { it.createdAt }
                        )
                        updateLatestOfferPrice()
                    }
                }
            }
        }
    }

    /** Compute and store the latest offer price from current messages. */
    private fun updateLatestOfferPrice() {
        val latestOffer = _uiState.value.messages
            .filter { it.messageType == "offer" && it.offerPrice != null }
            .maxByOrNull { it.createdAt }
        _uiState.value = _uiState.value.copy(
            latestOfferPrice = latestOffer?.offerPrice
        )
    }

    fun sendTextMessage(text: String) {
        val convoId = _uiState.value.conversationId ?: return
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isSending = true)
            val result = sendMessageUseCase(
                conversationId = convoId,
                request = SendMessageRequest(text = text, messageType = "text")
            )
            result.fold(
                onSuccess = { message ->
                    val current = _uiState.value.messages
                    if (!current.any { it.id == message.id }) {
                        _uiState.value = _uiState.value.copy(
                            isSending = false,
                            messages = (current + message).sortedBy { it.createdAt }
                        )
                    } else {
                        _uiState.value = _uiState.value.copy(isSending = false)
                    }
                },
                onFailure = { err ->
                    _uiState.value = _uiState.value.copy(
                        isSending = false,
                        error = err.message
                    )
                }
            )
        }
    }

    fun sendOffer(price: Double) {
        val convoId = _uiState.value.conversationId ?: return
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isSending = true)
            val result = sendMessageUseCase(
                conversationId = convoId,
                request = SendMessageRequest(
                    offerPrice = price,
                    messageType = "offer"
                )
            )
            result.fold(
                onSuccess = { message ->
                    val current = _uiState.value.messages
                    if (!current.any { it.id == message.id }) {
                        _uiState.value = _uiState.value.copy(
                            isSending = false,
                            messages = (current + message).sortedBy { it.createdAt }
                        )
                        updateLatestOfferPrice()
                    } else {
                        _uiState.value = _uiState.value.copy(isSending = false)
                    }
                },
                onFailure = { err ->
                    _uiState.value = _uiState.value.copy(
                        isSending = false,
                        error = err.message
                    )
                }
            )
        }
    }

    fun acceptConversation() {
        val convoId = _uiState.value.conversationId ?: return
        viewModelScope.launch {
            val result = acceptConversationUseCase(convoId)
            result.onSuccess {
                _uiState.value = _uiState.value.copy(conversationStatus = "accepted")
                // Refresh messages to get the system message created by the backend
                loadMessages(convoId)
            }
            result.onFailure { err ->
                _uiState.value = _uiState.value.copy(error = err.message)
            }
        }
    }

    fun rejectConversation() {
        val convoId = _uiState.value.conversationId ?: return
        viewModelScope.launch {
            val result = rejectConversationUseCase(convoId)
            result.onSuccess {
                _uiState.value = _uiState.value.copy(conversationStatus = "rejected")
            }
            result.onFailure { err ->
                _uiState.value = _uiState.value.copy(error = err.message)
            }
        }
    }

    fun clearMessages() {
        _uiState.value.conversationId?.let { socketManager.leaveChat(it) }
        _uiState.value = _uiState.value.copy(messages = emptyList())
    }

    override fun onCleared() {
        super.onCleared()
        pollJob?.cancel()
        _uiState.value.conversationId?.let { socketManager.leaveChat(it) }
    }
}
