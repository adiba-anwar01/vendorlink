package com.arif.vl.presentation.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.arif.vl.data.model.Order
import com.arif.vl.data.model.PlaceOrderRequest
import com.arif.vl.domain.usecase.order.PlaceOrderUseCase
import com.arif.vl.domain.usecase.order.GetMyOrdersUseCase
import com.arif.vl.domain.usecase.order.GetSellerOrdersUseCase
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class OrderUiState(
    val isLoading: Boolean = false,
    val orderPlacing: Boolean = false,
    val myOrders: List<Order> = emptyList(),
    val sellerOrders: List<Order> = emptyList(),
    val error: String? = null,
    val duplicateOrderExists: Boolean = false,
    val productSoldOut: Boolean = false,
    val successMessage: String? = null,
    val selectedOrder: Order? = null
)

@HiltViewModel
class OrderViewModel @Inject constructor(
    private val placeOrderUseCase: PlaceOrderUseCase,
    private val getMyOrdersUseCase: GetMyOrdersUseCase,
    private val getSellerOrdersUseCase: GetSellerOrdersUseCase
) : ViewModel() {

    private val _uiState = MutableStateFlow(OrderUiState())
    val uiState: StateFlow<OrderUiState> = _uiState.asStateFlow()

    fun placeOrder(
        productId: String,
        deliveryAddress: String,
        phoneNumber: String,
        notes: String? = null
    ) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(
                orderPlacing = true,
                error = null,
                duplicateOrderExists = false,
                productSoldOut = false
            )
            val request = PlaceOrderRequest(
                deliveryAddress = deliveryAddress,
                phoneNumber = phoneNumber,
                notes = notes
            )
            val result = placeOrderUseCase(productId, request)
            _uiState.value = result.fold(
                onSuccess = { order ->
                    // Product is now sold to this buyer
                    _uiState.value.copy(
                        orderPlacing = false,
                        successMessage = "Order confirmed! This item is now reserved for you.",
                        selectedOrder = order,
                        duplicateOrderExists = false,
                        productSoldOut = false
                    )
                },
                onFailure = { throwable ->
                    val message = throwable.message ?: "Failed to place order"
                    val duplicateOrderExists = message.contains("You already placed an order", ignoreCase = true)
                    val productSoldOut = message.contains("sold", ignoreCase = true) || 
                                        message.contains("unavailable", ignoreCase = true) ||
                                        message.contains("already purchased", ignoreCase = true)
                    _uiState.value.copy(
                        orderPlacing = false,
                        error = when {
                            duplicateOrderExists -> "You already placed an order for this product."
                            productSoldOut -> "This product has been sold. Another buyer purchased it before you."
                            else -> message
                        },
                        duplicateOrderExists = duplicateOrderExists,
                        productSoldOut = productSoldOut
                    )
                }
            )
        }
    }

    fun loadMyOrders() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            val result = getMyOrdersUseCase()
            _uiState.value = result.fold(
                onSuccess = { orders ->
                    _uiState.value.copy(isLoading = false, myOrders = orders)
                },
                onFailure = {
                    _uiState.value.copy(
                        isLoading = false,
                        error = it.message ?: "Failed to load orders"
                    )
                }
            )
        }
    }

    fun loadSellerOrders() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            val result = getSellerOrdersUseCase()
            _uiState.value = result.fold(
                onSuccess = { orders ->
                    _uiState.value.copy(isLoading = false, sellerOrders = orders)
                },
                onFailure = {
                    _uiState.value.copy(
                        isLoading = false,
                        error = it.message ?: "Failed to load seller orders"
                    )
                }
            )
        }
    }

    fun clearSuccess() {
        _uiState.value = _uiState.value.copy(successMessage = null)
    }

    fun clearError() {
        _uiState.value = _uiState.value.copy(error = null, duplicateOrderExists = false, productSoldOut = false)
    }
}
