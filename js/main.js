// ============================================
// FORM SUBMISSION SCRIPT
// Main form handling and Google Sheets integration
// ============================================

// ===== CONFIGURATION =====
// Set minimum date to today
document.getElementById('deliveryDate').min = new Date().toISOString().split('T')[0];

// ⚠️ IMPORTANT: REPLACE THIS WITH YOUR GOOGLE APPS SCRIPT URL
// Get it from: Google Apps Script → Deploy → Copy Web App URL
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyPa5NNfzVHj74cV9ZmJzSujq1HD5-lFtULmrb-_Ic6XZsOQGqk0YAfnWfem4_2hQu4/exec";

// ===== DOM ELEMENTS =====
const orderForm = document.getElementById('orderForm');
const loadingMessage = document.getElementById('loadingMessage');
const successMessage = document.getElementById('successMessage');
const errorMessage = document.getElementById('errorMessage');
const submitBtn = document.querySelector('.submit-btn');

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('📋 Markiane Garments Services Quotation Form Initializing...');
    
    // Check if product selection is already initialized
    if (typeof window.productSelection === 'undefined') {
        console.warn('⚠️ Product selection system not loaded. Make sure product-selection.js is included.');
    }
    
    // Setup form submission
    setupFormSubmission();
    
    console.log('✅ Form ready for submission');
    console.log('🔗 Form URL:', window.location.href);
    console.log('📅 Today:', new Date().toLocaleDateString());
});

// ===== SETUP FORM SUBMISSION =====
function setupFormSubmission() {
    console.log('📝 Setting up form submission...');
    
    // Handle form submission
    orderForm.addEventListener('submit', async function (event) {
        event.preventDefault(); // Stop normal form submission
        
        // Validate form before processing
        if (!validateForm()) {
            return;
        }
        
        // Collect form data (including selected products)
        const formData = collectFormData();
        
        // Submit form data
        await submitFormData(formData);
    });
    
    // Setup form validation helpers
    setupFormValidation();
}

// ===== VALIDATE FORM =====
function validateForm() {
    console.log('🔍 Validating form...');
    
    // Validate required fields
    const requiredFields = ['customerName', 'phone', 'address', 'email', 'quantity', 'deliveryDate'];
    let isValid = true;
    
    requiredFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (!field.value.trim()) {
            isValid = false;
            field.style.borderColor = '#dc3545';
        } else {
            field.style.borderColor = '#ddd';
        }
    });
    
    // Validate at least one product is selected
    const selectedProducts = window.productSelection ? window.productSelection.getSelectedProducts() : [];
    if (selectedProducts.length === 0) {
        isValid = false;
        alert('⚠️ Please select at least one product before submitting the form.');
        
        // Scroll to product selection section
        const productSection = document.querySelector('.product-selection-section');
        if (productSection) {
            productSection.scrollIntoView({
                behavior: 'smooth'
            });
        }
        
        // Highlight product grid
        const productGrid = document.getElementById('productGrid');
        if (productGrid) {
            productGrid.style.border = '2px solid #dc3545';
            productGrid.style.borderRadius = '5px';
            setTimeout(() => {
                productGrid.style.border = 'none';
            }, 2000);
        }
    }
    
    if (!isValid) {
        console.warn('❌ Form validation failed');
        alert('Please fill in all required fields (*)');
        return false;
    }
    
    console.log('✅ Form validation passed');
    return true;
}

// ===== COLLECT FORM DATA =====
function collectFormData() {
    console.log('📦 Collecting form data...');
    
    // Get selected products from product selection system
    const selectedProducts = window.productSelection ? window.productSelection.getSelectedProducts() : [];
    
    // Collect form data including selected products
    const formData = {
        customerName: document.getElementById('customerName').value.trim(),
        address: document.getElementById('address').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        email: document.getElementById('email').value.trim(),
        company: document.getElementById('company').value.trim(),
        position: document.getElementById('position').value.trim(),
        products: selectedProducts.join(', '), // Get from multi-select system
        quantity: document.getElementById('quantity').value.trim(),
        details: document.getElementById('details').value.trim(),
        deliveryDate: document.getElementById('deliveryDate').value,
        notes: document.getElementById('notes').value.trim(),
        timestamp: new Date().toLocaleString() // Add timestamp for tracking
    };
    
    console.log('📊 Form data collected:', formData);
    return formData;
}

// ===== SUBMIT FORM DATA =====
async function submitFormData(formData) {
    console.log('🚀 Submitting form data...');
    
    // Show loading state
    showLoadingState(true);
    
    // Send data to Google Sheets
    try {
        // Method 1: Using fetch with no-cors
        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors', // Important for Google Apps Script
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        
        // Note: With 'no-cors' we can't read the response, but that's OK
        // The data is sent to Google Sheets
        
        // Show success message
        showLoadingState(false);
        showMessage('success');
        
        // Reset form
        resetForm();
        
        // Scroll to top to show success message
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // Log to console (for debugging)
        console.log('✅ Form data sent to Google Sheets:', formData);
        console.log('📊 Please check your Google Sheet for the new entry');
        
    } catch (error) {
        // Show error message
        showLoadingState(false);
        showMessage('error');
        
        console.log('⚠️ Note: Data was sent, but response could not be read:', error);
        console.log('📊 Please check Google Sheets - data was likely saved');
        
    } finally {
        // Auto-hide messages after 10 seconds
        setTimeout(() => {
            successMessage.style.display = 'none';
            errorMessage.style.display = 'none';
        }, 10000);
    }
}

// ===== UI HELPER FUNCTIONS =====
function showLoadingState(isLoading) {
    if (isLoading) {
        loadingMessage.style.display = 'block';
        successMessage.style.display = 'none';
        errorMessage.style.display = 'none';
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    } else {
        loadingMessage.style.display = 'none';
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Order';
    }
}

function showMessage(type) {
    successMessage.style.display = type === 'success' ? 'block' : 'none';
    errorMessage.style.display = type === 'error' ? 'block' : 'none';
}

function resetForm() {
    // Reset form inputs
    orderForm.reset();
    
    // Reset product selection if available
    if (window.productSelection && window.productSelection.clearAllProducts) {
        window.productSelection.clearAllProducts();
    }
    
    // Reset date min to today
    document.getElementById('deliveryDate').min = new Date().toISOString().split('T')[0];
    
    console.log('🔄 Form reset complete');
}

// ===== SETUP FORM VALIDATION HELPERS =====
function setupFormValidation() {
    console.log('🔧 Setting up form validation helpers...');
    
    // Reset field borders when user starts typing
    const inputs = document.querySelectorAll('input, textarea');
    inputs.forEach(input => {
        input.addEventListener('input', function () {
            this.style.borderColor = '#ddd';
        });
    });
}

console.log('🎉 Form submission system initialized successfully');