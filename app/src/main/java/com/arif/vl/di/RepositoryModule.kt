package com.arif.vl.di

import android.content.Context
import com.arif.vl.data.local.SecureTokenManager
import com.arif.vl.data.remote.ApiService
import com.arif.vl.data.repository.AuthRepositoryImpl
import com.arif.vl.data.repository.ConversationRepositoryImpl
import com.arif.vl.data.repository.OrderRepositoryImpl
import com.arif.vl.data.repository.ProductRepositoryImpl
import com.arif.vl.data.repository.UploadRepositoryImpl
import com.arif.vl.data.repository.UserRepositoryImpl
import com.arif.vl.data.repository.VendorRepositoryImpl
import com.arif.vl.domain.repository.AuthRepository
import com.arif.vl.domain.repository.ConversationRepository
import com.arif.vl.domain.repository.OrderRepository
import com.arif.vl.domain.repository.ProductRepository
import com.arif.vl.domain.repository.UploadRepository
import com.arif.vl.domain.repository.UserRepository
import com.arif.vl.domain.repository.VendorRepository
import com.google.gson.Gson
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

/**
 * Provides repository instances.
 * Binds domain-layer interfaces to their data-layer implementations.
 */
@Module
@InstallIn(SingletonComponent::class)
object RepositoryModule {

    @Provides
    @Singleton
    fun provideAuthRepository(
        apiService: ApiService,
        tokenManager: SecureTokenManager
    ): AuthRepository = AuthRepositoryImpl(apiService, tokenManager)

    @Provides
    @Singleton
    fun provideProductRepository(apiService: ApiService): ProductRepository =
        ProductRepositoryImpl(apiService)

    @Provides
    @Singleton
    fun provideUserRepository(
        apiService: ApiService,
        gson: Gson
    ): UserRepository = UserRepositoryImpl(apiService, gson)

    @Provides
    @Singleton
    fun provideVendorRepository(apiService: ApiService): VendorRepository =
        VendorRepositoryImpl(apiService)

    @Provides
    @Singleton
    fun provideOrderRepository(apiService: ApiService): OrderRepository =
        OrderRepositoryImpl(apiService)

    @Provides
    @Singleton
    fun provideConversationRepository(apiService: ApiService): ConversationRepository =
        ConversationRepositoryImpl(apiService)

    @Provides
    @Singleton
    fun provideUploadRepository(
        apiService: ApiService,
        @ApplicationContext context: Context
    ): UploadRepository = UploadRepositoryImpl(apiService, context)
}
