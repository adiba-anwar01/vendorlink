package com.arif.vl.domain.usecase.order

import com.arif.vl.data.model.Order
import com.arif.vl.data.model.PlaceOrderRequest
import com.arif.vl.domain.repository.OrderRepository
import javax.inject.Inject

class PlaceOrderUseCase @Inject constructor(
    private val orderRepository: OrderRepository
) {
    suspend operator fun invoke(
        productId: String,
        request: PlaceOrderRequest
    ): Result<Order> = runCatching {
        orderRepository.placeOrder(productId, request).getOrThrow()
    }
}

class GetMyOrdersUseCase @Inject constructor(
    private val orderRepository: OrderRepository
) {
    suspend operator fun invoke(): Result<List<Order>> = runCatching {
        orderRepository.getMyOrders().getOrThrow()
    }
}

class GetSellerOrdersUseCase @Inject constructor(
    private val orderRepository: OrderRepository
) {
    suspend operator fun invoke(): Result<List<Order>> = runCatching {
        orderRepository.getSellerOrders().getOrThrow()
    }
}

class UpdateOrderStatusUseCase @Inject constructor(
    private val orderRepository: OrderRepository
) {
    suspend operator fun invoke(orderId: String, status: String): Result<Order> = runCatching {
        orderRepository.updateOrderStatus(orderId, status).getOrThrow()
    }
}
