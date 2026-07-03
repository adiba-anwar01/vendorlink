package com.arif.vl.data.model

import android.util.Log
import com.google.gson.*
import java.lang.reflect.Type

/**
 * Custom deserializer for LocationData that handles:
 * - Standard GeoJSON Point format: { type: "Point", coordinates: [lng, lat] }
 * - Direct coordinates array
 */
class LocationDeserializer : JsonDeserializer<LocationData> {
    companion object {
        private const val TAG = "LocationDeserializer"
    }

    override fun deserialize(
        json: JsonElement,
        typeOfT: Type,
        context: JsonDeserializationContext
    ): LocationData {
        Log.d(TAG, "Deserializing location: ${json.toString().take(200)}")
        
        return when {
            json.isJsonObject -> {
                val obj = json.asJsonObject
                val coordsArray = if (obj.has("coordinates")) {
                    obj.getAsJsonArray("coordinates")
                } else {
                    null
                }
                
                if (coordsArray != null && coordsArray.size() >= 2) {
                    val lng = coordsArray.get(0).asDouble
                    val lat = coordsArray.get(1).asDouble
                    Log.d(TAG, "Parsed location from object: lat=$lat, lng=$lng")
                    LocationData(
                        type = obj.get("type")?.asString ?: "Point",
                        coordinates = listOf(lng, lat)
                    )
                } else {
                    Log.w(TAG, "No valid coordinates array in location object")
                    LocationData()
                }
            }
            json.isJsonArray -> {
                // If it's just an array, treat as [lng, lat]
                val arr = json.asJsonArray
                if (arr.size() >= 2) {
                    val lng = arr.get(0).asDouble
                    val lat = arr.get(1).asDouble
                    Log.d(TAG, "Parsed location from array: lat=$lat, lng=$lng")
                    LocationData(
                        type = "Point",
                        coordinates = listOf(lng, lat)
                    )
                } else {
                    Log.w(TAG, "Invalid coordinates array size: ${arr.size()}")
                    LocationData()
                }
            }
            else -> {
                Log.w(TAG, "Location is not object or array: ${json.javaClass.simpleName}")
                LocationData()
            }
        }
    }
}
