package com.arif.vl.data.model

import android.util.Log
import com.arif.vl.data.model.LocationData
import com.arif.vl.data.model.SellerObject
import com.google.gson.JsonDeserializationContext
import com.google.gson.JsonDeserializer
import com.google.gson.JsonElement
import java.lang.reflect.Type

/**
 * Custom deserializer for SellerObject that handles both:
 * - Object format: { _id, name, role, location? }
 * - String format: just the seller ID
 */
class SellerObjectDeserializer : JsonDeserializer<SellerObject> {
    companion object {
        private const val TAG = "SellerObjectDeserializer"
    }

    override fun deserialize(
        json: JsonElement,
        typeOfT: Type,
        context: JsonDeserializationContext
    ): SellerObject {
        Log.d(TAG, "Deserializing seller: ${json.toString().take(200)}")
        
        return when {
            json.isJsonObject -> {
                // Standard object deserialization
                val obj = json.asJsonObject
                Log.d(TAG, "Seller object keys: ${obj.keySet()}")
                Log.d(TAG, "Has location: ${obj.has("location")}")
                
                val location = if (obj.has("location")) {
                    try {
                        val locationJson = obj.get("location")
                        Log.d(TAG, "Location JSON: ${locationJson.toString().take(200)}")
                        // Manually parse location to avoid deserialization issues
                        if (locationJson.isJsonObject) {
                            val locObj = locationJson.asJsonObject
                            val coordsArray = locObj.getAsJsonArray("coordinates")
                            if (coordsArray != null && coordsArray.size() >= 2) {
                                val lng = coordsArray.get(0).asDouble
                                val lat = coordsArray.get(1).asDouble
                                Log.d(TAG, "Manually parsed location: lat=$lat, lng=$lng")
                                LocationData(
                                    type = locObj.get("type")?.asString ?: "Point",
                                    coordinates = listOf(lng, lat)
                                )
                            } else {
                                null
                            }
                        } else {
                            null
                        }
                    } catch (e: Exception) {
                        Log.e(TAG, "Failed to deserialize location", e)
                        null
                    }
                } else {
                    null
                }
                
                val seller = SellerObject(
                    _id = obj.get("_id")?.asString ?: "",
                    name = obj.get("name")?.asString ?: "",
                    role = obj.get("role")?.asString ?: "",
                    location = location
                )
                Log.d(TAG, "Deserialized seller: ${seller.name}, has location: ${seller.location != null}, lat=${seller.sellerLat}, lng=${seller.sellerLng}")
                seller
            }
            json.isJsonPrimitive && json.asJsonPrimitive.isString -> {
                // If it's just a string (seller ID), create a SellerObject with only the ID
                SellerObject(_id = json.asString)
            }
            else -> SellerObject()
        }
    }
}
