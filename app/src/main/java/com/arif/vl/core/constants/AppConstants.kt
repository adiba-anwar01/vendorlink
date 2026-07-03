package com.arif.vl.core.constants

/**
 * Application-wide constants extracted from hardcoded values throughout the codebase.
 */
object AppConstants {

    /** Default product categories displayed in the home screen filter. */
    val DEFAULT_CATEGORIES = listOf(
        "All",
        "Electronics",
        "Clothing",
        "Books",
        "Furniture",
        "Sports",
        "Other"
    )

    /** Default seller role filter for fetching products. */
    const val SELLER_ROLE_VENDOR = "vendor"

    /** Product status values. */
    const val PRODUCT_STATUS_OPEN = "open"
    const val PRODUCT_STATUS_SOLD = "sold"

    /** Conversation status values. */
    const val CONVERSATION_STATUS_ACTIVE = "active"
    const val CONVERSATION_STATUS_ACCEPTED = "accepted"
    const val CONVERSATION_STATUS_REJECTED = "rejected"

    /** Order status values. */
    const val ORDER_STATUS_PLACED = "placed"
    const val ORDER_STATUS_COMPLETED = "completed"

    /** Message type values. */
    const val MESSAGE_TYPE_TEXT = "text"
    const val MESSAGE_TYPE_OFFER = "offer"

    /** Product condition values. */
    const val CONDITION_NEW = "new"
    const val CONDITION_USED = "used"
}
