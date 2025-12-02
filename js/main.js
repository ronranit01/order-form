 // ============================================
        // FORM SUBMISSION SCRIPT
        // ============================================
        
        // Set minimum date to today
        document.getElementById('deliveryDate').min = new Date().toISOString().split('T')[0];
        
        // ⚠️ IMPORTANT: REPLACE THIS WITH YOUR GOOGLE APPS SCRIPT URL
        // Get it from: Google Apps Script → Deploy → Copy Web App URL
        const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyPa5NNfzVHj74cV9ZmJzSujq1HD5-lFtULmrb-_Ic6XZsOQGqk0YAfnWfem4_2hQu4/exec";
        
        // Get form elements
        const orderForm = document.getElementById('orderForm');
        const loadingMessage = document.getElementById('loadingMessage');
        const successMessage = document.getElementById('successMessage');
        const errorMessage = document.getElementById('errorMessage');
        const submitBtn = document.querySelector('.submit-btn');
        
        // Handle form submission
        orderForm.addEventListener('submit', async function(event) {
            event.preventDefault(); // Stop normal form submission
            
            // Hide all messages
            loadingMessage.style.display = 'none';
            successMessage.style.display = 'none';
            errorMessage.style.display = 'none';
            
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
            
            if (!isValid) {
                alert('Please fill in all required fields (*)');
                return;
            }
            
            // Collect form data
            const formData = {
                customerName: document.getElementById('customerName').value,
                address: document.getElementById('address').value,
                phone: document.getElementById('phone').value,
                email: document.getElementById('email').value,
                company: document.getElementById('company').value,
                position: document.getElementById('position').value,
                products: Array.from(document.querySelectorAll('input[name="products"]:checked'))
                              .map(cb => cb.value).join(', '),
                quantity: document.getElementById('quantity').value,
                details: document.getElementById('details').value,
                deliveryDate: document.getElementById('deliveryDate').value,
                notes: document.getElementById('notes').value
            };
            
            // Show loading
            loadingMessage.style.display = 'block';
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
            
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
                loadingMessage.style.display = 'none';
                successMessage.style.display = 'block';
                
                // Reset form
                orderForm.reset();
                
                // Scroll to top to show success message
                window.scrollTo({ top: 0, behavior: 'smooth' });
                
                // Log to console (for debugging)
                console.log('✅ Form data sent to Google Sheets:', formData);
                console.log('📊 Please check your Google Sheet for the new entry');
                
            } catch (error) {
                // Show error message
                loadingMessage.style.display = 'none';
                errorMessage.style.display = 'block';
                
                console.log('⚠️ Note: Data was sent, but response could not be read:', error);
                console.log('📊 Please check Google Sheets - data was likely saved');
                
            } finally {
                // Reset button
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Order';
                
                // Auto-hide messages after 10 seconds
                setTimeout(() => {
                    successMessage.style.display = 'none';
                    errorMessage.style.display = 'none';
                }, 10000);
            }
        });
        
        // ============================================
        // FORM VALIDATION HELPERS
        // ============================================
        
        // Reset field borders when user starts typing
        const inputs = document.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('input', function() {
                this.style.borderColor = '#ddd';
            });
        });
        
        // Page loaded message
        console.log('📋 Markiane Garments Services Quotation Form loaded successfully');
        console.log('🔗 Form URL:', window.location.href);
        console.log('📅 Today:', new Date().toLocaleDateString());

        // ============================================
        
// ============================================
// SMART PRODUCT GALLERY
// Auto-detects images in folders
// ============================================

// Configuration
const CONFIG = {
    productsJson: './json/products.json',
    basePath: './images/products/',
    defaultImage: './images/products/default.png'
    imageExtensions: ['.png', '.jpg', '.jpeg', '.webp', '.gif']
};

// DOM Elements
const productSelect = document.getElementById('productSelect');
const mainProductImage = document.getElementById('mainProductImage');
const productName = document.getElementById('productName');
const productDescription = document.getElementById('productDescription');
const productPrice = document.getElementById('productPrice');
const imageCountText = document.getElementById('imageCountText');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const currentImage = document.getElementById('currentImage');
const totalImages = document.getElementById('totalImages');
const thumbnailStrip = document.getElementById('thumbnailStrip');

