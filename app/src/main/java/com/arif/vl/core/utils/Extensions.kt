package com.arif.vl.core.utils

import java.text.NumberFormat
import java.util.Locale

/** Format a numeric price with INR currency symbol */
fun Double.toInrString(): String {
    val nf = NumberFormat.getNumberInstance(Locale.US)
    nf.maximumFractionDigits = 2
    return "₹${nf.format(this)}"
}

/** Truncate a string to [maxLength] characters and add ellipsis */
fun String.truncate(maxLength: Int): String =
    if (length > maxLength) "${take(maxLength)}…" else this
