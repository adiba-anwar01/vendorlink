package com.arif.vl.presentation.viewmodel

import android.net.Uri
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.arif.vl.data.location.DeviceLocationProvider
import com.arif.vl.data.model.CreateProductRequest
import com.arif.vl.data.model.LocationData
import com.arif.vl.data.model.Product
import com.arif.vl.domain.repository.UploadRepository
import com.arif.vl.domain.usecase.product.AddProductUseCase
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class AddProductUiState(
    val isLoading: Boolean = false,
    val isSuccess: Boolean = false,
    val error: String? = null,
    val locationPermissionDenied: Boolean = false,
    val isUploadingImage: Boolean = false,
    // Form fields
    val title: String = "",
    val description: String = "",
    val price: String = "",
    val category: String = "",
    val condition: String = "new",  // Backend accepts: "new" or "used"
    val imageUrls: List<String> = emptyList(),
    val location: LocationData? = null
)

@HiltViewModel
class AddProductViewModel @Inject constructor(
    private val addProductUseCase: AddProductUseCase,
    private val deviceLocationProvider: DeviceLocationProvider,
    private val uploadRepository: UploadRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(AddProductUiState())
    val uiState: StateFlow<AddProductUiState> = _uiState.asStateFlow()

    // ── Field updaters ────────────────────────────────────────────────────────
    fun onTitleChange(v: String)       { _uiState.value = _uiState.value.copy(title = v) }
    fun onDescriptionChange(v: String) { _uiState.value = _uiState.value.copy(description = v) }
    fun onPriceChange(v: String)       { _uiState.value = _uiState.value.copy(price = v) }
    fun onCategoryChange(v: String)    { _uiState.value = _uiState.value.copy(category = v) }
    fun onConditionChange(v: String)   { _uiState.value = _uiState.value.copy(condition = v) }
    fun removeImage(imageUrl: String) {
        _uiState.value = _uiState.value.copy(
            imageUrls = _uiState.value.imageUrls.filterNot { it == imageUrl }
        )
    }

    fun onLocationPermissionDenied() {
        _uiState.value = _uiState.value.copy(
            isLoading = false,
            locationPermissionDenied = true,
            error = "Location permission is required to upload a product"
        )
    }

    fun uploadSelectedImage(uri: Uri) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(
                isUploadingImage = true,
                error = null
            )
            val result = uploadRepository.uploadProductImage(uri)
            _uiState.value = result.fold(
                onSuccess = { response ->
                    _uiState.value.copy(
                        isUploadingImage = false,
                        imageUrls = _uiState.value.imageUrls + response.url
                    )
                },
                onFailure = {
                    _uiState.value.copy(
                        isUploadingImage = false,
                        error = it.message ?: "Failed to upload image"
                    )
                }
            )
        }
    }

    fun fetchCurrentLocation() {
        val currentState = _uiState.value
        viewModelScope.launch {
            _uiState.value = currentState.copy(
                isLoading = true,
                error = null,
                locationPermissionDenied = false
            )
            val result = deviceLocationProvider.getCurrentLocation()
            _uiState.value = result.fold(
                onSuccess = { location ->
                    _uiState.value.copy(
                        isLoading = false,
                        locationPermissionDenied = false,
                        location = location
                    )
                },
                onFailure = {
                    _uiState.value.copy(
                        isLoading = false,
                        locationPermissionDenied = false,
                        error = it.message ?: "Unable to fetch current location"
                    )
                }
            )
        }
    }

    fun submit() {
        val state = _uiState.value
        if (state.title.isBlank() || state.price.isBlank() || state.category.isBlank()) {
            _uiState.value = state.copy(error = "Please fill in all required fields")
            return
        }
        if (state.location == null) {
            _uiState.value = state.copy(error = "Current GPS location is required before posting")
            return
        }
        val priceDouble = state.price.toDoubleOrNull()
        if (priceDouble == null || priceDouble <= 0) {
            _uiState.value = state.copy(error = "Please enter a valid price")
            return
        }
        viewModelScope.launch {
            _uiState.value = state.copy(isLoading = true, error = null)
            val request = CreateProductRequest(
                title       = state.title.trim(),
                description = state.description.trim(),
                price       = priceDouble,
                category    = state.category,
                condition   = state.condition.lowercase(),  // Ensure lowercase: "new" or "used"
                images      = state.imageUrls,
                location    = state.location
            )
            val result = addProductUseCase(request)
            _uiState.value = result.fold(
                onSuccess = { _uiState.value.copy(isLoading = false, isSuccess = true) },
                onFailure = { _uiState.value.copy(isLoading = false, error = it.message ?: "Failed to add product") }
            )
        }
    }

    fun resetState() {
        _uiState.value = AddProductUiState()
    }
}
