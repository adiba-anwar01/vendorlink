package com.arif.vl.data.repository

import com.arif.vl.data.model.Order
import com.arif.vl.data.model.PlaceOrderRequest
import com.arif.vl.data.model.UpdateOrderStatusRequest
import com.arif.vl.data.remote.ApiService
import com.arif.vl.domain.repository.OrderRepository
import com.google.gson.JsonParser
import retrofit2.HttpException
import timber.log.Timber
import java.io.IOException
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Implementation of [OrderRepository].
 * Handles placing orders, fetching order history, and updating order status.
 */
@Singleton
class OrderRepositoryImpl @Inject constructor(
    private val apiService: ApiService
) : OrderRepository {

    /**
     * Place a new order for a product.
     * Backend: POST /orders/:productId
     */
    override suspend fun placeOrder(
        productId: String,
        request: PlaceOrderRequest
    ): Result<Order> = runCatching {
        Timber.d(
            "Placing order for product: %s (addressLength=%d, phoneLength=%d)",
            productId, request.deliveryAddress.length, request.phoneNumber.length
        )
        try {
            apiService.placeOrder(productId, request)
        } catch (e: HttpException) {
            throw e.toOrderException("place order")
        }
    }

    private fun HttpException.toOrderException(action: String): IOException {
        val errorBody = response()?.errorBody()?.string().orEmpty()
        val serverMessage = errorBody.extractServerMessage()
        val message = serverMessage.ifBlank {
            "Unable to $action. Server returned HTTP ${code()}."
        }
        Timber.e("Failed to %s: HTTP %d - %s", action, code(), message)
        return IOException(message, this)
    }

    private fun String.extractServerMessage(): String {
        if (isBlank()) return ""

        return runCatching {
            val json = JsonParser.parseString(this).asJsonObject
            when {
                json.has("message") -> json.get("message").asString
                json.has("error") -> json.get("error").asString
                json.has("errors") && json.get("errors").isJsonArray -> {
                    json.getAsJsonArray("errors")
                        .mapNotNull { error ->
                            val errorObject = error.takeIf { it.isJsonObject }?.asJsonObject
                            errorObject?.get("msg")?.asString
                                ?: errorObject?.get("message")?.asString
                        }
                        .joinToString(", ")
                }
                else -> ""
            }
        }.getOrDefault("")
    }

    /**
     * Get the current user's orders (as buyer).
     */
    override suspend fun getMyOrders(): Result<List<Order>> = runCatching {
        Timber.d("Fetching user's orders (buyer)")
        apiService.getMyOrders()
    }

    /**
     * Get orders for the current user's products (as seller).
     */
    override suspend fun getSellerOrders(): Result<List<Order>> = runCatching {
        Timber.d("Fetching seller's orders")
        apiService.getSellerOrders()
    }

    /**
     * Get details of a specific order.
     */
    override suspend fun getOrderById(orderId: String): Result<Order> = runCatching {
        Timber.d("Fetching order details: %s", orderId)
        apiService.getOrderDetails(orderId)
    }

    /**
     * Update order status (seller only).
     */
    override suspend fun updateOrderStatus(
        orderId: String,
        status: String
    ): Result<Order> = runCatching {
        Timber.d("Updating order %s status to: %s", orderId, status)
        apiService.updateOrderStatus(orderId, UpdateOrderStatusRequest(status))
    }
}
