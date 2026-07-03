package com.arif.vl.data.repository

import com.arif.vl.data.model.Conversation
import com.arif.vl.data.model.Message
import com.arif.vl.data.model.SendMessageRequest
import com.arif.vl.data.model.StartConversationRequest
import com.arif.vl.data.remote.ApiService
import com.arif.vl.domain.repository.ConversationRepository
import timber.log.Timber
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Implementation of [ConversationRepository].
 * All return types aligned with backend responses (direct arrays, not wrapped).
 */
@Singleton
class ConversationRepositoryImpl @Inject constructor(
    private val apiService: ApiService
) : ConversationRepository {

    /**
     * Start a new conversation for a product.
     * Backend returns Conversation directly (or existing one if already exists).
     */
    override suspend fun startConversation(
        productId: String,
        request: StartConversationRequest
    ): Result<Conversation> = runCatching {
        Timber.d("Starting conversation for product: %s", productId)
        apiService.startConversation(productId, request)
    }

    /**
     * Get all conversations for the current user.
     */
    override suspend fun getMyConversations(): Result<List<Conversation>> = runCatching {
        Timber.d("Fetching user's conversations")
        apiService.getMyConversations()
    }

    /**
     * Accept a conversation offer (seller only).
     */
    override suspend fun acceptConversation(conversationId: String): Result<Conversation> = runCatching {
        Timber.d("Accepting conversation: %s", conversationId)
        apiService.acceptConversation(conversationId)
    }

    /**
     * Reject a conversation offer (seller only).
     */
    override suspend fun rejectConversation(conversationId: String): Result<Conversation> = runCatching {
        Timber.d("Rejecting conversation: %s", conversationId)
        apiService.rejectConversation(conversationId)
    }

    /**
     * Send a message in a conversation.
     */
    override suspend fun sendMessage(
        conversationId: String,
        request: SendMessageRequest
    ): Result<Message> = runCatching {
        Timber.d("Sending message in conversation: %s", conversationId)
        apiService.sendMessage(conversationId, request)
    }

    /**
     * Get all messages in a conversation.
     */
    override suspend fun getMessages(conversationId: String): Result<List<Message>> = runCatching {
        Timber.d("Fetching messages for conversation: %s", conversationId)
        apiService.getMessages(conversationId)
    }

    /**
     * Delete a conversation.
     */
    override suspend fun deleteConversation(conversationId: String): Result<Unit> = runCatching {
        Timber.d("Deleting conversation: %s", conversationId)
        apiService.deleteConversation(conversationId)
    }
}
