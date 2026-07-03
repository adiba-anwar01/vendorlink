package com.arif.vl.data.model

import com.google.gson.annotations.SerializedName

// ──────────────────────────────────────────────────────────────────
// AUTH RESPONSE MODELS (Use LoginRequest/RegisterRequest from AuthModels.kt)
// ──────────────────────────────────────────────────────────────────

data class ForgotPasswordRequest(
    val email: String
)

data class UserResponse(
    val user: User? = null
)

data class UpdateProfileRequest(
    val name: String,
    val email: String,
    val phone: String? = null
)

data class LocationUpdateRequest(
    val latitude: Double,
    val longitude: Double
)

// ──────────────────────────────────────────────────────────────────
// PRODUCT MODELS
// ──────────────────────────────────────────────────────────────────

// Product API responses - Backend returns directly, not wrapped
typealias ProductListResponse = List<Product>
typealias ProductDetailResponse = Product

data class CreateProductRequest(
    val title: String,
    val description: String,
    val price: Double,
    val category: String,
    val condition: String,  // Backend only accepts: "new" or "used"
    val images: List<String> = emptyList(),
    val location: LocationData? = null
)

data class UploadImageResponse(
    val url: String,
    val publicId: String? = null
)

// Backend returns product directly, not wrapped
typealias CreateProductResponse = Product

data class UpdateProductRequest(
    val title: String? = null,
    val description: String? = null,
    val price: Double? = null,
    val category: String? = null,
    val condition: String? = null
)


// ──────────────────────────────────────────────────────────────────
// ORDER MODELS
// ──────────────────────────────────────────────────────────────────

data class PlaceOrderRequest(
    val deliveryAddress: String,
    val phoneNumber: String,
    val notes: String? = null
)

data class UpdateOrderStatusRequest(
    val status: String  // Backend allows: "placed", "completed"
)

data class Order(
    @SerializedName("_id", alternate = ["id"])
    val id: String = "",
    val product: OrderProductInfo? = null,
    val buyer: UserInfo? = null,
    val seller: UserInfo? = null,
    val status: String = "placed",
    val priceAtOrder: Double = 0.0,
    val totalAmount: Double = 0.0,
    val deliveryAddress: String = "",
    val phoneNumber: String = "",
    val notes: String? = null,
    val createdAt: String = "",
    val updatedAt: String? = null
)

/**
 * Product info embedded in Order.
 * Backend populates: title, price, category, condition, status
 */
data class OrderProductInfo(
    @SerializedName("_id", alternate = ["id"])
    val id: String = "",
    val title: String = "",
    val price: Double = 0.0,
    val category: String? = null,
    val condition: String? = null,
    val status: String? = null,
    val images: List<String>? = null
)

data class ProductInfo(
    @SerializedName("_id", alternate = ["id"])
    val id: String = "",
    val title: String = "",
    val price: Double? = null
)

data class UserInfo(
    @SerializedName("_id", alternate = ["id"])
    val id: String = "",
    val name: String = "",
    val email: String? = null,
    val role: String? = null
)

data class SellerInfo(
    @SerializedName("_id", alternate = ["id"])
    val id: String = "",
    val name: String = "",
    val rating: Float? = null
)

// ──────────────────────────────────────────────────────────────────
// CONVERSATION & MESSAGE MODELS
// ──────────────────────────────────────────────────────────────────

data class StartConversationRequest(
    val initialMessage: String? = null,
    val initialOffer: Double? = null
)

/**
 * Backend returns conversation directly (not wrapped) for startConversation.
 * For getMyConversations, returns array directly.
 */
data class Conversation(
    @SerializedName("_id", alternate = ["id"])
    val id: String = "",
    val product: ProductInfo? = null,
    val buyer: UserInfo? = null,
    val seller: UserInfo? = null,
    val status: String = "active",  // "active", "accepted", "rejected"
    val createdAt: String = "",
    val updatedAt: String? = null
)

data class SendMessageRequest(
    val text: String? = null,
    val offerPrice: Double? = null,
    val messageType: String = "text"  // "text" or "offer"
)

data class Message(
    @SerializedName("_id", alternate = ["id"])
    val id: String = "",
    val conversation: String? = null,
    val sender: UserInfo? = null,
    val messageType: String = "text",
    val text: String? = null,
    val offerPrice: Double? = null,
    val createdAt: String = "",
    val isRead: Boolean = false
)

// ──────────────────────────────────────────────────────────────────
// LOCATION MODELS
// ──────────────────────────────────────────────────────────────────

data class NearbyVendorsResponse(
    val vendors: List<VendorInfo>
)

data class VendorInfo(
    val id: String,
    val name: String,
    val distance: Double,  // km
    val productCount: Int,
    val rating: Float? = null
)

// ──────────────────────────────────────────────────────────────────
// VENDOR MODELS
// ──────────────────────────────────────────────────────────────────

data class VendorDetailResponse(
    val vendor: VendorDetail
)

data class VendorDetail(
    val id: String,
    val name: String,
    val email: String,
    val phone: String? = null,
    val rating: Float? = null,
    val totalProducts: Int = 0,
    val createdAt: String? = null
)

data class VendorProductsResponse(
    val products: List<Product>,
    val pagination: PaginationInfo? = null
)

data class PaginationInfo(
    val total: Int,
    val page: Int,
    val pages: Int,
    val limit: Int
)
