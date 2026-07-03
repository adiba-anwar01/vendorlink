package com.arif.vl.domain.repository

import com.arif.vl.data.model.Conversation
import com.arif.vl.data.model.Message
import com.arif.vl.data.model.SendMessageRequest
import com.arif.vl.data.model.StartConversationRequest

/**
 * Contract for conversation and message operations.
 */
interface ConversationRepository {
    suspend fun startConversation(
        productId: String,
        request: StartConversationRequest
    ): Result<Conversation>

    suspend fun getMyConversations(): Result<List<Conversation>>
    suspend fun acceptConversation(conversationId: String): Result<Conversation>
    suspend fun rejectConversation(conversationId: String): Result<Conversation>

    suspend fun sendMessage(
        conversationId: String,
        request: SendMessageRequest
    ): Result<Message>

    suspend fun getMessages(conversationId: String): Result<List<Message>>
    suspend fun deleteConversation(conversationId: String): Result<Unit>
}
