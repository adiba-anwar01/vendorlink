package com.arif.vl.domain.model

/**
 * A generic wrapper for representing the state of data operations.
 * Used across the app for consistent success/error/loading semantics.
 */
sealed class Resource<out T> {
    data class Success<T>(val data: T) : Resource<T>()
    data class Error(val message: String, val throwable: Throwable? = null) : Resource<Nothing>()
    data object Loading : Resource<Nothing>()
}
