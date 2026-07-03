package com.arif.vl.data.model

import com.google.gson.*
import java.lang.reflect.Type

/**
 * Custom deserializer for UserInfo that handles both:
 * - Object format: { _id, name, email, role }
 * - String format: just the user ID
 */
class UserInfoDeserializer : JsonDeserializer<UserInfo> {
    override fun deserialize(
        json: JsonElement,
        typeOfT: Type,
        context: JsonDeserializationContext
    ): UserInfo {
        return when {
            json.isJsonObject -> {
                // Standard object deserialization
                val obj = json.asJsonObject
                UserInfo(
                    id = obj.get("_id")?.asString ?: obj.get("id")?.asString ?: "",
                    name = obj.get("name")?.asString ?: "",
                    email = obj.get("email")?.asString,
                    role = obj.get("role")?.asString
                )
            }
            json.isJsonPrimitive && json.asJsonPrimitive.isString -> {
                // If it's just a string (user ID), create a UserInfo with only the ID
                UserInfo(id = json.asString)
            }
            else -> UserInfo()
        }
    }
}
