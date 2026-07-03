package com.arif.vl.domain.repository

import android.net.Uri
import com.arif.vl.data.model.UploadImageResponse

/**
 * Contract for file upload operations.
 */
interface UploadRepository {
    suspend fun uploadProductImage(uri: Uri): Result<UploadImageResponse>
}
