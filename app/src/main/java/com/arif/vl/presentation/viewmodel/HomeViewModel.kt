package com.arif.vl.presentation.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.arif.vl.core.constants.AppConstants
import com.arif.vl.data.location.DeviceLocationProvider
import com.arif.vl.data.model.LocationData
import com.arif.vl.data.model.Product
import com.arif.vl.domain.repository.AuthRepository
import com.arif.vl.domain.repository.ProductRepository
import com.arif.vl.domain.usecase.product.GetProductsUseCase
import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject
import kotlin.math.asin
import kotlin.math.cos
import kotlin.math.pow
import kotlin.math.roundToInt
import kotlin.math.sin
import kotlin.math.sqrt
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import timber.log.Timber

enum class SortOption(val label: String) {
    LATEST("Latest"),
    PRICE_LOW("Price: Low to High"),
    PRICE_HIGH("Price: High to Low"),
    NEARBY("Nearest First")
}

data class HomeUiState(
    val isLoading: Boolean = false,
    val products: List<Product> = emptyList(),
    val allProducts: List<Product> = emptyList(),
    val categories: List<String> = AppConstants.DEFAULT_CATEGORIES,
    val selectedCategory: String = "All",
    val searchQuery: String = "",
    val isNearbyOnly: Boolean = false,
    val nearbyRadiusKm: Float = 5f,
    val pendingRadius: Float = 5f,
    val sortOption: SortOption = SortOption.LATEST,
    val userCity: String = "Add Location",
    val currentLocation: LocationData? = null,
    val error: String? = null,
    val isRefreshing: Boolean = false
)

