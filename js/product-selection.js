// ============================================
// PRODUCT SELECTION SYSTEM
// Handles the multi-select product grid functionality
// ============================================

// ===== PRODUCT DATA =====
// All available products
const allProducts = [
    "Vest",
    "Jacket (Varsity)",
    "Jacket (Windbreaker)",
    "Jacket (Bomber)",
    "Jacket (Corporate)",
    "Tshirt",
    "Poloshirt",
    "Hoodies (Zipper)",
    "Hoodies (Pullover)",
    "Armsleeve",
    "Sando / Singlet",
    "Jersey",
    "Jogger",
    "P.E Set / Pants",
    "Cap",
    "Totebag",
    "Mug",
    "Umbrella",
    "Ballpen",
    "Tumbler",
    "Lanyard",
    "PVC ID"
];

// ===== PRODUCT SELECTION STATE =====
let selectedProducts = []; // Array to store selected product names

// ===== PRODUCT SELECTION DOM ELEMENTS =====
let productGrid;
let selectedTags;
let selectedProductsInput;
let clearAllBtn;
let selectAllBtn;

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('🛍️ Product Selection System Initializing...');
    
    // Initialize product selection system
    initializeProductSelection();
    
    console.log('✅ Product Selection System Ready');
});

// ===== INITIALIZE PRODUCT SELECTION =====
function initializeProductSelection() {
    console.log('🛍️ Initializing Product Selection System...');
    
    // Get DOM elements
    productGrid = document.getElementById('productGrid');
    selectedTags = document.getElementById('selectedTags');
    selectedProductsInput = document.getElementById('selectedProductsInput');
    clearAllBtn = document.getElementById('clearAllBtn');
    selectAllBtn = document.getElementById('selectAllBtn');
    
    // Check if elements exist
    if (!productGrid || !selectedTags) {
        console.error('❌ Required product selection DOM elements not found');
        return;
    }
    
    // Initialize the product grid
    renderProductGrid();
    
    // Update the selected products display
    updateSelectedDisplay();
    
    // Setup product selection event listeners
    setupProductSelectionListeners();
    
    console.log('✅ Product Selection System Ready');
}

// ===== RENDER PRODUCT GRID =====
function renderProductGrid() {
    console.log('📊 Rendering product grid with', allProducts.length, 'products');
    
    // Clear existing content
    productGrid.innerHTML = '';
    
    // Create product option for each product
    allProducts.forEach(product => {
        const isSelected = selectedProducts.includes(product);
        
        // Create product option element
        const option = document.createElement('div');
        option.className = `product-option ${isSelected ? 'selected' : ''}`;
        option.textContent = product;
        option.dataset.product = product;
        
        // Add click event to toggle selection
        option.addEventListener('click', () => toggleProductSelection(product));
        
        // Add to grid
        productGrid.appendChild(option);
    });
}

// ===== TOGGLE PRODUCT SELECTION =====
function toggleProductSelection(product) {
    console.log('🔄 Toggling product:', product);
    
    const index = selectedProducts.indexOf(product);
    
    if (index === -1) {
        // Product not in array, add it
        selectedProducts.push(product);
        console.log('✅ Product added:', product);
    } else {
        // Product already in array, remove it
        selectedProducts.splice(index, 1);
        console.log('❌ Product removed:', product);
    }
    
    // Update the UI
    renderProductGrid();
    updateSelectedDisplay();
}

// ===== UPDATE SELECTED DISPLAY =====
function updateSelectedDisplay() {
    console.log('🏷️ Updating selected display. Count:', selectedProducts.length);
    
    // Update selected tags
    updateSelectedTags();
    
    // Update hidden input for form submission
    updateHiddenInput();
}

// ===== UPDATE SELECTED TAGS =====
function updateSelectedTags() {
    // Clear existing tags
    selectedTags.innerHTML = '';
    
    if (selectedProducts.length === 0) {
        // Show "no selection" message
        const noSelection = document.createElement('div');
        noSelection.className = 'no-selection';
        noSelection.textContent = 'No products selected yet';
        selectedTags.appendChild(noSelection);
        return;
    }
    
    // Create tag for each selected product
    selectedProducts.forEach(product => {
        const tag = document.createElement('div');
        tag.className = 'selected-tag';
        tag.innerHTML = `
            ${product}
            <span class="remove-tag" data-product="${product}">&times;</span>
        `;
        
        // Add click event to remove button
        const removeBtn = tag.querySelector('.remove-tag');
        removeBtn.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent event bubbling
            toggleProductSelection(product);
        });
        
        selectedTags.appendChild(tag);
    });
}

// ===== UPDATE HIDDEN INPUT =====
function updateHiddenInput() {
    if (!selectedProductsInput) return;
    
    // Store as comma-separated string in hidden input
    selectedProductsInput.value = selectedProducts.join(', ');
    console.log('📝 Hidden input updated:', selectedProductsInput.value);
}

// ===== SETUP PRODUCT SELECTION EVENT LISTENERS =====
function setupProductSelectionListeners() {
    console.log('🎯 Setting up product selection event listeners');
    
    // Clear All button
    if (clearAllBtn) {
        clearAllBtn.addEventListener('click', function() {
            console.log('🗑️ Clear All button clicked');
            clearAllProducts();
        });
    }
    
    // Select All button
    if (selectAllBtn) {
        selectAllBtn.addEventListener('click', function() {
            console.log('✅ Select All button clicked');
            selectAllProducts();
        });
    }
}

// ===== PUBLIC FUNCTIONS =====
/**
 * Returns the currently selected products
 * @returns {Array} Array of selected product names
 */
function getSelectedProducts() {
    return [...selectedProducts]; // Return a copy
}

/**
 * Clears all selected products
 */
function clearAllProducts() {
    selectedProducts = [];
    renderProductGrid();
    updateSelectedDisplay();
}

/**
 * Selects all available products
 */
function selectAllProducts() {
    selectedProducts = [...allProducts];
    renderProductGrid();
    updateSelectedDisplay();
}

/**
 * Toggles a product's selection status
 * @param {string} product - The product name to toggle
 */
function toggleProduct(product) {
    toggleProductSelection(product);
}

// ===== EXPORT FUNCTIONS FOR GLOBAL ACCESS =====
// Make functions available globally for main.js to access
window.productSelection = {
    getSelectedProducts,
    clearAllProducts,
    selectAllProducts,
    toggleProduct
};

console.log('🎉 Product selection system initialized successfully');

