package com.arif.vl.data.repository

import android.content.ContentResolver
import android.content.Context
import android.net.Uri
import android.provider.OpenableColumns
import com.arif.vl.data.model.UploadImageResponse
import com.arif.vl.data.remote.ApiService
import com.arif.vl.domain.repository.UploadRepository
import dagger.hilt.android.qualifiers.ApplicationContext
import java.io.IOException
import javax.inject.Inject
import javax.inject.Singleton
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.MultipartBody
import okhttp3.RequestBody.Companion.toRequestBody

/**
 * Implementation of [UploadRepository].
 */
@Singleton
class UploadRepositoryImpl @Inject constructor(
    private val apiService: ApiService,
    @ApplicationContext private val context: Context
) : UploadRepository {

    override suspend fun uploadProductImage(uri: Uri): Result<UploadImageResponse> = runCatching {
        val contentResolver = context.contentResolver
        val bytes = contentResolver.openInputStream(uri)?.use { input ->
            input.readBytes()
        } ?: throw IOException("Unable to read selected image")

        val mimeType = contentResolver.getType(uri) ?: "image/jpeg"
        val fileName = resolveFileName(contentResolver, uri)
        val imagePart = MultipartBody.Part.createFormData(
            name = "image",
            filename = fileName,
            body = bytes.toRequestBody(mimeType.toMediaTypeOrNull())
        )

        apiService.uploadImage(imagePart)
    }

    private fun resolveFileName(contentResolver: ContentResolver, uri: Uri): String {
        val projection = arrayOf(OpenableColumns.DISPLAY_NAME)
        contentResolver.query(uri, projection, null, null, null)?.use { cursor ->
            val nameIndex = cursor.getColumnIndex(OpenableColumns.DISPLAY_NAME)
            if (nameIndex >= 0 && cursor.moveToFirst()) {
                return cursor.getString(nameIndex)
            }
        }
        return "product_${System.currentTimeMillis()}.jpg"
    }
}
