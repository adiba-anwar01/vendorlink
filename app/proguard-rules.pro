# ── Kotlin ─────────────────────────────────────────────────────────────────────
-keepattributes SourceFile,LineNumberTable
-keep class kotlin.Metadata { *; }
-keepclassmembers class **$WhenMappings { *; }

# ── Kotlin Coroutines ───────────────────────────────────────────────────────────
-keepnames class kotlinx.coroutines.internal.MainDispatcherFactory {}
-keepnames class kotlinx.coroutines.CoroutineExceptionHandler {}
-keepclassmembernames class kotlinx.** { volatile <fields>; }

# ── Hilt / Dagger ──────────────────────────────────────────────────────────────
-keep class dagger.hilt.** { *; }
-keep class javax.inject.** { *; }
-keepclasseswithmembers class * {
    @dagger.hilt.android.lifecycle.HiltViewModel <init>(...);
}
-keep @dagger.hilt.android.HiltAndroidApp class * { *; }
-keep @dagger.hilt.android.AndroidEntryPoint class * { *; }

# ── Retrofit + OkHttp ──────────────────────────────────────────────────────────
-dontwarn okhttp3.**
-dontwarn okio.**
-keepattributes Signature
-keepattributes Exceptions
-keep class retrofit2.** { *; }
-keepclassmembernames,allowobfuscation interface * {
    @retrofit2.http.* <methods>;
}

# ── Gson ───────────────────────────────────────────────────────────────────────
-keep class com.google.gson.** { *; }
-keepclassmembers class * {
    @com.google.gson.annotations.SerializedName <fields>;
}

# ── Coil ───────────────────────────────────────────────────────────────────────
-keep class coil.** { *; }
-dontwarn coil.**

# ── App data models ────────────────────────────────────────────────────────────
-keep class com.arif.vl.data.model.** { *; }
-keep class com.arif.vl.data.remote.dto.** { *; }

# ── Compose ────────────────────────────────────────────────────────────────────
-keep class androidx.compose.** { *; }
-keep @androidx.compose.runtime.Composable class * { *; }