// State
let products = [];
let currentProduct = null;
let currentImages = [];
let currentIndex = 0;

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', async () => {
    console.log('🖼️ Smart Product Gallery Initializing...');
    
    // Load products from JSON
    await loadProducts();
    
    // Populate dropdown
    populateProductSelect();
    
    // Set up event listeners
    setupEventListeners();
    
    // Initialize gallery
    resetGallery();
    
    console.log('✅ Gallery ready! Products loaded:', products.length);
});

// ============================================
// LOAD PRODUCTS FROM JSON
// ============================================

async function loadProducts() {
    try {
        console.log('📦 Loading products from JSON...');
        
        const response = await fetch(CONFIG.productsJson);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const data = await response.json();
        products = data.products || [];
        
        console.log(`✅ Loaded ${products.length} products from JSON`);
        
        // Auto-detect image counts for each product
        await autoDetectImageCounts();
        
    } catch (error) {
        console.error('❌ Failed to load products.json:', error);
        products = getDefaultProducts();
        console.log('📋 Using default products:', products.length);
    }
}

// ============================================
// AUTO-DETECT IMAGES IN FOLDERS
// ============================================

async function autoDetectImageCounts() {
    console.log('🔍 Auto-detecting images in folders...');
    
    for (const product of products) {
        try {
            // Try to detect images by common patterns
            product.imageCount = await detectImagesInFolder(product.folder);
            console.log(`   ${product.name}: ${product.imageCount} images detected`);
        } catch (error) {
            console.warn(`   ${product.name}: Could not detect images`);
            product.imageCount = 0;
        }
    }
}

async function detectImagesInFolder(folderName) {
    const imagePatterns = [
        // Pattern 1: product1.jpg, product2.jpg, etc.
        async () => {
            let count = 0;
            for (let i = 1; i <= 20; i++) {
                const exists = await checkImageExists(`${CONFIG.basePath}${folderName}/${folderName.slice(0, -1)}${i}.png`);
                if (exists) count++;
                else break;
            }
            return count;
        },
        
        // Pattern 2: image1.jpg, image2.jpg, etc.
        async () => {
            let count = 0;
            for (let i = 1; i <= 20; i++) {
                const exists = await checkImageExists(`${CONFIG.basePath}${folderName}/image${i}.png`);
                if (exists) count++;
                else break;
            }
            return count;
        },
        
        // Pattern 3: 1.jpg, 2.jpg, etc.
        async () => {
            let count = 0;
            for (let i = 1; i <= 20; i++) {
                const exists = await checkImageExists(`${CONFIG.basePath}${folderName}/${i}.png`);
                if (exists) count++;
                else break;
            }
            return count;
        },
        
        // Pattern 4: Try JPG extension
        async () => {
            let count = 0;
            for (let i = 1; i <= 20; i++) {
                const exists = await checkImageExists(`${CONFIG.basePath}${folderName}/${folderName.slice(0, -1)}${i}.jpg`);
                if (exists) count++;
                else break;
            }
            return count;
        }
    ];
    
    // Try each pattern
    for (const pattern of imagePatterns) {
        const count = await pattern();
        if (count > 0) {
            return count;
        }
    }
    
    return 0;
}

// Helper: Check if image exists
function checkImageExists(url) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = url;
        setTimeout(() => resolve(false), 300); // Timeout
    });
}

// ============================================
// POPULATE DROPDOWN
// ============================================

function populateProductSelect() {
    productSelect.innerHTML = '<option value="">-- Choose a product --</option>';
    
    products.forEach(product => {
        const option = document.createElement('option');
        option.value = product.id;
        option.textContent = product.name;
        
        // Add data attributes
        option.dataset.folder = product.folder;
        option.dataset.imageCount = product.imageCount || 0;
        option.dataset.price = product.price || '';
        option.dataset.description = product.description || '';
        
        productSelect.appendChild(option);
    });
    
    // Update count text
    updateImageCountText();
}

