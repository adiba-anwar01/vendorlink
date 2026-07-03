package com.arif.vl.data.remote.socket

import android.util.Log
import com.arif.vl.data.local.SecureTokenManager
import com.arif.vl.data.model.Conversation
import com.arif.vl.data.model.Message
import com.google.gson.Gson
import io.socket.client.IO
import io.socket.client.Socket
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.coroutines.flow.asStateFlow
import org.json.JSONObject
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class SocketManager @Inject constructor(
    private val tokenManager: SecureTokenManager,
    private val gson: Gson
) {
    private var socket: Socket? = null
    private var activeConversationId: String? = null
    private var savedBaseUrl: String? = null
    /** Room join that is pending until the socket finishes connecting. */
    private var pendingJoinRoom: String? = null

    private val _newMessages = MutableSharedFlow<Message>(extraBufferCapacity = 10)
    val newMessages = _newMessages.asSharedFlow()

    private val _offerUpdates = MutableSharedFlow<Conversation>(extraBufferCapacity = 10)
    val offerUpdates = _offerUpdates.asSharedFlow()

    /** Emits `true` every time the socket (re)connects – ViewModels can use this to refresh data. */
    private val _connected = MutableSharedFlow<Boolean>(extraBufferCapacity = 5)
    val connected = _connected.asSharedFlow()

    private val _isConnected = MutableStateFlow(false)
    val isConnected: StateFlow<Boolean> = _isConnected.asStateFlow()

    fun connect(baseUrl: String) {
        savedBaseUrl = baseUrl
        if (socket?.connected() == true) return

        try {
            val token = tokenManager.getAccessToken()
            if (token.isNullOrEmpty()) {
                Log.e("SocketManager", "Cannot connect to socket without auth token")
                return
            }

            // Extract host from BASE_URL (e.g., http://192.168.0.103:5000/api/ -> http://192.168.0.103:5000)
            val socketUrl = baseUrl.substringBefore("/api/")

            val options = IO.Options.builder()
                .setAuth(mapOf("token" to token))
                .setReconnection(true)
                .setReconnectionAttempts(10)
                .setReconnectionDelay(1000)
                .setReconnectionDelayMax(5000)
                .build()

            socket = IO.socket(socketUrl, options)

            socket?.on(Socket.EVENT_CONNECT) {
                Log.d("SocketManager", "Connected to socket server")
                _isConnected.value = true
                _connected.tryEmit(true)

                // Join any pending room that was queued while connecting
                val pending = pendingJoinRoom
                if (pending != null) {
                    socket?.emit("joinChat", pending)
                    Log.d("SocketManager", "Joined pending room: $pending")
                    pendingJoinRoom = null
                }

                // Also re-join the active conversation (covers reconnect case)
                activeConversationId?.let { convoId ->
                    if (convoId != pending) {
                        socket?.emit("joinChat", convoId)
                        Log.d("SocketManager", "Re-joined active chat: $convoId")
                    }
                }
            }

            socket?.on(Socket.EVENT_DISCONNECT) {
                Log.d("SocketManager", "Disconnected from socket server")
                _isConnected.value = false
            }

            socket?.on(Socket.EVENT_CONNECT_ERROR) { args ->
                Log.e("SocketManager", "Connection error: ${args.contentToString()}")
                _isConnected.value = false
            }

            socket?.on("newMessage") { args ->
                if (args.isNotEmpty()) {
                    try {
                        val rawPayload = args[0].toString()
                        Log.d("SocketManager", "Received raw newMessage: $rawPayload")
                        val message = gson.fromJson(rawPayload, Message::class.java)
                        _newMessages.tryEmit(message)
                    } catch (e: Exception) {
                        Log.e("SocketManager", "Error parsing newMessage", e)
                    }
                }
            }

            socket?.on("offerUpdated") { args ->
                if (args.isNotEmpty()) {
                    try {
                        val json = args[0] as JSONObject
                        val conversation = gson.fromJson(json.toString(), Conversation::class.java)
                        _offerUpdates.tryEmit(conversation)
                    } catch (e: Exception) {
                        Log.e("SocketManager", "Error parsing offerUpdated", e)
                    }
                }
            }

            socket?.connect()

        } catch (e: Exception) {
            Log.e("SocketManager", "Error initializing socket", e)
        }
    }

    fun joinChat(conversationId: String) {
        activeConversationId = conversationId
        if (socket == null && savedBaseUrl != null) {
            // Socket not created yet — queue the join and connect
            pendingJoinRoom = conversationId
            connect(savedBaseUrl!!)
            return
        }

        if (socket?.connected() == true) {
            socket?.emit("joinChat", conversationId)
            Log.d("SocketManager", "Emitted joinChat for $conversationId")
        } else {
            // Socket exists but is not connected yet — queue the join
            pendingJoinRoom = conversationId
            socket?.connect()
            Log.d("SocketManager", "Socket connecting, queued joinChat for $conversationId")
        }
    }

    fun leaveChat(conversationId: String) {
        if (activeConversationId == conversationId) {
            activeConversationId = null
        }
        if (pendingJoinRoom == conversationId) {
            pendingJoinRoom = null
        }
        if (socket?.connected() == true) {
            socket?.emit("leaveChat", conversationId)
            Log.d("SocketManager", "Emitted leaveChat for $conversationId")
        }
    }

    fun disconnect() {
        activeConversationId = null
        pendingJoinRoom = null
        socket?.disconnect()
        socket = null
        _isConnected.value = false
    }
}
