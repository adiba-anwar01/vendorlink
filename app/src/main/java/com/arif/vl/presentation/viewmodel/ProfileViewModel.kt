package com.arif.vl.presentation.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.arif.vl.data.model.Order
import com.arif.vl.data.model.Product
import com.arif.vl.data.model.User
import com.arif.vl.data.model.UpdateProductRequest
import com.arif.vl.domain.repository.AuthRepository
import com.arif.vl.domain.usecase.user.GetUserProfileUseCase
import com.arif.vl.domain.usecase.user.UpdateUserProfileUseCase
import com.arif.vl.domain.usecase.product.GetProductsUseCase
import com.arif.vl.domain.usecase.product.UpdateProductUseCase
import com.arif.vl.domain.usecase.product.DeleteProductUseCase
import com.arif.vl.domain.usecase.order.GetMyOrdersUseCase
import com.arif.vl.domain.usecase.order.GetSellerOrdersUseCase
import com.arif.vl.domain.usecase.order.UpdateOrderStatusUseCase
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.async
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class ProfileUiState(
    val isLoading: Boolean = false,
    val isSaving: Boolean = false,
    val user: User? = null,
    val listedProducts: List<Product> = emptyList(),
    val myOrders: List<Order> = emptyList(),
    val sellerOrders: List<Order> = emptyList(),
    val error: String? = null,
    val successMessage: String? = null,
    val isLoggedOut: Boolean = false
)