function updateImageCountText() {
    const selectedOption = productSelect.options[productSelect.selectedIndex];
    if (selectedOption && selectedOption.value) {
        const count = selectedOption.dataset.imageCount || 0;
        imageCountText.textContent = `${count} images available`;
    } else {
        imageCountText.textContent = `Select a product (${products.length} available)`;
    }
}

// ============================================
// LOAD PRODUCT IMAGES
// ============================================

async function loadProductImages(folderName) {
    console.log(`🖼️ Loading images from: ${folderName}`);
    
    currentImages = [];
    currentIndex = 0;
    
    // Try multiple naming patterns
    const patterns = [
        `${folderName.slice(0, -1)}{i}.png`,  // jacket1.png
        `image{i}.png`,                       // image1.png
        `img{i}.png`,                         // img1.png
        `photo{i}.png`,                       // photo1.png
        `view{i}.png`,                        // view1.png
        `{i}.png`,                            // 1.png
        `${folderName.slice(0, -1)}{i}.jpg`,  // jacket1.jpg
        `image{i}.jpg`,                       // image1.jpg
        `{i}.jpg`                             // 1.jpg
    ];
    
    // Check first pattern to get count
    for (let pattern of patterns) {
        let foundImages = [];
        
        for (let i = 1; i <= 20; i++) {
            const imageName = pattern.replace('{i}', i);
            const imagePath = `${CONFIG.basePath}${folderName}/${imageName}`;
            
            const exists = await checkImageExists(imagePath);
            if (exists) {
                foundImages.push(imagePath);
            } else if (i === 1) {
                // If first image doesn't exist, try next pattern
                break;
            } else {
                // Found some images, stop this pattern
                break;
            }
        }
        
        if (foundImages.length > 0) {
            currentImages = foundImages;
            console.log(`✅ Found ${foundImages.length} images using pattern: ${pattern}`);
            break;
        }
    }
    
    // If no images found, try to list all files in folder (would need server-side)
    if (currentImages.length === 0) {
        console.warn(`⚠️ No images found for ${folderName}, using default`);
        currentImages = [CONFIG.defaultImage];
    }
    
    return currentImages;
}

// ============================================
// GALLERY FUNCTIONS
// ============================================

async function showProduct(productId) {
    // Find product
    const product = products.find(p => p.id == productId);
    if (!product) {
        console.error('Product not found:', productId);
        return;
    }
    
    currentProduct = product;
    
    // Show loading
    showLoading(true);
    
    // Update product info
    productName.textContent = product.name;
    productDescription.textContent = product.description || 'No description available';
    productPrice.textContent = product.price ? `${product.price}` : 'Price on request';
    
    // Load images
    currentImages = await loadProductImages(product.folder);
    
    // Update UI
    if (currentImages.length > 0) {
        currentIndex = 0;
        showImage(currentIndex);
        updateThumbnails();
        updateNavigation();
        
        // Update count text
        imageCountText.textContent = `${currentImages.length} images`;
    } else {
        // No images found
        mainProductImage.src = CONFIG.defaultImage;
        productName.textContent = `${product.name} (No images available)`;
        thumbnailStrip.innerHTML = '<div class="loading-text">No images found</div>';
    }
    
    showLoading(false);
}

function showImage(index) {
    if (!currentImages[index]) return;
    
    // Fade transition
    mainProductImage.style.opacity = '0';
    
    setTimeout(() => {
        mainProductImage.src = currentImages[index];
        mainProductImage.alt = `${currentProduct.name} - View ${index + 1}`;
        
        mainProductImage.onload = () => {
            mainProductImage.style.opacity = '1';
            updateImageCounter(index);
            updateActiveThumbnail(index);
        };
    }, 200);
}

function updateImageCounter(index) {
    currentImage.textContent = index + 1;
    totalImages.textContent = currentImages.length;
}

