package com.arif.vl

import android.app.Application
import coil.ImageLoader
import coil.ImageLoaderFactory
import coil.disk.DiskCache
import coil.memory.MemoryCache
import coil.request.CachePolicy
import dagger.hilt.android.HiltAndroidApp
import okhttp3.OkHttpClient
import java.util.concurrent.TimeUnit

/**
 * Entry point for Hilt and Coil.
 *
 * Coil is configured here with:
 *  - Memory cache  (25% of app RAM)
 *  - Disk cache    (150 MB)  → images survive across cold starts
 *  - Network cache policy    → avoids re-downloading on scroll
 *  - Crossfade enabled       → smooth image transitions
 *
 * Without disk cache every scroll-off / scroll-back triggers a network fetch,
 * which is the primary cause of visible lag in the product grid.
 */
@HiltAndroidApp
class VLApplication : Application(), ImageLoaderFactory {

    override fun onCreate() {
        super.onCreate()
        if (BuildConfig.DEBUG) {
            timber.log.Timber.plant(timber.log.Timber.DebugTree())
        }
    }

    override fun newImageLoader(): ImageLoader {
        return ImageLoader.Builder(this)
            .memoryCache {
                MemoryCache.Builder(this)
                    .maxSizePercent(0.25)   // up to 25% of available RAM
                    .build()
            }
            .diskCache {
                DiskCache.Builder()
                    .directory(cacheDir.resolve("image_cache"))
                    .maxSizeBytes(150L * 1024 * 1024)   // 150 MB
                    .build()
            }
            .networkCachePolicy(CachePolicy.ENABLED)
            .diskCachePolicy(CachePolicy.ENABLED)
            .memoryCachePolicy(CachePolicy.ENABLED)
            .crossfade(true)
            .crossfade(200)         // 200ms – smooth, not sluggish
            .okHttpClient {
                OkHttpClient.Builder()
                    .connectTimeout(10, TimeUnit.SECONDS)
                    .readTimeout(15, TimeUnit.SECONDS)
                    .build()
            }
            .build()
    }
}
