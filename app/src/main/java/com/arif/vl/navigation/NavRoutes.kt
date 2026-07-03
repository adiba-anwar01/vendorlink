package com.arif.vl.navigation

/** Type-safe route constants for Navigation Compose. */
object NavRoutes {
    const val Splash         = "splash"
    const val Login          = "login"
    const val Signup         = "signup"
    const val ForgotPassword = "forgot_password"
    const val Main           = "main"          // ← navigable; use for simple navigate(NavRoutes.Main)
    const val MainRoute      = "main?startTab={startTab}"  // ← route template for NavGraph registration
    const val Home           = "home"
    const val Messages       = "messages"
    const val ProductDetails = "product_details/{productId}"
    const val VendorProfile  = "vendor_profile/{vendorId}"
    const val Profile        = "profile"
    const val AddProduct     = "add_product"
    const val Conversation   = "conversation/{productId}/{vendorId}"
    const val ConversationFromInbox = "conversation_inbox/{productId}/{conversationId}"
    const val Purchase       = "purchase/{productId}?negotiatedPrice={negotiatedPrice}"
    const val OrderSuccess   = "order_success/{productTitle}"
    const val Wishlist       = "wishlist"

    /** Build the product details route with the actual id. */
    fun productDetails(productId: String) = "product_details/$productId"

    /** Build the vendor profile route with the actual id. */
    fun vendorProfile(vendorId: String) = "vendor_profile/$vendorId"

    /** Build the conversation route with the actual productId and vendorId. */
    fun conversation(productId: String, vendorId: String) = "conversation/$productId/$vendorId"

    /** Build the conversation route from inbox with actual productId and conversationId. */
    fun conversationFromInbox(productId: String, conversationId: String) = "conversation_inbox/$productId/$conversationId"

    /** Build the purchase route with the actual productId and optional negotiatedPrice. */
    fun purchase(productId: String, negotiatedPrice: Double? = null) =
        if (negotiatedPrice != null) "purchase/$productId?negotiatedPrice=$negotiatedPrice"
        else "purchase/$productId"

    /** Navigate to Main shell, optionally starting on a specific tab. */
    fun main(startTab: String? = null) =
        if (startTab != null) "main?startTab=$startTab" else Main

    /** Build the order success route with the product title (URL-encoded). */
    fun orderSuccess(productTitle: String) =
        "order_success/${android.net.Uri.encode(productTitle)}"
}
