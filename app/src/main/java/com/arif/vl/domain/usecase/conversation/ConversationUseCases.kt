package com.arif.vl.domain.usecase.conversation

import com.arif.vl.data.model.Conversation
import com.arif.vl.data.model.Message
import com.arif.vl.data.model.SendMessageRequest
import com.arif.vl.data.model.StartConversationRequest
import com.arif.vl.domain.repository.ConversationRepository
import javax.inject.Inject

class StartConversationUseCase @Inject constructor(
    private val repository: ConversationRepository
) {
    suspend operator fun invoke(
        productId: String,
        request: StartConversationRequest
    ): Result<Conversation> = repository.startConversation(productId, request)
}

class GetConversationsUseCase @Inject constructor(
    private val repository: ConversationRepository
) {
    suspend operator fun invoke(): Result<List<Conversation>> =
        repository.getMyConversations()
}

class GetMessagesUseCase @Inject constructor(
    private val repository: ConversationRepository
) {
    suspend operator fun invoke(conversationId: String): Result<List<Message>> =
        repository.getMessages(conversationId)
}

class SendMessageUseCase @Inject constructor(
    private val repository: ConversationRepository
) {
    suspend operator fun invoke(
        conversationId: String,
        request: SendMessageRequest
    ): Result<Message> = repository.sendMessage(conversationId, request)
}

class AcceptConversationUseCase @Inject constructor(
    private val repository: ConversationRepository
) {
    suspend operator fun invoke(conversationId: String): Result<Conversation> =
        repository.acceptConversation(conversationId)
}

class RejectConversationUseCase @Inject constructor(
    private val repository: ConversationRepository
) {
    suspend operator fun invoke(conversationId: String): Result<Conversation> =
        repository.rejectConversation(conversationId)
}

class DeleteConversationUseCase @Inject constructor(
    private val repository: ConversationRepository
) {
    suspend operator fun invoke(conversationId: String): Result<Unit> =
        repository.deleteConversation(conversationId)
}
