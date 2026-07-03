package com.arif.vl.data.location

import android.Manifest
import android.annotation.SuppressLint
import android.content.Context
import android.content.pm.PackageManager
import android.location.Location
import android.location.LocationManager
import androidx.core.content.ContextCompat
import com.arif.vl.data.model.LocationData
import dagger.hilt.android.qualifiers.ApplicationContext
import javax.inject.Inject
import javax.inject.Singleton
import kotlinx.coroutines.suspendCancellableCoroutine
import kotlin.coroutines.resume

@Singleton
class DeviceLocationProvider @Inject constructor(
    @ApplicationContext private val context: Context
) {
    fun hasLocationPermission(): Boolean {
        val hasFinePermission = ContextCompat.checkSelfPermission(
            context,
            Manifest.permission.ACCESS_FINE_LOCATION
        ) == PackageManager.PERMISSION_GRANTED
        val hasCoarsePermission = ContextCompat.checkSelfPermission(
            context,
            Manifest.permission.ACCESS_COARSE_LOCATION
        ) == PackageManager.PERMISSION_GRANTED
        return hasFinePermission || hasCoarsePermission
    }

    @SuppressLint("MissingPermission")
    suspend fun getCurrentLocation(): Result<LocationData> = runCatching {
        check(hasLocationPermission()) { "Location permission is missing" }

        val locationManager = context.getSystemService(Context.LOCATION_SERVICE) as LocationManager
        val lastKnownLocation = suspendCancellableCoroutine<Location?> { continuation ->
            val providers = buildList {
                if (locationManager.isProviderEnabled(LocationManager.GPS_PROVIDER)) {
                    add(LocationManager.GPS_PROVIDER)
                }
                if (locationManager.isProviderEnabled(LocationManager.NETWORK_PROVIDER)) {
                    add(LocationManager.NETWORK_PROVIDER)
                }
            }

            val newestLocation = providers
                .mapNotNull { provider -> locationManager.getLastKnownLocation(provider) }
                .maxByOrNull(Location::getTime)

            continuation.resume(newestLocation)
        } ?: error("Turn on location services and try again")

        LocationData(
            type = "Point",
            coordinates = listOf(lastKnownLocation.longitude, lastKnownLocation.latitude)
        )
    }
}
