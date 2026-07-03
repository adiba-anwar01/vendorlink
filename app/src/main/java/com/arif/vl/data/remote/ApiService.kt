package com.arif.vl.data.remote

import com.arif.vl.data.model.*
import com.google.gson.JsonObject
import okhttp3.MultipartBody
import retrofit2.http.*

/**
 * Retrofit API service interface for VendorLink backend.
 *
 * Backend routes:
 *   /api/auth          → authRoutes.js
 *   /api/products      → productRoutes.js
 *   /api/orders        → orderRoutes.js
 *   /api/conversations → conversationRoutes.js
 *   /api/messages      → messageRoutes.js
 *   /api/location      → locationRoutes.js
 */
interface ApiService {

    // ──────────────────────────────────────────────────────────────────
    // AUTH ENDPOINTS
    // ──────────────────────────────────────────────────────────────────

    @POST("auth/login")
    suspend fun login(@Body request: LoginRequest): AuthResponse

    @POST("auth/register")
    suspend fun register(@Body request: RegisterRequest): AuthResponse

    @GET("auth/profile")
    suspend fun getUserProfile(): UserResponse

    @PUT("auth/profile")
    suspend fun updateUserProfile(@Body request: UpdateProfileRequest): JsonObject

    @POST("auth/update-location")
    suspend fun updateLocation(@Body body: LocationUpdateRequest): Unit

    // ──────────────────────────────────────────────────────────────────
    // PRODUCT ENDPOINTS
    // ──────────────────────────────────────────────────────────────────

    /**
     * Plain product list — no geo filtering.
     * Backend: GET /api/products
     */
    @GET("products")
    suspend fun getProducts(
        @Query("page") page: Int? = null,
        @Query("limit") limit: Int? = null,
        @Query("category") category: String? = null,
        @Query("condition") condition: String? = null,
        @Query("query") query: String? = null,
        @Query("sellerRole") sellerRole: String? = null,
        @Query("status") status: String? = null
    ): ProductListResponse

    /**
     * Geo-filtered nearby product list.
     * Backend: GET /api/products/nearby
     *
     * IMPORTANT — radius is in METERS, not km.
     * Backend uses $geoNear with maxDistance in meters.
     * Backend returns List<Product> with distanceKm already populated.
     */
    @GET("products/nearby")
    suspend fun getNearbyProducts(
        @Query("lat") lat: Double,
        @Query("lng") lng: Double,
        @Query("radius") radiusMeters: Int,
        @Query("page") page: Int? = null,
        @Query("limit") limit: Int? = null,
        @Query("query") query: String? = null
    ): ProductListResponse

    @GET("products/{id}")
    suspend fun getProductById(@Path("id") id: String): ProductDetailResponse

    @POST("products")
    suspend fun addProduct(@Body product: CreateProductRequest): CreateProductResponse

    @Multipart
    @POST("products/upload")
    suspend fun uploadImage(
        @Part image: MultipartBody.Part
    ): UploadImageResponse

    @PUT("products/{id}")
    suspend fun updateProduct(
        @Path("id") id: String,
        @Body product: UpdateProductRequest
    ): ProductDetailResponse

    @DELETE("products/{id}")
    suspend fun deleteProduct(@Path("id") id: String): Unit

    // ──────────────────────────────────────────────────────────────────
    // ORDER ENDPOINTS
    // ──────────────────────────────────────────────────────────────────

    @POST("orders/{productId}")
    suspend fun placeOrder(
        @Path("productId") productId: String,
        @Body request: PlaceOrderRequest
    ): Order

    @GET("orders/my/orders")
    suspend fun getMyOrders(): List<Order>

    @GET("orders/seller/orders")
    suspend fun getSellerOrders(): List<Order>

    @GET("orders/{id}")
    suspend fun getOrderDetails(@Path("id") id: String): Order

    @PUT("orders/{id}/status")
    suspend fun updateOrderStatus(
        @Path("id") id: String,
        @Body request: UpdateOrderStatusRequest
    ): Order

    // ──────────────────────────────────────────────────────────────────
    // CONVERSATION & MESSAGE ENDPOINTS
    // ──────────────────────────────────────────────────────────────────

    @POST("conversations/{productId}")
    suspend fun startConversation(
        @Path("productId") productId: String,
        @Body request: StartConversationRequest
    ): Conversation

    @GET("conversations/myconvo")
    suspend fun getMyConversations(): List<Conversation>

    @PUT("conversations/accept/{id}")
    suspend fun acceptConversation(@Path("id") id: String): Conversation

    @PUT("conversations/reject/{id}")
    suspend fun rejectConversation(@Path("id") id: String): Conversation

    @DELETE("conversations/{id}")
    suspend fun deleteConversation(@Path("id") id: String): Unit

    @POST("messages/{conversationId}")
    suspend fun sendMessage(
        @Path("conversationId") conversationId: String,
        @Body request: SendMessageRequest
    ): Message

    @GET("messages/{conversationId}")
    suspend fun getMessages(@Path("conversationId") conversationId: String): List<Message>

    // ──────────────────────────────────────────────────────────────────
    // LOCATION ENDPOINTS
    // ──────────────────────────────────────────────────────────────────

    @GET("location/nearby")
    suspend fun getNearbyVendors(
        @Query("latitude") latitude: Double,
        @Query("longitude") longitude: Double
    ): NearbyVendorsResponse
}
