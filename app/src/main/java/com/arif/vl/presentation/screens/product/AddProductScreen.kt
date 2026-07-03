package com.arif.vl.presentation.screens.product

import android.Manifest
import androidx.activity.compose.BackHandler
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Close
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavController
import coil.compose.AsyncImage
import com.arif.vl.core.components.PrimaryButton
import com.arif.vl.core.components.VLTopAppBar
import com.arif.vl.core.theme.VLSpacing
import com.arif.vl.core.utils.ConfirmationDialog
import com.arif.vl.presentation.viewmodel.AddProductViewModel

private val CONDITIONS = listOf("new", "used")
private val CATEGORIES = listOf("Electronics", "Clothing", "Books", "Furniture", "Sports", "Vehicles", "Other")

@OptIn(ExperimentalMaterial3Api::class, ExperimentalLayoutApi::class)
@Composable
fun AddProductScreen(
    navController: NavController,
    viewModel: AddProductViewModel = hiltViewModel()
) {
    val state by viewModel.uiState.collectAsState()
    val locationPermissionLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestPermission()
    ) { granted ->
        if (granted) {
            viewModel.fetchCurrentLocation()
        } else {
            viewModel.onLocationPermissionDenied()
        }
    }
    val imagePickerLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.GetContent()
    ) { uri ->
        if (uri != null) {
            viewModel.uploadSelectedImage(uri)
        }
    }

    var showConfirmDialog by remember { mutableStateOf(false) }

    LaunchedEffect(state.isSuccess) {
        if (state.isSuccess) {
            viewModel.resetState()
            navController.popBackStack()
        }
    }

    // Check if form has unsaved data
    fun hasUnsavedData(): Boolean {
        return state.title.isNotBlank() || 
               state.description.isNotBlank() || 
               state.price.isNotBlank() ||
               state.category.isNotBlank() ||
               state.condition.isNotBlank() ||
               state.location != null ||
               state.imageUrls.isNotEmpty()
    }

    // Handle back button with confirmation if there are unsaved changes
    BackHandler {
        if (hasUnsavedData()) {
            showConfirmDialog = true
        } else {
            navController.popBackStack()
        }
    }

    var conditionExpanded by remember { mutableStateOf(false) }
    var categoryExpanded by remember { mutableStateOf(false) }

    Scaffold(
        topBar = {
            VLTopAppBar(
                title = "New Listing",
                showBackButton = true,
                onBackClick = {
                    if (hasUnsavedData()) {
                        showConfirmDialog = true
                    } else {
                        navController.popBackStack()
                    }
                }
            )
        }
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .verticalScroll(rememberScrollState())
                .padding(VLSpacing.md),
            verticalArrangement = Arrangement.spacedBy(VLSpacing.md)
        ) {
            OutlinedTextField(
                value = state.title,
                onValueChange = viewModel::onTitleChange,
                label = { Text("Product Title *") },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true,
                shape = MaterialTheme.shapes.medium
            )

            OutlinedTextField(
                value = state.description,
                onValueChange = viewModel::onDescriptionChange,
                label = { Text("Description *") },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(120.dp),
                maxLines = 5,
                shape = MaterialTheme.shapes.medium
            )

            OutlinedTextField(
                value = state.price,
                onValueChange = viewModel::onPriceChange,
                label = { Text("Price (Rs) *") },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true,
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                shape = MaterialTheme.shapes.medium
            )

            OutlinedTextField(
                value = if (state.location == null) "Current GPS location required *" else "GPS location captured",
                onValueChange = {},
                readOnly = true,
                label = { Text("Product Location *") },
                modifier = Modifier.fillMaxWidth(),
                supportingText = {
                    val location = state.location
                    if (location == null) {
                        Text("Attach the device location before posting")
                    } else {
                        Text("Lat ${location.latitude}, Lng ${location.longitude}")
                    }
                },
                shape = MaterialTheme.shapes.medium
            )

            OutlinedButton(
                onClick = {
                    locationPermissionLauncher.launch(Manifest.permission.ACCESS_FINE_LOCATION)
                },
                modifier = Modifier.fillMaxWidth()
            ) {
                Text(
                    if (state.location == null) "Use Current GPS Location"
                    else "Refresh GPS Location"
                )
            }

            ExposedDropdownMenuBox(
                expanded = categoryExpanded,
                onExpandedChange = { categoryExpanded = it }
            ) {
                OutlinedTextField(
                    value = state.category.ifBlank { "Select Category *" },
                    onValueChange = {},
                    readOnly = true,
                    label = { Text("Category *") },
                    modifier = Modifier
                        .fillMaxWidth()
                        .menuAnchor(MenuAnchorType.PrimaryNotEditable, true),
                    trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = categoryExpanded) },
                    shape = MaterialTheme.shapes.medium
                )
                ExposedDropdownMenu(
                    expanded = categoryExpanded,
                    onDismissRequest = { categoryExpanded = false }
                ) {
                    CATEGORIES.forEach { category ->
                        DropdownMenuItem(
                            text = { Text(category) },
                            onClick = {
                                viewModel.onCategoryChange(category)
                                categoryExpanded = false
                            }
                        )
                    }
                }
            }

            ExposedDropdownMenuBox(
                expanded = conditionExpanded,
                onExpandedChange = { conditionExpanded = it }
            ) {
                OutlinedTextField(
                    value = state.condition,
                    onValueChange = {},
                    readOnly = true,
                    label = { Text("Condition *") },
                    modifier = Modifier
                        .fillMaxWidth()
                        .menuAnchor(MenuAnchorType.PrimaryNotEditable, true),
                    trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = conditionExpanded) },
                    shape = MaterialTheme.shapes.medium
                )
                ExposedDropdownMenu(
                    expanded = conditionExpanded,
                    onDismissRequest = { conditionExpanded = false }
                ) {
                    CONDITIONS.forEach { condition ->
                        DropdownMenuItem(
                            text = { Text(condition.replaceFirstChar(Char::uppercase)) },
                            onClick = {
                                viewModel.onConditionChange(condition)
                                conditionExpanded = false
                            }
                        )
                    }
                }
            }

            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant),
                shape = MaterialTheme.shapes.medium
            ) {
                Column(
                    modifier = Modifier.padding(VLSpacing.md),
                    verticalArrangement = Arrangement.spacedBy(VLSpacing.md)
                ) {
                    Text(
                        text = "Product Photos",
                        style = MaterialTheme.typography.titleSmall
                    )

                    if (state.imageUrls.isEmpty()) {
                        Surface(
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(120.dp),
                            shape = RoundedCornerShape(16.dp),
                            color = MaterialTheme.colorScheme.surface,
                            border = BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant)
                        ) {
                            Box(
                                modifier = Modifier.fillMaxSize(),
                                contentAlignment = Alignment.Center
                            ) {
                                Text(
                                    text = "No photos added yet",
                                    style = MaterialTheme.typography.bodyMedium,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                            }
                        }
                    } else {
                        FlowRow(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(VLSpacing.sm),
                            verticalArrangement = Arrangement.spacedBy(VLSpacing.sm)
                        ) {
                            state.imageUrls.forEach { imageUrl ->
                                Surface(
                                    shape = RoundedCornerShape(16.dp),
                                    shadowElevation = 1.dp
                                ) {
                                    Box {
                                        AsyncImage(
                                            model = imageUrl,
                                            contentDescription = "Uploaded product image",
                                            modifier = Modifier.size(100.dp),
                                            contentScale = ContentScale.Crop
                                        )
                                        IconButton(
                                            onClick = { viewModel.removeImage(imageUrl) },
                                            modifier = Modifier.align(Alignment.TopEnd)
                                        ) {
                                            Icon(
                                                imageVector = Icons.Outlined.Close,
                                                contentDescription = "Remove image"
                                            )
                                        }
                                    }
                                }
                            }
                        }
                    }

                    HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant)

                    Button(
                        onClick = { imagePickerLauncher.launch("image/*") },
                        modifier = Modifier.fillMaxWidth(),
                        enabled = !state.isUploadingImage
                    ) {
                        if (state.isUploadingImage) {
                            Text("Uploading image...")
                        } else {
                            Text("Add Photo")
                        }
                    }
                }
            }

            state.error?.let { error ->
                Text(
                    text = error,
                    color = MaterialTheme.colorScheme.error,
                    style = MaterialTheme.typography.bodySmall
                )
            }

            Spacer(Modifier.height(VLSpacing.sm))

            PrimaryButton(
                text = "Post Listing",
                onClick = viewModel::submit,
                isLoading = state.isLoading,
                enabled = !state.isUploadingImage
            )

            Spacer(Modifier.height(VLSpacing.xxl))
        }

        // Confirmation dialog for unsaved changes
        ConfirmationDialog(
            isVisible = showConfirmDialog,
            title = "Discard changes?",
            message = "You have unsaved changes. Are you sure you want to leave?",
            confirmText = "Discard",
            dismissText = "Keep Editing",
            isDestructive = false,
            onConfirm = {
                navController.popBackStack()
            },
            onDismiss = {
                showConfirmDialog = false
            }
        )
    }
}