@HiltViewModel
class ProfileViewModel @Inject constructor(
    private val getUserProfileUseCase: GetUserProfileUseCase,
    private val updateUserProfileUseCase: UpdateUserProfileUseCase,
    private val getProductsUseCase: GetProductsUseCase,
    private val updateProductUseCase: UpdateProductUseCase,
    private val deleteProductUseCase: DeleteProductUseCase,
    private val getMyOrdersUseCase: GetMyOrdersUseCase,
    private val getSellerOrdersUseCase: GetSellerOrdersUseCase,
    private val updateOrderStatusUseCase: UpdateOrderStatusUseCase,
    private val authRepository: AuthRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(ProfileUiState())
    val uiState: StateFlow<ProfileUiState> = _uiState.asStateFlow()

    init {
        loadProfile()
    }

    fun loadProfile() {
        viewModelScope.launch {
            // Load cached user data immediately to avoid latency
            val cachedUser = User(
                id = authRepository.getUserId().orEmpty(),
                name = authRepository.getUserName() ?: "User",
                email = authRepository.getUserEmail() ?: ""
            )

            // Show cached data immediately if user has ID
            if (cachedUser.id.isNotBlank()) {
                _uiState.value = _uiState.value.copy(
                    user = cachedUser,
                    isLoading = true,
                    error = null
                )
            } else {
                _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            }

            // Fetch fresh data in background
            val profileResult = getUserProfileUseCase()
            val user = profileResult.getOrElse { cachedUser }

            val listingsDeferred = async { getProductsUseCase() }
            val ordersDeferred = async { getMyOrdersUseCase() }
            val sellerOrdersDeferred = async { getSellerOrdersUseCase() }

            val listingsResult = listingsDeferred.await()
            val listings = listingsResult
                .getOrElse { emptyList() }
                .filter { product -> product.vendorId.isNotBlank() && product.vendorId == user.id }
                .sortedByDescending { it.createdAt }

            val ordersResult = ordersDeferred.await()
            val orders = ordersResult.getOrElse { emptyList() }
                .sortedByDescending { it.createdAt }

            val sellerOrdersResult = sellerOrdersDeferred.await()
            val sellerOrders = sellerOrdersResult.getOrElse { emptyList() }
                .sortedByDescending { it.createdAt }

            val errors = buildList {
                // Don't show "null user object" error if we have a fallback user with ID from cache
                profileResult.exceptionOrNull()?.message?.let { errorMsg ->
                    if (!errorMsg.contains("null user object") || user.id.isBlank()) {
                        add(errorMsg)
                    }
                }
                listingsResult.exceptionOrNull()?.message?.let(::add)
                ordersResult.exceptionOrNull()?.message?.let(::add)
                sellerOrdersResult.exceptionOrNull()?.message?.let(::add)
            }.filter { it.isNotBlank() }

            _uiState.value = _uiState.value.copy(
                isLoading = false,
                user = user,
                listedProducts = listings,
                myOrders = orders,
                sellerOrders = sellerOrders,
                error = errors.firstOrNull()
            )
        }
    }

    fun updateProfile(
        name: String,
        email: String,
        phone: String
    ) {
        val currentUser = _uiState.value.user ?: return
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isSaving = true, error = null, successMessage = null)
            val result = updateUserProfileUseCase(
                currentUser.copy(
                    name = name.trim(),
                    email = email.trim(),
                    phone = phone.trim()
                )
            )
            _uiState.value = result.fold(
                onSuccess = { updatedUser ->
                    authRepository.updateStoredUserInfo(
                        userId = updatedUser.id,
                        email = updatedUser.email,
                        name = updatedUser.name
                    )
                    _uiState.value.copy(
                        isSaving = false,
                        user = updatedUser,
                        successMessage = "Profile updated successfully"
                    )
                },
                onFailure = {
                    _uiState.value.copy(
                        isSaving = false,
                        error = it.message ?: "Failed to update profile"
                    )
                }
            )
        }
    }

    fun updateListing(
        productId: String,
        title: String,
        description: String,
        price: String,
        category: String,
        condition: String
    ) {
        val trimmedTitle = title.trim()
        val trimmedDescription = description.trim()
        val trimmedCategory = category.trim()
        val normalizedCondition = condition.trim().lowercase()
        val parsedPrice = price.trim().toDoubleOrNull()

        if (trimmedTitle.isBlank() || trimmedDescription.isBlank() || trimmedCategory.isBlank()) {
            _uiState.value = _uiState.value.copy(error = "Please fill in all listing fields")
            return
        }

        if (parsedPrice == null || parsedPrice <= 0) {
            _uiState.value = _uiState.value.copy(error = "Please enter a valid listing price")
            return
        }

        if (normalizedCondition !in setOf("new", "used")) {
            _uiState.value = _uiState.value.copy(error = "Condition must be new or used")
            return
        }

        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isSaving = true, error = null, successMessage = null)

            val result = updateProductUseCase(
                productId = productId,
                request = UpdateProductRequest(
                    title = trimmedTitle,
                    description = trimmedDescription,
                    price = parsedPrice,
                    category = trimmedCategory,
                    condition = normalizedCondition
                )
            )

            _uiState.value = result.fold(
                onSuccess = { updatedProduct ->
                    _uiState.value.copy(
                        isSaving = false,
                        listedProducts = _uiState.value.listedProducts.map { product ->
                            if (product.id == productId) updatedProduct else product
                        },
                        successMessage = "Listing updated successfully"
                    )
                },
                onFailure = {
                    _uiState.value.copy(
                        isSaving = false,
                        error = it.message ?: "Failed to update listing"
                    )
                }
            )
        }
    }

    fun deleteListing(productId: String) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isSaving = true, error = null, successMessage = null)

            val result = deleteProductUseCase(productId)

            _uiState.value = result.fold(
                onSuccess = {
                    _uiState.value.copy(
                        isSaving = false,
                        listedProducts = _uiState.value.listedProducts.filterNot { it.id == productId },
                        successMessage = "Listing deleted successfully"
                    )
                },
                onFailure = {
                    _uiState.value.copy(
                        isSaving = false,
                        error = it.message ?: "Failed to delete listing"
                    )
                }
            )
        }
    }

    fun updateSellerOrderStatus(
        orderId: String,
        status: String
    ) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isSaving = true, error = null, successMessage = null)

            val result = updateOrderStatusUseCase(orderId, status)

            _uiState.value = result.fold(
                onSuccess = { updatedOrder ->
                    _uiState.value.copy(
                        isSaving = false,
                        sellerOrders = _uiState.value.sellerOrders.map { order ->
                            if (order.id == orderId) updatedOrder else order
                        },
                        successMessage = when (status.lowercase()) {
                            "completed" -> "Order marked as completed"
                            "placed" -> "Order status set to placed"
                            else -> "Order updated successfully"
                        }
                    )
                },
                onFailure = {
                    _uiState.value.copy(
                        isSaving = false,
                        error = it.message ?: "Failed to update order status"
                    )
                }
            )
        }
    }

    fun clearMessage() {
        _uiState.value = _uiState.value.copy(error = null, successMessage = null)
    }

    fun logout() {
        viewModelScope.launch {
            authRepository.logout()
            _uiState.value = _uiState.value.copy(isLoggedOut = true)
        }
    }
}
