package com.arif.vl.presentation.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.arif.vl.data.model.Product
import com.arif.vl.data.model.User
import com.arif.vl.domain.usecase.product.GetProductDetailsUseCase
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import timber.log.Timber
import javax.inject.Inject

data class ProductUiState(
    val isLoading: Boolean = false,
    val product: Product? = null,
    val vendor: User? = null,  // Vendor profile with location
    val error: String? = null
)

@HiltViewModel
class ProductViewModel @Inject constructor(
    private val getProductDetailsUseCase: GetProductDetailsUseCase
) : ViewModel() {

    private val _uiState = MutableStateFlow(ProductUiState())
    val uiState: StateFlow<ProductUiState> = _uiState.asStateFlow()

    fun loadProduct(productId: String) {
        viewModelScope.launch {
            _uiState.value = ProductUiState(isLoading = true)
            val result = getProductDetailsUseCase(productId)
            result.fold(
                onSuccess = { product ->
                    Timber.d("Product loaded: %s, vendorId: %s", product.id, product.vendorId)
                    Timber.d("SellerObj has location: %b, lat=%s, lng=%s", product.sellerObj?.location != null, product.sellerObj?.sellerLat, product.sellerObj?.sellerLng)
                    Timber.d("Product location: lat=%s, lng=%s, address=%s", product.lat, product.lng, product.address)
                    
                    // Show product - seller location should come from product response
                    _uiState.value = ProductUiState(product = product, vendor = null)
                },
                onFailure = {
                    Timber.e(it, "Failed to fetch product")
                    _uiState.value = ProductUiState(error = it.message)
                }
            )
        }
    }
}
