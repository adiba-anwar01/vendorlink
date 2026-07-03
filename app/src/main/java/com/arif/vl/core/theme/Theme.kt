package com.arif.vl.core.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

// ─── Dark Color Scheme ────────────────────────────────────────────────────────
private val VLDarkColorScheme = darkColorScheme(
    primary                = Indigo500,
    onPrimary              = PureWhite,
    primaryContainer       = Indigo900,
    onPrimaryContainer     = Indigo500,

    secondary              = Teal400,
    onSecondary            = PureBlack,
    secondaryContainer     = Teal500.copy(alpha = 0.2f),
    onSecondaryContainer   = Teal400,

    tertiary               = Slate400,
    onTertiary             = PureWhite,
    tertiaryContainer      = Slate800,
    onTertiaryContainer    = Slate200,

    background             = DarkBackground,
    onBackground           = Slate50,

    surface                = DarkSurface,
    onSurface              = Slate50,
    surfaceVariant         = DarkSurfaceVariant,
    onSurfaceVariant       = Slate400,

    outline                = DarkOutline,
    outlineVariant         = Slate800,

    error                  = ErrorRed,
    onError                = PureWhite,
    errorContainer         = Color(0xFF7F1D1D),
    onErrorContainer       = Color(0xFFFECACA),

    scrim                  = Black87
)

// ─── Light Color Scheme ───────────────────────────────────────────────────────
private val VLLightColorScheme = lightColorScheme(
    primary                = Indigo600,
    onPrimary              = PureWhite,
    primaryContainer       = Indigo500.copy(alpha = 0.1f),
    onPrimaryContainer     = Indigo900,

    secondary              = Teal500,
    onSecondary            = PureWhite,
    secondaryContainer     = Teal500.copy(alpha = 0.1f),
    onSecondaryContainer   = Teal500,

    tertiary               = Slate600,
    onTertiary             = PureWhite,
    tertiaryContainer      = Slate100,
    onTertiaryContainer    = Slate900,

    background             = LightBackground,
    onBackground           = Slate900,

    surface                = LightSurface,
    onSurface              = Slate900,
    surfaceVariant         = LightSurfaceVariant,
    onSurfaceVariant       = Slate600,

    outline                = LightOutline,
    outlineVariant         = Slate300,

    error                  = ErrorRed,
    onError                = PureWhite,
    errorContainer         = Color(0xFFFEE2E2),
    onErrorContainer       = Color(0xFF991B1B),

    scrim                  = Black60
)

@Composable
fun VLTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    val colorScheme = if (darkTheme) VLDarkColorScheme else VLLightColorScheme

    MaterialTheme(
        colorScheme = colorScheme,
        typography  = VLTypography,
        shapes      = VLShapes,
        content     = content
    )
}
