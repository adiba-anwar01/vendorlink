package com.arif.vl.presentation.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.arif.vl.data.model.Conversation
import com.arif.vl.domain.repository.AuthRepository
import com.arif.vl.domain.usecase.conversation.GetConversationsUseCase
import com.arif.vl.domain.usecase.conversation.DeleteConversationUseCase
import com.arif.vl.domain.usecase.conversation.AcceptConversationUseCase
import com.arif.vl.domain.usecase.conversation.GetMessagesUseCase
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter
import javax.inject.Inject

data class ConversationOfferSummary(
    val offerPrice: Double,
    val senderId: String? = null,
    val senderName: String? = null,
    val createdAt: String = ""
)

data class MessagesUiState(
    val isLoading: Boolean = false,
    val conversations: List<Conversation> = emptyList(),
    val currentUserId: String? = null,
    val latestOffers: Map<String, ConversationOfferSummary> = emptyMap(),
    val error: String? = null
)

/**
 * ViewModel for the Messages/Conversations list screen.
 * Fetches real conversations from backend via GET /conversations/my.
 */
@HiltViewModel
class MessagesViewModel @Inject constructor(
    private val getConversationsUseCase: GetConversationsUseCase,
    private val deleteConversationUseCase: DeleteConversationUseCase,
    private val acceptConversationUseCase: AcceptConversationUseCase,
    private val getMessagesUseCase: GetMessagesUseCase,
    private val authRepository: AuthRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(MessagesUiState())
    val uiState: StateFlow<MessagesUiState> = _uiState.asStateFlow()

    fun loadConversations() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(
                isLoading = true,
                error = null,
                currentUserId = authRepository.getUserId()
            )
            val result = getConversationsUseCase()
            _uiState.value = result.fold(
                onSuccess = { conversations ->
                    val sorted = conversations.sortedByDescending { 
                        it.updatedAt ?: it.createdAt 
                    }
                    val nextState = _uiState.value.copy(
                        isLoading = false,
                        conversations = sorted
                    )
                    fetchLatestOffers(sorted)
                    nextState
                },
                onFailure = {
                    _uiState.value.copy(
                        isLoading = false,
                        error = it.message ?: "Failed to load conversations"
                    )
                }
            )
        }
    }

    fun deleteConversation(conversationId: String) {
        viewModelScope.launch {
            // Call API to delete
            deleteConversationUseCase(conversationId).onSuccess {
                // Remove from UI
                val currentList = _uiState.value.conversations
                _uiState.value = _uiState.value.copy(
                    conversations = currentList.filter { it.id != conversationId },
                    latestOffers = _uiState.value.latestOffers - conversationId
                )
            }
        }
    }

    fun acceptConversation(conversationId: String) {
        viewModelScope.launch {
            acceptConversationUseCase(conversationId).fold(
                onSuccess = {
                    val now = LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME)
                    val updatedConversations = _uiState.value.conversations.map { conversation ->
                        if (conversation.id == conversationId) {
                            conversation.copy(status = "accepted", updatedAt = now)
                        } else {
                            conversation
                        }
                    }.sortedByDescending { conversation ->
                        conversation.updatedAt ?: conversation.createdAt
                    }

                    _uiState.value = _uiState.value.copy(
                        conversations = updatedConversations
                    )
                },
                onFailure = {
                    _uiState.value = _uiState.value.copy(
                        error = it.message ?: "Failed to accept offer"
                    )
                }
            )
        }
    }

    fun moveConversationToTop(conversationId: String) {
        val currentList = _uiState.value.conversations
        val conversation = currentList.find { it.id == conversationId } ?: return
        
        // Update timestamp to now (ISO format) so time display shows recent
        val now = LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME)
        val updated = conversation.copy(updatedAt = now)
        
        // Move to top
        val newList = listOf(updated) + currentList.filter { it.id != conversationId }
        _uiState.value = _uiState.value.copy(conversations = newList)
    }

    private fun fetchLatestOffers(conversations: List<Conversation>) {
        viewModelScope.launch {
            val offerMap = buildMap {
                conversations.forEach { conversation ->
                    val latestOffer = getMessagesUseCase(conversation.id)
                        .getOrNull()
                        ?.asSequence()
                        ?.filter { message -> message.messageType == "offer" && message.offerPrice != null }
                        ?.maxByOrNull { message -> message.createdAt }

                    if (latestOffer?.offerPrice != null) {
                        put(
                            conversation.id,
                            ConversationOfferSummary(
                                offerPrice = latestOffer.offerPrice,
                                senderId = latestOffer.sender?.id,
                                senderName = latestOffer.sender?.name,
                                createdAt = latestOffer.createdAt
                            )
                        )
                    }
                }
            }

            _uiState.value = _uiState.value.copy(latestOffers = offerMap)
        }
    }
}
