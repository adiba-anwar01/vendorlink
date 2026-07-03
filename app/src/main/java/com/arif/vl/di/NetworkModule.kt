package com.arif.vl.di

import com.arif.vl.BuildConfig
import com.arif.vl.data.model.SellerObjectDeserializer
import android.content.Context
import com.arif.vl.data.local.SecureTokenManager
import com.arif.vl.data.model.LocationData
import com.arif.vl.data.model.LocationDeserializer
import com.arif.vl.data.model.SellerObject
import com.arif.vl.data.model.UserInfo
import com.arif.vl.data.model.UserInfoDeserializer
import com.arif.vl.data.network.AuthInterceptor
import com.arif.vl.data.remote.ApiService
import com.arif.vl.data.remote.socket.SocketManager
import com.google.gson.Gson
import com.google.gson.GsonBuilder
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import dagger.hilt.android.qualifiers.ApplicationContext
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit
import javax.inject.Singleton

/**
 * Provides network-related singletons (OkHttpClient, Retrofit, ApiService).
 *
 * BASE_URL is configured in build.gradle.kts via buildConfigField.
 * To change the server URL, update the buildConfigField in app/build.gradle.kts.
 */
@Module
@InstallIn(SingletonComponent::class)
object NetworkModule {

    @Provides
    @Singleton
    fun provideGson(): Gson = GsonBuilder()
        .setLenient()
        .registerTypeAdapter(SellerObject::class.java, SellerObjectDeserializer())
        .registerTypeAdapter(UserInfo::class.java, UserInfoDeserializer())
        .registerTypeAdapter(LocationData::class.java, LocationDeserializer())
        .create()

    @Provides
    @Singleton
    fun provideSecureTokenManager(@ApplicationContext context: Context): SecureTokenManager =
        SecureTokenManager(context)

    @Provides
    @Singleton
    fun provideSocketManager(tokenManager: SecureTokenManager, gson: Gson): SocketManager {
        val manager = SocketManager(tokenManager, gson)
        manager.connect(BuildConfig.BASE_URL)
        return manager
    }

    @Provides
    @Singleton
    fun provideOkHttpClient(
        @ApplicationContext context: Context,
        tokenManager: SecureTokenManager
    ): OkHttpClient {
        val builder = OkHttpClient.Builder()
            .addInterceptor(AuthInterceptor(tokenManager))
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .writeTimeout(30, TimeUnit.SECONDS)

        // Only add HTTP logging in debug builds
        if (BuildConfig.DEBUG) {
            val logging = HttpLoggingInterceptor().apply {
                level = HttpLoggingInterceptor.Level.HEADERS
            }
            builder.addInterceptor(logging)
        }

        return builder.build()
    }

    @Provides
    @Singleton
    fun provideRetrofit(client: OkHttpClient, gson: Gson): Retrofit =
        Retrofit.Builder()
            .baseUrl(BuildConfig.BASE_URL)
            .client(client)
            .addConverterFactory(GsonConverterFactory.create(gson))
            .build()

    @Provides
    @Singleton
    fun provideApiService(retrofit: Retrofit): ApiService =
        retrofit.create(ApiService::class.java)
}