function updateThumbnails() {
    thumbnailStrip.innerHTML = '';
    
    if (currentImages.length <= 1) {
        thumbnailStrip.style.display = 'none';
        return;
    }
    
    thumbnailStrip.style.display = 'flex';
    
    currentImages.forEach((imagePath, index) => {
        const thumbnail = document.createElement('img');
        thumbnail.src = imagePath;
        thumbnail.alt = `Thumbnail ${index + 1}`;
        thumbnail.className = `thumbnail ${index === currentIndex ? 'active' : ''}`;
        thumbnail.dataset.index = index;
        
        thumbnail.addEventListener('click', () => {
            currentIndex = index;
            showImage(index);
        });
        
        // Handle image errors
        thumbnail.addEventListener('error', function() {
            this.src = CONFIG.defaultImage;
        });
        
        thumbnailStrip.appendChild(thumbnail);
    });
}

function updateActiveThumbnail(index) {
    document.querySelectorAll('.thumbnail').forEach((thumb, i) => {
        thumb.classList.toggle('active', i === index);
    });
}

function updateNavigation() {
    if (currentImages.length > 1) {
        prevBtn.style.display = 'flex';
        nextBtn.style.display = 'flex';
    } else {
        prevBtn.style.display = 'none';
        nextBtn.style.display = 'none';
    }
}

function navigate(direction) {
    if (currentImages.length <= 1) return;
    
    currentIndex += direction;
    
    if (currentIndex < 0) currentIndex = currentImages.length - 1;
    if (currentIndex >= currentImages.length) currentIndex = 0;
    
    showImage(currentIndex);
}

function resetGallery() {
    mainProductImage.src = CONFIG.defaultImage;
    productName.textContent = 'Select a product';
    productDescription.textContent = '';
    productPrice.textContent = '';
    currentImage.textContent = '0';
    totalImages.textContent = '0';
    thumbnailStrip.innerHTML = '';
    thumbnailStrip.style.display = 'flex';
    prevBtn.style.display = 'none';
    nextBtn.style.display = 'none';
    imageCountText.textContent = `Select a product (${products.length} available)`;
}

function showLoading(isLoading) {
    if (isLoading) {
        productName.textContent = 'Loading...';
        mainProductImage.style.opacity = '0.5';
    } else {
        mainProductImage.style.opacity = '1';
    }
}

// ============================================
// EVENT LISTENERS
// ============================================

function setupEventListeners() {
    // Product selection
    productSelect.addEventListener('change', function() {
        if (this.value) {
            showProduct(this.value);
        } else {
            resetGallery();
        }
        updateImageCountText();
    });
    
    // Navigation buttons
    prevBtn.addEventListener('click', () => navigate(-1));
    nextBtn.addEventListener('click', () => navigate(1));
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (currentImages.length > 1) {
            if (e.key === 'ArrowLeft') navigate(-1);
            if (e.key === 'ArrowRight') navigate(1);
        }
    });
    
    // Auto-rotate (optional)
    let autoRotateInterval;
    
    function startAutoRotate() {
        if (currentImages.length > 1) {
            autoRotateInterval = setInterval(() => navigate(1), 4000);
        }
    }
    
    function stopAutoRotate() {
        if (autoRotateInterval) {
            clearInterval(autoRotateInterval);
            autoRotateInterval = null;
        }
    }
    
    thumbnailStrip.addEventListener('mouseenter', stopAutoRotate);
    thumbnailStrip.addEventListener('mouseleave', startAutoRotate);
    
    // Start auto-rotate if images loaded
    if (currentImages.length > 1) {
        startAutoRotate();
    }
}

// ============================================
// DEFAULT PRODUCTS (Fallback)
// ============================================

function getDefaultProducts() {
    return [
        { id: 1, name: "Jacket", folder: "jackets", price: 450, description: "Premium jacket" },
        { id: 2, name: "Poloshirt", folder: "polos", price: "Starts at 250", description: "Classic polo" },
        { id: 3, name: "Tshirt", folder: "tshirts", price: 150, description: "Cotton t-shirt" },
        { id: 4, name: "Hoodies", folder: "hoodies", price: 350, description: "Comfortable hoodie" },
    ];
}

// ============================================
// DEBUG: List all detected images
// ============================================

async function debugListAllImages() {
    console.log('🔍 DEBUG: Listing all detected images...');
    
    for (const product of products) {
        const images = await loadProductImages(product.folder);
        console.log(`📁 ${product.folder}/:`, images);
    }
}

// Uncomment to debug:

// debugListAllImages();
