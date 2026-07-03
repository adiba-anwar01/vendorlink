package com.arif.vl.domain.repository

import com.arif.vl.data.model.Order
import com.arif.vl.data.model.PlaceOrderRequest

/**
 * Contract for order-related operations.
 */
interface OrderRepository {
    suspend fun placeOrder(productId: String, request: PlaceOrderRequest): Result<Order>
    suspend fun getMyOrders(): Result<List<Order>>
    suspend fun getSellerOrders(): Result<List<Order>>
    suspend fun getOrderById(orderId: String): Result<Order>
    suspend fun updateOrderStatus(orderId: String, status: String): Result<Order>
}
