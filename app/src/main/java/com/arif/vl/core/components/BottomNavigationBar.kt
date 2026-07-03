package com.arif.vl.core.components

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Chat
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.outlined.Add
import androidx.compose.material.icons.outlined.ChatBubbleOutline
import androidx.compose.material.icons.outlined.FavoriteBorder
import androidx.compose.material.icons.outlined.Home
import androidx.compose.material.icons.outlined.Person
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.unit.dp
import androidx.compose.foundation.shape.RoundedCornerShape
import com.arif.vl.navigation.NavRoutes

data class BottomNavItem(
    val route: String,
    val label: String,
    val selectedIcon: ImageVector,
    val unselectedIcon: ImageVector,
    val showBadge: Boolean = false
)

private val bottomNavItems = listOf(
    BottomNavItem(NavRoutes.Home,       "Home",    Icons.Filled.Home,     Icons.Outlined.Home),
    BottomNavItem(NavRoutes.Messages,   "Messages",Icons.Filled.Chat,     Icons.Outlined.ChatBubbleOutline, showBadge = true),
    BottomNavItem(NavRoutes.AddProduct, "Sell",    Icons.Filled.Add,      Icons.Outlined.Add),
    BottomNavItem(NavRoutes.Profile,    "Profile", Icons.Filled.Person,   Icons.Outlined.Person)
)

/**
 * Bottom navigation bar.
 * @param unreadMessages  Number of unread messages – shown as a badge on the Messages tab.
 */
@Composable
fun VLBottomNavigationBar(
    currentRoute: String?,
    onNavigate: (String) -> Unit,
    unreadMessages: Int = 0,
    modifier: Modifier = Modifier
) {
    Box(
        modifier = modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 12.dp)
            .shadow(16.dp, RoundedCornerShape(32.dp), spotColor = MaterialTheme.colorScheme.primary.copy(alpha = 0.25f))
    ) {
        NavigationBar(
            modifier       = Modifier.clip(RoundedCornerShape(32.dp)),
            containerColor = MaterialTheme.colorScheme.surface,
            contentColor   = MaterialTheme.colorScheme.onSurface,
            tonalElevation = 0.dp
        ) {
            bottomNavItems.forEach { item ->
                val selected    = currentRoute == item.route
                val hasBadge    = item.showBadge && unreadMessages > 0

                NavigationBarItem(
                    selected = selected,
                    onClick  = { onNavigate(item.route) },
                    icon = {
                        if (hasBadge) {
                            BadgedBox(badge = {
                                Badge {
                                    Text(if (unreadMessages > 9) "9+" else "$unreadMessages")
                                }
                            }) {
                                Icon(
                                    imageVector        = if (selected) item.selectedIcon else item.unselectedIcon,
                                    contentDescription = item.label
                                )
                            }
                        } else {
                            Icon(
                                imageVector        = if (selected) item.selectedIcon else item.unselectedIcon,
                                contentDescription = item.label
                            )
                        }
                    },
                    label = {
                        Text(text = item.label, style = MaterialTheme.typography.labelSmall)
                    },
                    colors = NavigationBarItemDefaults.colors(
                        selectedIconColor   = MaterialTheme.colorScheme.primary,
                        selectedTextColor   = MaterialTheme.colorScheme.primary,
                        unselectedIconColor = MaterialTheme.colorScheme.onSurfaceVariant,
                        unselectedTextColor = MaterialTheme.colorScheme.onSurfaceVariant,
                        indicatorColor      = MaterialTheme.colorScheme.primaryContainer
                    )
                )
            }
        }
    }
}
