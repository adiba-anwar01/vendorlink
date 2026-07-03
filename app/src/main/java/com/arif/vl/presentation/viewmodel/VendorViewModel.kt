package com.arif.vl.presentation.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.arif.vl.data.model.Product
import com.arif.vl.data.model.Vendor
import com.arif.vl.domain.usecase.vendor.GetVendorProductsUseCase
import com.arif.vl.domain.usecase.vendor.GetVendorUseCase
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class VendorUiState(
    val isLoading: Boolean = false,
    val vendor: Vendor? = null,
    val products: List<Product> = emptyList(),
    val error: String? = null
)

@HiltViewModel
class VendorViewModel @Inject constructor(
    private val getVendorUseCase: GetVendorUseCase,
    private val getVendorProductsUseCase: GetVendorProductsUseCase
) : ViewModel() {

    private val _uiState = MutableStateFlow(VendorUiState())
    val uiState: StateFlow<VendorUiState> = _uiState.asStateFlow()

    fun loadVendor(vendorId: String) {
        viewModelScope.launch {
            _uiState.value = VendorUiState(isLoading = true)
            val vendorResult  = getVendorUseCase(vendorId)
            val productsResult = getVendorProductsUseCase(vendorId)

            val vendor   = vendorResult.getOrNull()
            val products = productsResult.getOrElse { emptyList() }

            _uiState.value = if (vendorResult.isSuccess) {
                VendorUiState(
                    vendor   = vendor,
                    products = products
                )
            } else {
                VendorUiState(
                    error    = vendorResult.exceptionOrNull()?.message
                )
            }
        }
    }
}
