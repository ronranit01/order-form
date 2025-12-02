// Product Slider Functionality
document.addEventListener('DOMContentLoaded', function() {
    const productSlider = document.getElementById('productSlider');
    
    // Array of product images (assuming you have images 1-8)
    const productImages = [];
    for (let i = 1; i <= 8; i++) {
        productImages.push(`images/products/${i}.png`);
    }
    
    // Create slides - we'll duplicate the images for seamless scrolling
    function createSlides() {
        productSlider.innerHTML = '';
        
        // Create three sets of images for seamless scrolling
        for (let set = 0; set < 3; set++) {
            productImages.forEach((imgSrc, index) => {
                const slide = document.createElement('div');
                slide.className = 'product-slide';
                
                const img = document.createElement('img');
                img.src = imgSrc;
                img.alt = `Product ${index + 1}`;
                img.loading = 'lazy';
                
                // Add error handling for missing images
                img.onerror = function() {
                    this.src = 'https://placehold.co/200x200/667eea/ffffff?text=Product+' + (index + 1);
                };
                
                slide.appendChild(img);
                productSlider.appendChild(slide);
            });
        }
    }
    
    // Initialize the slider
    createSlides();
    
    // Handle scroll animation on hover
    productSlider.addEventListener('mouseenter', function() {
        this.style.animationPlayState = 'paused';
    });
    
    productSlider.addEventListener('mouseleave', function() {
        this.style.animationPlayState = 'running';
    });
    
    // Pause animation when user touches the slider on mobile
    productSlider.addEventListener('touchstart', function() {
        this.style.animationPlayState = 'paused';
    });
    
    productSlider.addEventListener('touchend', function() {
        this.style.animationPlayState = 'running';
    });
    
    // Reset animation when it completes for seamless loop
    productSlider.addEventListener('animationiteration', function() {
        // When animation completes one cycle, reset to middle position
        const sliderWidth = productSlider.scrollWidth / 3;
        if (this.offsetLeft <= -sliderWidth * 2) {
            this.style.animation = 'none';
            void this.offsetWidth; // Trigger reflow
            this.style.animation = 'scroll 40s linear infinite';
        }
    });
    
    // Adjust animation speed based on screen size
    function adjustAnimationSpeed() {
        const isMobile = window.innerWidth <= 768;
        productSlider.style.animationDuration = isMobile ? '30s' : '40s';
    }
    
    // Initial adjustment
    adjustAnimationSpeed();
    
    // Adjust on resize
    window.addEventListener('resize', adjustAnimationSpeed);
    
    // Add click event to slides
    document.addEventListener('click', function(e) {
        if (e.target.closest('.product-slide')) {
            const slide = e.target.closest('.product-slide');
            slide.classList.add('clicked');
            setTimeout(() => {
                slide.classList.remove('clicked');
            }, 300);
        }
    });
});