@HiltViewModel
class HomeViewModel @Inject constructor(
    private val getProductsUseCase: GetProductsUseCase,
    private val productRepository: ProductRepository,
    private val authRepository: AuthRepository,
    private val deviceLocationProvider: DeviceLocationProvider
) : ViewModel() {

    private val _uiState = MutableStateFlow(HomeUiState())
    val uiState: StateFlow<HomeUiState> = _uiState.asStateFlow()

    init {
        loadProducts()
    }

    fun onSearchQueryChange(query: String) {
        _uiState.value = _uiState.value.copy(searchQuery = query)
        applyFilters()
    }

    fun onCategorySelected(category: String) {
        _uiState.value = _uiState.value.copy(selectedCategory = category)
        applyFilters()
    }

    fun updateLocation(city: String) {
        if (city.isNotBlank()) {
            _uiState.value = _uiState.value.copy(userCity = city.trim())
        }
    }

    fun onLocationPermissionDenied() {
        _uiState.value = _uiState.value.copy(
            isLoading = false,
            error = "Location permission is required for distance filtering"
        )
    }

    fun useAutoGps() {
        _uiState.value = _uiState.value.copy(isLoading = true, error = null)
        viewModelScope.launch {
            val locationResult = deviceLocationProvider.getCurrentLocation()
            locationResult.fold(
                onSuccess = { location ->
                    val saveResult = authRepository.updateLocation(location.latitude, location.longitude)
                    if (saveResult.isSuccess) {
                        _uiState.value = _uiState.value.copy(
                            userCity = "Current Location",
                            currentLocation = location,
                            isLoading = false,
                            error = null
                        )
                        // Re-fetch products now that we have a location
                        loadProducts()
                    } else {
                        _uiState.value = _uiState.value.copy(
                            isLoading = false,
                            error = "Failed to save location to profile"
                        )
                    }
                },
                onFailure = {
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        error = it.message ?: "Unable to fetch current location"
                    )
                }
            )
        }
    }

    fun onPendingRadiusChange(radius: Float) {
        _uiState.value = _uiState.value.copy(pendingRadius = radius)
    }

    fun onNearbyApply(radiusKm: Float, enabled: Boolean) {
        if (enabled && _uiState.value.currentLocation == null) {
            _uiState.value = _uiState.value.copy(
                error = "Set your GPS location first to use nearby filtering"
            )
            return
        }
        _uiState.value = _uiState.value.copy(
            isNearbyOnly = enabled,
            nearbyRadiusKm = radiusKm,
            pendingRadius = radiusKm,
            error = null
        )
        // Re-fetch from backend with new radius — don't just filter locally
        loadProducts()
    }

    fun onNearbyClear() {
        _uiState.value = _uiState.value.copy(
            isNearbyOnly = false,
            nearbyRadiusKm = 5f,
            pendingRadius = 5f
        )
        // Re-fetch without the nearby constraint
        loadProducts()
    }

    fun onSortSelected(sort: SortOption) {
        _uiState.value = _uiState.value.copy(sortOption = sort)
        applyFilters()
    }

    fun onRefresh() {
        _uiState.value = _uiState.value.copy(isRefreshing = true)
        loadProducts()
    }

    fun loadProducts() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            val state = _uiState.value
            val location = state.currentLocation

            val result: Result<List<Product>> = if (state.isNearbyOnly && location != null) {
                // ── Nearby mode: let the backend do geo filtering ──────────────
                // Convert km → meters for backend
                val radiusMeters = (state.nearbyRadiusKm * 1000).toInt()
                Timber.d(
                    "Fetching nearby: lat=%f, lng=%f, radius=%dm",
                    location.latitude, location.longitude, radiusMeters
                )
                productRepository.searchNearby(
                    lat = location.latitude,
                    lng = location.longitude,
                    radiusMeters = radiusMeters,
                    query = state.searchQuery.ifBlank { null }
                )
            } else {
                // ── Default mode: plain product list ──────────────────────────
                Timber.d("Fetching all products")
                getProductsUseCase(
                    category = if (state.selectedCategory == "All") null else state.selectedCategory,
                    sellerRole = AppConstants.SELLER_ROLE_VENDOR
                )
            }

            val baseProducts = result.fold(
                onSuccess = { products ->
                    Timber.d("API returned %d products", products.size)
                    products.filter {
                        (it.status == AppConstants.PRODUCT_STATUS_OPEN || it.status.isBlank()) && it.vendorRole == AppConstants.SELLER_ROLE_VENDOR
                    }
                },
                onFailure = { error ->
                    Timber.e(error, "API error")
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        isRefreshing = false,
                        error = error.message
                    )
                    emptyList()
                }
            )

            // Compute client-side distances for display (products from nearby API
            // already have distanceKm from backend; this fills it in for plain list mode)
            val productsWithDistance = applyDistances(baseProducts, location)

            val dynamicCategories = AppConstants.DEFAULT_CATEGORIES.toMutableList()
            val extraCategories = productsWithDistance.map { it.category }
                .filter { it.isNotBlank() && !AppConstants.DEFAULT_CATEGORIES.contains(it) }
                .distinct()
                .sorted()
            dynamicCategories.addAll(extraCategories)

            _uiState.value = _uiState.value.copy(
                isLoading = false,
                isRefreshing = false,
                allProducts = productsWithDistance,
                // Note: applyNearby() removed — backend already filtered by distance
                products = applySort(applyCategory(applySearch(productsWithDistance))),
                categories = dynamicCategories,
                error = result.exceptionOrNull()?.message
            )
        }
    }

    private fun applyFilters() {
        val base = _uiState.value.allProducts
        _uiState.value = _uiState.value.copy(
            products = applySort(applyCategory(applySearch(base)))
        )
    }

    private fun applyCategory(list: List<Product>): List<Product> {
        val selected = _uiState.value.selectedCategory.trim()
        return if (selected.equals("All", ignoreCase = true)) {
            list
        } else {
            list.filter { it.category.trim().contains(selected, ignoreCase = true) }
        }
    }

    private fun applySearch(list: List<Product>): List<Product> {
        val query = _uiState.value.searchQuery.trim()
        return if (query.isBlank()) {
            list
        } else {
            list.filter {
                it.title.contains(query, ignoreCase = true) ||
                    it.category.contains(query, ignoreCase = true)
            }
        }
    }

    private fun applySort(list: List<Product>): List<Product> = when (_uiState.value.sortOption) {
        SortOption.PRICE_LOW -> list.sortedBy { it.price }
        SortOption.PRICE_HIGH -> list.sortedByDescending { it.price }
        SortOption.NEARBY -> list.sortedBy { if (it.distanceKm < 0.0) Double.MAX_VALUE else it.distanceKm }
        SortOption.LATEST -> list
    }

    /**
     * Computes haversine distance for products that don't already have a distanceKm
     * from the backend (i.e. plain list mode). Products returned by /nearby already
     * have distanceKm set; we skip recalculation for those.
     */
    private fun applyDistances(
        products: List<Product>,
        currentLocation: LocationData?
    ): List<Product> {
        return products.map { product ->
            // If backend already gave us a real distance, keep it
            if (product.distanceKm >= 0.0 && product.distanceKm != 0.0) {
                return@map product
            }

            val productLatitude = product.locationLatitude
            val productLongitude = product.locationLongitude
            val distanceKm = if (
                currentLocation == null ||
                (productLatitude == 0.0 && productLongitude == 0.0)
            ) {
                -1.0 // Unknown — no location data
            } else {
                haversineDistanceKm(
                    startLatitude = currentLocation.latitude,
                    startLongitude = currentLocation.longitude,
                    endLatitude = productLatitude,
                    endLongitude = productLongitude
                )
            }

            product.copy(
                distanceKm = distanceKm,
                lat = productLatitude,
                lng = productLongitude
            )
        }
    }

    private fun haversineDistanceKm(
        startLatitude: Double,
        startLongitude: Double,
        endLatitude: Double,
        endLongitude: Double
    ): Double {
        val earthRadiusKm = 6371.0
        val latDelta = Math.toRadians(endLatitude - startLatitude)
        val lonDelta = Math.toRadians(endLongitude - startLongitude)
        val startLatRad = Math.toRadians(startLatitude)
        val endLatRad = Math.toRadians(endLatitude)

        val a = sin(latDelta / 2).pow(2) +
            cos(startLatRad) * cos(endLatRad) * sin(lonDelta / 2).pow(2)
        val c = 2 * asin(sqrt(a))
        return ((earthRadiusKm * c) * 10.0).roundToInt() / 10.0
    }
}