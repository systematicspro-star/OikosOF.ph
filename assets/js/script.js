// ================================
// REVIEWS PERSISTENCE (LocalStorage)
// ================================

const REVIEWS_STORAGE_KEY = 'oikos_reviews';

// ================================
// ECOMMERCE BOOKING FORM FUNCTIONS
// ================================

function updatePrice() {
    var packageSelect = document.getElementById('packageName');
    var priceDisplay = document.getElementById('displayPrice');
    var checkInInput = document.getElementById('bookingCheckIn');
    var checkOutInput = document.getElementById('bookingCheckOut');
    
    if (!packageSelect || !priceDisplay) {
        return;
    }
    
    var selectedValue = packageSelect.value;
    
    if (!selectedValue || selectedValue === '') {
        priceDisplay.textContent = '---';
        priceDisplay.style.color = '#999';
        return;
    }
    
    var parts = selectedValue.split('|');
    var packageName = parts[0];
    var basePrice = parseInt(parts[1]);
    
    // Calculate number of nights
    var nights = 1; // default to 1 night
    
    if (checkInInput && checkOutInput && checkInInput.value && checkOutInput.value) {
        var checkInDate = new Date(checkInInput.value);
        var checkOutDate = new Date(checkOutInput.value);
        
        if (checkOutDate > checkInDate) {
            var timeDiff = checkOutDate - checkInDate;
            nights = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
        }
    }
    
    // Calculate total price
    var totalPrice = basePrice * nights;
    
    if (basePrice) {
        var formattedPrice = '₱' + totalPrice.toLocaleString('en-PH');
        if (nights > 1) {
            formattedPrice += ' (' + nights + ' nights)';
        }
        
        priceDisplay.textContent = formattedPrice;
        priceDisplay.style.color = '#27ae60';
        
        var priceContainer = document.querySelector('.price-display');
        if (priceContainer) {
            priceContainer.style.transform = 'scale(1.02)';
            setTimeout(function() {
                priceContainer.style.transform = 'scale(1)';
            }, 300);
        }
    }
}

// Sync email to Formspree _replyto field
function syncEmailToReplyTo() {
    var emailInput = document.getElementById('bookingEmail');
    var replytoField = document.getElementById('replyto_field');
    
    if (emailInput && replytoField) {
        replytoField.value = emailInput.value;
    }
}

// Validate phone number
function validatePhoneNumber(phone) {
    // Allow Philippine and international formats: +63, 0, or digits with spaces/dashes
    const phoneRegex = /^(\+63|0)?[0-9\s\-()]+$/;
    return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
}

// Validate email address
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// ================================
// REVIEWS PERSISTENCE (LocalStorage)
// ================================

function saveReviewToStorage(reviewData) {
    let reviews = JSON.parse(localStorage.getItem(REVIEWS_STORAGE_KEY)) || [];
    reviews.unshift({
        ...reviewData,
        id: Date.now(), // Unique ID for the review
        timestamp: new Date().toISOString()
    });
    localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(reviews));
}

function loadReviewsFromStorage() {
    const reviews = JSON.parse(localStorage.getItem(REVIEWS_STORAGE_KEY)) || [];
    const container = document.getElementById('testimonials-container');
    
    if (!container || reviews.length === 0) return;
    
    reviews.forEach(review => {
        // Check if review already exists in DOM
        const existingReview = container.querySelector(`[data-review-id="${review.id}"]`);
        if (!existingReview) {
            const newTestimonial = document.createElement('div');
            newTestimonial.className = 'col-md-4 testimonial-item';
            newTestimonial.setAttribute('data-review-id', review.id);
            newTestimonial.innerHTML = `
                <div class="testimonial-card">
                    <div class="stars mb-2">
                        ${Array(parseInt(review.rating)).fill('<i class="fas fa-star text-warning"></i>').join('')}
                        ${Array(5 - parseInt(review.rating)).fill('<i class="fas fa-star text-secondary"></i>').join('')}
                    </div>
                    <p class="rating-number">${review.rating}.0</p>
                    <p class="mb-3">"${review.review}"</p>
                    <h6 class="text-success">- ${review.name}</h6>
                    <small class="text-muted">${review.location}</small>
                </div>
            `;
            container.insertBefore(newTestimonial, container.firstChild);
        }
    });
}

// ================================
// PAGINATION FUNCTIONALITY
// ================================

const itemsPerPage = 3;
let currentPage = 1;
let allTestimonials = [];

function initPagination() {
    allTestimonials = Array.from(document.querySelectorAll('.testimonial-item'));
    if (allTestimonials.length === 0) return; // Exit if no testimonials exist
    
    const totalPages = Math.ceil(allTestimonials.length / itemsPerPage);
    updatePagination();
    updatePageButtons(totalPages);
}

function displayPage(pageNum) {
    const startIdx = (pageNum - 1) * itemsPerPage;
    const endIdx = startIdx + itemsPerPage;
    
    allTestimonials.forEach((item, idx) => {
        if (idx >= startIdx && idx < endIdx) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
    
    currentPage = pageNum;
    updatePagination();
}

function updatePagination() {
    const totalPages = Math.ceil(allTestimonials.length / itemsPerPage);
    
    // Update active page button
    document.querySelectorAll('.page-item').forEach(item => {
        if (item.id && item.id.startsWith('page-')) {
            item.classList.remove('active');
        }
    });
    
    const activePage = document.getElementById(`page-${currentPage}`);
    if (activePage) {
        activePage.classList.add('active');
    }
    
    // Update Previous button
    const prevBtn = document.getElementById('prev-btn');
    if (prevBtn) {
        if (currentPage === 1) {
            prevBtn.classList.add('disabled');
        } else {
            prevBtn.classList.remove('disabled');
        }
    }
    
    // Update Next button
    const nextBtn = document.getElementById('next-btn');
    if (nextBtn) {
        if (currentPage === totalPages) {
            nextBtn.classList.add('disabled');
        } else {
            nextBtn.classList.remove('disabled');
        }
    }
}

function updatePageButtons(totalPages) {
    const pagination = document.getElementById('pagination');
    if (!pagination) return; // Exit if pagination doesn't exist
    
    const prevBtn = pagination.querySelector('#prev-btn');
    const nextBtn = pagination.querySelector('#next-btn');
    
    // Remove old page buttons
    document.querySelectorAll('.page-item').forEach(item => {
        if (item.id && item.id.startsWith('page-')) {
            item.remove();
        }
    });
    
    // Add new page buttons
    for (let i = 1; i <= totalPages; i++) {
        const pageItem = document.createElement('li');
        pageItem.className = 'page-item';
        pageItem.id = `page-${i}`;
        if (i === 1) pageItem.classList.add('active');
        
        pageItem.innerHTML = `<a class="page-link" href="#" onclick="goToPage(${i}, event)">${i}</a>`;
        pagination.insertBefore(pageItem, nextBtn);
    }
}

function goToPage(pageNum, event) {
    event.preventDefault();
    displayPage(pageNum);
}

function nextPage(event) {
    event.preventDefault();
    const totalPages = Math.ceil(allTestimonials.length / itemsPerPage);
    if (currentPage < totalPages) {
        displayPage(currentPage + 1);
    }
}

function previousPage(event) {
    event.preventDefault();
    if (currentPage > 1) {
        displayPage(currentPage - 1);
    }
}

// Initialize pagination on load
document.addEventListener('DOMContentLoaded', initPagination);

// Update pagination when new review is added
const originalSubmitReview = window.submitReview;
window.submitReview = function() {
    originalSubmitReview();
    setTimeout(() => {
        initPagination();
        displayPage(1);
    }, 500);
};

// ================================
// RATING FUNCTIONALITY
// ================================

document.addEventListener('DOMContentLoaded', function() {
    // ================================
    // SYNCING EMAIL TO REPLYTO FIELD
    // ================================
    const bookingEmail = document.getElementById('bookingEmail');
    if (bookingEmail) {
        bookingEmail.addEventListener('input', syncEmailToReplyTo);
        bookingEmail.addEventListener('change', syncEmailToReplyTo);
    }

    const starIcons = document.querySelectorAll('.star-icon');
    const ratingValue = document.getElementById('ratingValue');
    const ratingText = document.getElementById('ratingText');
    
    const ratingTexts = {
        1: 'Poor',
        2: 'Fair',
        3: 'Good',
        4: 'Very Good',
        5: 'Excellent'
    };

    starIcons.forEach(star => {
        star.addEventListener('click', function() {
            const rating = this.getAttribute('data-rating');
            ratingValue.value = rating;
            ratingText.textContent = ratingTexts[rating];
            
            // Update star display
            starIcons.forEach(s => {
                if (s.getAttribute('data-rating') <= rating) {
                    s.classList.add('active');
                } else {
                    s.classList.remove('active');
                }
            });
        });

        star.addEventListener('mouseenter', function() {
            const rating = this.getAttribute('data-rating');
            starIcons.forEach(s => {
                if (s.getAttribute('data-rating') <= rating) {
                    s.style.color = '#ffc107';
                } else {
                    s.style.color = '#ddd';
                }
            });
        });
    });

    // Reset on mouse leave
    document.querySelector('.rating-input')?.addEventListener('mouseleave', function() {
        const currentRating = ratingValue.value;
        starIcons.forEach(s => {
            if (s.getAttribute('data-rating') <= currentRating) {
                s.classList.add('active');
                s.style.color = '#ffc107';
            } else {
                s.classList.remove('active');
                s.style.color = '#ddd';
            }
        });
    });

    // ================================
    // ENHANCED CHARACTER COUNTER & VALIDATION
    // ================================
    const smsBody = document.querySelector('textarea[name="body"]');
    const charCount = document.getElementById('charCount');
    const charProgressBar = document.getElementById('charProgressBar');
    
    if (smsBody && charCount) {
        smsBody.addEventListener('input', function() {
            const count = this.value.length;
            charCount.textContent = count;
            
            // Update progress bar
            if (charProgressBar) {
                const percentage = (count / 160) * 100;
                charProgressBar.style.width = percentage + '%';
                
                // Change color based on limit
                if (percentage >= 100) {
                    charProgressBar.style.background = 'linear-gradient(90deg, #dc3545, #c82333)';
                } else if (percentage >= 80) {
                    charProgressBar.style.background = 'linear-gradient(90deg, #ffc107, #e0a800)';
                } else {
                    charProgressBar.style.background = 'linear-gradient(90deg, var(--primary-green), #20c997)';
                }
            }
        });
    }

    // ================================
    // REAL-TIME FORM VALIDATION
    // ================================
    const formInputs = document.querySelectorAll('.contact-form .form-input');
    
    formInputs.forEach(input => {
        // Validate on blur
        input.addEventListener('blur', function() {
            validateField(this);
        });
        
        // Validate on input for character limits
        input.addEventListener('input', function() {
            if (this.type === 'email' || this.type === 'tel') {
                validateField(this);
            }
        });
    });

    // ================================
    // FORM SUBMISSION HANDLER
    // ================================
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Validate all fields before submission
            let allValid = true;
            const fields = ['contact-name', 'contact-phone', 'contact-email', 'contact-body'];
            
            fields.forEach(fieldId => {
                const field = document.getElementById(fieldId);
                if (!validateField(field)) {
                    allValid = false;
                }
            });
            
            if (!allValid) {
                showFormFeedback('Please correct the errors above', false);
                return;
            }
            
            // Show loading state
            const submitBtn = this.querySelector('.submit-btn');
            const btnText = submitBtn.querySelector('.btn-text');
            const btnLoader = submitBtn.querySelector('.btn-loader');
            
            submitBtn.disabled = true;
            btnText.style.display = 'none';
            btnLoader.style.display = 'inline';
            
            // Get form data
            const formData = new FormData(this);
            const data = Object.fromEntries(formData);
            
            console.log('Form Data:', data);
            
            // Submit will now proceed to Zapier webhook
            // The form will submit automatically after a short delay for UX
            setTimeout(() => {
                this.submit();
            }, 500);
        });
    }
});

// ================================
// FORM VALIDATION FUNCTIONS
// ================================

function validateField(field) {
    if (!field) return false;
    
    const formGroup = field.closest('.form-group');
    const feedback = formGroup.querySelector('.form-feedback');
    let isValid = true;
    let message = '';
    
    const fieldType = field.getAttribute('type');
    const fieldName = field.getAttribute('name');
    const value = field.value.trim();
    
    // Clear previous feedback
    if (feedback) {
        feedback.classList.remove('show', 'success');
    }
    
    // Name validation
    if (fieldName === 'name') {
        if (!value) {
            message = 'Name is required';
            isValid = false;
        } else if (value.length < 2) {
            message = 'Name must be at least 2 characters';
            isValid = false;
        } else if (!/^[a-zA-Z\s'-]+$/.test(value)) {
            message = 'Name can only contain letters, spaces, and hyphens';
            isValid = false;
        }
    }
    
    // Phone validation
    if (fieldName === 'phone') {
        if (!value) {
            message = 'Phone number is required';
            isValid = false;
        } else if (!/^(\+63|0)?[0-9\s-()]{7,}$/i.test(value)) {
            message = 'Please enter a valid phone number';
            isValid = false;
        }
    }
    
    // Email validation
    if (fieldName === 'email') {
        if (!value) {
            message = 'Email is required';
            isValid = false;
        } else if (!isValidEmail(value)) {
            message = 'Please enter a valid email address';
            isValid = false;
        }
    }
    
    // Message validation
    if (fieldName === 'body') {
        if (!value) {
            message = 'Message is required';
            isValid = false;
        } else if (value.length < 5) {
            message = 'Message must be at least 5 characters';
            isValid = false;
        }
    }
    
    // Update UI based on validation result
    if (isValid && value) {
        field.classList.add('is-valid');
        field.classList.remove('is-invalid');
        if (feedback) {
            feedback.innerHTML = '✓ Looks good!';
            feedback.classList.add('show', 'success');
        }
    } else if (!isValid && value) {
        field.classList.add('is-invalid');
        field.classList.remove('is-valid');
        if (feedback && message) {
            feedback.textContent = '✗ ' + message;
            feedback.classList.add('show');
        }
    } else {
        field.classList.remove('is-valid', 'is-invalid');
        if (feedback) {
            feedback.classList.remove('show');
        }
    }
    
    return isValid || !value; // Return true if valid or empty
}

function showFormFeedback(message, isSuccess = false) {
    const feedback = document.getElementById('form-general-feedback');
    if (feedback) {
        feedback.innerHTML = (isSuccess ? '✓ ' : '✗ ') + message;
        feedback.classList.add('show');
        if (isSuccess) {
            feedback.classList.add('success');
        } else {
            feedback.classList.remove('success');
        }
        
        setTimeout(() => {
            feedback.classList.remove('show');
        }, 5000);
    }
}

// ================================
// REVIEW FORM VALIDATION
// ================================

document.addEventListener('DOMContentLoaded', function() {
    const reviewForm = document.getElementById('reviewForm');
    if (reviewForm) {
        const reviewInputs = reviewForm.querySelectorAll('.form-input');
        
        reviewInputs.forEach(input => {
            input.addEventListener('blur', function() {
                validateField(this);
            });
            
            input.addEventListener('input', function() {
                validateField(this);
                
                // Update character counter for review text
                if (this.id === 'reviewText') {
                    const charCount = document.getElementById('reviewCharCount');
                    if (charCount) {
                        charCount.textContent = this.value.length;
                    }
                }
            });
        });
    }
    
    // Character counter for booking requests
    const bookingRequests = document.getElementById('bookingRequests');
    if (bookingRequests) {
        const charCount = document.getElementById('bookingCharCount');
        bookingRequests.addEventListener('input', function() {
            if (charCount) {
                charCount.textContent = this.value.length;
            }
        });
    }
});

function submitReview() {
    const name = document.getElementById('reviewName').value;
    const location = document.getElementById('reviewLocation').value;
    const review = document.getElementById('reviewText').value;
    const rating = document.getElementById('ratingValue').value;

    if (!name || !location || !review || !rating) {
        showAlert('Please fill in all fields', 'danger');
        return;
    }

    // Prepare review data
    const reviewData = {
        name,
        location,
        review,
        rating
    };

    // Save to localStorage
    saveReviewToStorage(reviewData);

    // Create new testimonial card with review ID
    const reviewId = Date.now();
    const newTestimonial = document.createElement('div');
    newTestimonial.className = 'col-md-4 testimonial-item';
    newTestimonial.setAttribute('data-review-id', reviewId);
    newTestimonial.innerHTML = `
        <div class="testimonial-card">
            <div class="stars mb-2">
                ${Array(parseInt(rating)).fill('<i class="fas fa-star text-warning"></i>').join('')}
                ${Array(5 - parseInt(rating)).fill('<i class="fas fa-star text-secondary"></i>').join('')}
            </div>
            <p class="rating-number">${rating}.0</p>
            <p class="mb-3">"${review}"</p>
            <h6 class="text-success">- ${name}</h6>
            <small class="text-muted">${location}</small>
        </div>
    `;

    // Add to testimonials container
    const container = document.getElementById('testimonials-container');
    container.insertBefore(newTestimonial, container.firstChild);

    // Show success message
    showAlert('Thank you! Your review has been added.', 'success');

    // Reset form
    document.getElementById('reviewForm').reset();
    document.getElementById('ratingValue').value = '5';
    document.getElementById('ratingText').textContent = 'Excellent';
    document.querySelectorAll('.star-icon').forEach(star => {
        if (star.getAttribute('data-rating') <= '5') {
            star.classList.add('active');
        } else {
            star.classList.remove('active');
        }
    });

    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('reviewModal'));
    modal.hide();

    // Reinitialize pagination to include new review
    setTimeout(() => {
        initPagination();
        displayPage(1);
    }, 500);

    // Log data (for backend integration)
    console.log('New Review Data:', {
        name,
        location,
        review,
        rating,
        timestamp: new Date()
    });
}

// ================================
// COUNTER ANIMATION
// ================================

function animateCounters() {
    const counters = document.querySelectorAll('.counter');
    const speed = 50; // Lower number = faster animation

    counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-target'));
        let count = 0;

        const increment = Math.ceil(target / speed);

        const updateCount = () => {
            if (count < target) {
                count += increment;
                if (count > target) count = target;
                counter.textContent = count.toLocaleString();
                setTimeout(updateCount, 50);
            } else {
                counter.textContent = target.toLocaleString();
            }
        };

        // Start animation when element is in viewport
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !counter.classList.contains('animated')) {
                    counter.classList.add('animated');
                    updateCount();
                    observer.unobserve(entry.target);
                }
            });
        });

        observer.observe(counter);
    });
}

document.addEventListener('DOMContentLoaded', animateCounters);

// ================================
// SMOOTH SCROLLING
// ================================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href !== '#' && document.querySelector(href)) {
            e.preventDefault();
            const target = document.querySelector(href);
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });

            // Close mobile menu if open
            const navbarCollapse = document.querySelector('.navbar-collapse');
            if (navbarCollapse.classList.contains('show')) {
                const navbarToggler = document.querySelector('.navbar-toggler');
                navbarToggler.click();
            }
        }
    });
});

// ================================
// NAVBAR ACTIVE LINK
// ================================

function updateActiveLink() {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');

    window.addEventListener('scroll', () => {
        let current = '';

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (scrollY >= sectionTop - 200) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').slice(1) === current) {
                link.classList.add('active');
            }
        });
    });
}

document.addEventListener('DOMContentLoaded', updateActiveLink);

// ================================
// NEWSLETTER FORM
// ================================

document.addEventListener('DOMContentLoaded', function() {
    const newsletterForm = document.getElementById('newsletterForm');
    
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const emailInput = this.querySelector('input[type="email"]');
            const email = emailInput.value.trim();
            const submitBtn = this.querySelector('button');
            
            // Validate email
            if (!isValidEmail(email)) {
                showNewsletterFeedback('Please enter a valid email', 'error');
                return;
            }
            
            // Show loading state
            const originalContent = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            submitBtn.disabled = true;
            
            // Simulate submission (replace with actual API call if needed)
            setTimeout(() => {
                // Store email in localStorage
                let subscribers = JSON.parse(localStorage.getItem('newsletter_subscribers')) || [];
                if (!subscribers.includes(email)) {
                    subscribers.push(email);
                    localStorage.setItem('newsletter_subscribers', JSON.stringify(subscribers));
                }
                
                showNewsletterFeedback('Thank you for subscribing!', 'success');
                emailInput.value = '';
                submitBtn.innerHTML = originalContent;
                submitBtn.disabled = false;
            }, 1000);
        });
    }
});

function showNewsletterFeedback(message, type) {
    // Create feedback element
    const feedback = document.createElement('div');
    feedback.className = `alert alert-${type === 'success' ? 'success' : 'danger'} alert-dismissible fade show`;
    feedback.setAttribute('role', 'alert');
    feedback.style.position = 'fixed';
    feedback.style.bottom = '20px';
    feedback.style.right = '20px';
    feedback.style.zIndex = '9999';
    feedback.style.maxWidth = '300px';
    feedback.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(feedback);
    
    // Auto remove after 4 seconds
    setTimeout(() => {
        feedback.remove();
    }, 4000);
}

// ================================
// GET STARTED FORM SUBMISSION
// ================================

function submitGetStarted(e) {
    // Prevent form submission if called from onclick
    if (e && e.preventDefault) {
        e.preventDefault();
    }
    
    const form = document.getElementById('getStartedForm');
    const inputs = form.querySelectorAll('input, select');
    let isValid = true;

    // Validate all fields
    inputs.forEach(input => {
        if (!input.value) {
            isValid = false;
            input.classList.add('is-invalid');
        } else {
            input.classList.remove('is-invalid');
        }
    });

    if (!isValid) {
        showAlert('Please fill in all fields', 'danger');
        return;
    }

    // Validate email
    const emailInput = form.querySelector('input[type="email"]');
    if (!isValidEmail(emailInput.value)) {
        showAlert('Please enter a valid email address', 'danger');
        return;
    }

    // Get form data
    const name = form.querySelector('input[name="name"]').value;
    const email = form.querySelector('input[name="email"]').value;
    const phone = form.querySelector('input[name="phone"]').value;
    const interested = form.querySelector('select[name="interested"]').value;

    const data = {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        interested: interested.trim()
    };

    // Show loading state
    const submitButton = form.querySelector('button[type="button"]') || form.querySelector('button');
    const originalText = submitButton ? submitButton.textContent : 'Get Started';
    if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = 'Submitting...';
    }

    // Send to Formspree
    const formspreeEndpoint = 'https://formspree.io/f/xjgebgql';

    console.log('Sending Get Started to Formspree:', formspreeEndpoint);
    console.log('Payload:', data);

    fetch(formspreeEndpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        console.log('Response status:', response.status);
        if (!response.ok) {
            return response.text().then(text => {
                console.error('Error response:', text);
                throw new Error(`HTTP error! status: ${response.status}`);
            });
        }
        return response.json();
    })
    .then(responseData => {
        console.log('Response data:', responseData);
        showAlert('Thank you! We have received your request. Check your email for confirmation.', 'success');
        form.reset();
        // Reset validation classes
        inputs.forEach(input => {
            input.classList.remove('is-invalid');
        });
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('contactModal'));
        if (modal) modal.hide();
    })
    .catch(error => {
        console.error('Get Started submission error:', error);
        showAlert('Error submitting request: ' + error.message, 'danger');
    })
    .finally(() => {
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = originalText;
        }
    });
}

// ================================
// CONTACT SMS FORM SUBMISSION
// ================================

function submitContactSms() {
    const form = document.getElementById('contactSmsForm');
    const name = form.querySelector('input[name="name"]').value.trim();
    const email = form.querySelector('input[name="email"]').value.trim();
    const phone = form.querySelector('input[name="phone"]').value.trim();
    const body = form.querySelector('textarea[name="body"]').value.trim();

    // Validate required fields
    if (!name || !email || !phone || !body) {
        showAlert('Please fill in all fields', 'danger');
        return;
    }

    // Validate email
    if (!isValidEmail(email)) {
        showAlert('Please enter a valid email address', 'danger');
        return;
    }

    // Validate message length
    if (body.length > 160) {
        showAlert('Message cannot exceed 160 characters', 'danger');
        return;
    }

    // Create JSON payload for form submission
    const payload = {
        name: name,
        email: email,
        phone: phone,
        body: body
    };

    // Show loading state
    const submitButton = form.querySelector('button[type="button"]');
    const originalText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.textContent = 'Sending...';

    // Send to server (use Netlify function or local PHP)
    const endpoint = window.location.hostname === 'localhost' 
      ? '/OikosOrchardandFarm/api/form_to_sms.php'
      : '/.netlify/functions/send-contact-sms';

    console.log('Sending SMS to:', endpoint);
    console.log('Payload:', payload);

    fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    })
    .then(response => {
        console.log('Response status:', response.status);
        if (!response.ok) {
            return response.text().then(text => {
                console.error('Error response body:', text);
                throw new Error(`HTTP error! status: ${response.status} - ${text}`);
            });
        }
        return response.text();
    })
    .then(text => {
        console.log('Response text:', text);
        // Try to parse as JSON
        try {
            const responseData = JSON.parse(text);
            console.log('Parsed response:', responseData);
            if (responseData.success) {
                showAlert(responseData.message || 'Message sent successfully!', 'success');
                form.reset();
                document.getElementById('charCount').textContent = '0';
                // Close modal
                const modal = bootstrap.Modal.getInstance(document.getElementById('contactModal'));
                if (modal) modal.hide();
            } else {
                showAlert('Error: ' + (responseData.message || 'Failed to send message'), 'danger');
            }
        } catch (e) {
            console.error('Failed to parse response:', text);
            showAlert('Error: Invalid server response', 'danger');
        }
    })
    .catch(error => {
        console.error('Contact SMS submission error:', error);
        showAlert('Error submitting form: ' + error.message, 'danger');
    })
    .finally(() => {
        submitButton.disabled = false;
        submitButton.textContent = originalText;
    });
}

// ================================
// UTILITY FUNCTIONS
// ================================

function showAlert(message, type = 'info') {
    // Create alert element
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.setAttribute('role', 'alert');
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;

    // Add to page
    const container = document.querySelector('body');
    container.insertBefore(alertDiv, container.firstChild);

    // Position it at top
    alertDiv.style.position = 'fixed';
    alertDiv.style.top = '80px';
    alertDiv.style.right = '20px';
    alertDiv.style.zIndex = '9999';
    alertDiv.style.maxWidth = '400px';

    // Auto dismiss after 5 seconds
    setTimeout(() => {
        const bsAlert = new bootstrap.Alert(alertDiv);
        bsAlert.close();
    }, 5000);
}

// ================================
// SCROLL ANIMATIONS
// ================================

function observeElements() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver(function (entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe service cards
    const serviceCards = document.querySelectorAll('.service-card, .product-card, .why-card, .contact-info, .testimonial-card');
    serviceCards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });
}

document.addEventListener('DOMContentLoaded', observeElements);

// ================================
// BUTTON RIPPLE EFFECT
// ================================

// ================================
// MOBILE MENU CLOSE ON LINK CLICK
// ================================

const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
const navbarCollapse = document.querySelector('.navbar-collapse');

navLinks.forEach(link => {
    link.addEventListener('click', () => {
        if (navbarCollapse.classList.contains('show')) {
            const navbarToggler = document.querySelector('.navbar-toggler');
            navbarToggler.click();
        }
    });
});

// ================================
// SCROLL TO TOP BUTTON
// ================================

function createScrollToTopButton() {
    const scrollButton = document.createElement('button');
    scrollButton.id = 'scrollToTopBtn';
    scrollButton.innerHTML = '<i class="fas fa-arrow-up"></i>';
    scrollButton.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 50px;
        height: 50px;
        background-color: #27ae60;
        color: white;
        border: none;
        border-radius: 50%;
        cursor: pointer;
        font-size: 20px;
        z-index: 999;
        display: none;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
        box-shadow: 0 5px 15px rgba(39, 174, 96, 0.3);
    `;

    document.body.appendChild(scrollButton);

    // Show button when scrolling down
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            scrollButton.style.display = 'flex';
        } else {
            scrollButton.style.display = 'none';
        }
    });

    // Scroll to top when button is clicked
    scrollButton.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // Hover effect
    scrollButton.addEventListener('mouseover', () => {
        scrollButton.style.backgroundColor = '#1e8449';
        scrollButton.style.transform = 'translateY(-5px)';
    });

    scrollButton.addEventListener('mouseout', () => {
        scrollButton.style.backgroundColor = '#27ae60';
        scrollButton.style.transform = 'translateY(0)';
    });
}

document.addEventListener('DOMContentLoaded', createScrollToTopButton);

// ================================
// LAZY LOADING IMAGES
// ================================

if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                observer.unobserve(img);
            }
        });
    });

    document.querySelectorAll('img.lazy').forEach(img => imageObserver.observe(img));
}

// ================================
// FORM INPUT VALIDATION
// ================================

function validateFormInput(input) {
    if (input.type === 'email') {
        input.style.borderColor = isValidEmail(input.value) ? '#27ae60' : '#dc3545';
    } else if (input.value.length > 0) {
        input.style.borderColor = '#27ae60';
    } else {
        input.style.borderColor = '#e0e0e0';
    }
}

const formInputs = document.querySelectorAll('.contact-form input, .contact-form textarea, #getStartedForm input, #getStartedForm select');

formInputs.forEach(input => {
    input.addEventListener('blur', () => validateFormInput(input));
    input.addEventListener('input', () => validateFormInput(input));
});

// ================================
// PARALLAX EFFECT (Optional)
// ================================

function parallaxEffect() {
    const parallaxElements = document.querySelectorAll('[data-parallax]');

    if (parallaxElements.length === 0) return;

    window.addEventListener('scroll', () => {
        parallaxElements.forEach(element => {
            const scrollPosition = window.pageYOffset;
            const elementOffset = element.offsetTop;
            const distance = scrollPosition - elementOffset;
            element.style.backgroundPosition = `center ${distance * 0.5}px`;
        });
    });
}

document.addEventListener('DOMContentLoaded', parallaxEffect);

// ================================
// PRODUCT LIST DATA
// ================================

const productListData = {
    'Fruits': [
        { item: 'Banana Kardava', pack: '25 kg / week' },
        { item: 'Banana Mondo*', pack: 'per kg' },
        { item: 'Banana Morado*', pack: 'per kg' },
        { item: 'Banana Sab-a*', pack: 'per kg' },
        { item: 'Banana Senyorita*', pack: 'per kg' },
        { item: 'Banana Tindok*', pack: 'per kg' },
        { item: 'Banana Tondan*', pack: 'per kg' },
        { item: 'Biasong*', pack: 'per kg' },
        { item: 'Bisaya Bayabas (aromatic)', pack: 'per kg' },
        { item: 'Doldol (Seasonal)', pack: '1 kg / week' },
        { item: 'Dragon Fruit* (Seasonal)', pack: 'per kg' },
        { item: 'Guapple', pack: '3 kg / week' },
        { item: 'Inyam (Seasonal)', pack: 'per kg' },
        { item: 'Katmon* (Seasonal)', pack: '2 kg / week' },
        { item: 'Kamias / Iba (Seasonal)', pack: '200 g / week' },
        { item: 'Karamay / Chinese Iba*', pack: '200 g / week' },
        { item: 'Lemon Meyer', pack: 'per kg' },
        { item: 'Lemon Lime', pack: 'per kg' },
        { item: 'Lemonsito', pack: 'per kg' },
        { item: 'Lomboy* (Seasonal)', pack: '5 kg / week' },
        { item: 'Mansanitas', pack: '100 g' },
        { item: 'Miracle Fruit', pack: 'per piece' },
        { item: 'Mulberries*', pack: '100 g' },
        { item: 'Papaya Red Lady', pack: 'per kg' },
        { item: 'Passion Fruit*', pack: 'per kg' },
        { item: 'Sambag / Tamarind*', pack: 'per kg' },
        { item: 'Tagpo', pack: '100 g' },
        { item: 'Tambis* (Seasonal)', pack: 'per kg' }
    ],
    'Vegetables': [
        { item: 'Alugbati / Spinach', pack: '200 g' },
        { item: 'Himbabao / Alukon*', pack: '100 g' },
        { item: 'Kamunggay / Moringa', pack: '200 g' },
        { item: 'Kamunggay / Moringa (de-stemmed)', pack: '200 g' }
    ],
    'Herbs': [
        { item: 'Basil Holy', pack: '50 g' },
        { item: 'Basil Thai', pack: '50 g' },
        { item: 'Chives', pack: '100 g' },
        { item: 'Cilantro Mexican', pack: '200 g' },
        { item: 'Cilantro', pack: '100 g' },
        { item: 'Indian Curry', pack: '50 g' },
        { item: 'Guava Fresh Leaves', pack: '200 g' },
        { item: 'Lavender', pack: '50 g' },
        { item: 'Mint Pepper', pack: '50 g' },
        { item: 'Mint Eucalyptus', pack: '50 g' },
        { item: 'Oregano / Kalabo', pack: '50 g' },
        { item: 'Oregano Italian', pack: '50 g' },
        { item: 'Pandan', pack: '100 g' },
        { item: 'Root Beer', pack: '50 g' },
        { item: 'Rosemary', pack: '100 g' },
        { item: 'Sibuyas Dahonan', pack: '100 g' },
        { item: 'Tarragon', pack: '25 g' },
        { item: 'Thyme', pack: '25 g' }
    ],
    'Spices': [
        { item: 'Achuete / Annatto (Dried)', pack: '100 g' },
        { item: 'Bantiyong / Ash Gourd', pack: 'per kg' },
        { item: 'Ginger / Luy-a Dulaw', pack: '100 g' },
        { item: 'Ginger / Luy-a Bisaya', pack: '100 g' },
        { item: 'Ginger / Luy-a', pack: '100 g' },
        { item: 'Lemongrass', pack: '100 g' },
        { item: 'Sili Espada', pack: '100 g' },
        { item: 'Sili Kulikot', pack: '100 g' },
        { item: 'Sili Puti', pack: '100 g' },
        { item: 'Sugarcane / Tubó Tapol (Fresh)', pack: 'per kg' },
        { item: 'Turmeric', pack: '100 g' },
        { item: 'Cinnamon Fresh Leaves (Mana Mindanao)', pack: '10 g' },
        { item: 'Cinnamon Air-Dried Leaves (Mana Mindanao)', pack: '10 g' },
        { item: 'Cinnamon Fresh Leaves (Kaningag Cebu)', pack: '5 g' },
        { item: 'Cinnamon Air-Dried Leaves (Kaningag Cebu)', pack: '5 g' }
    ],
    'Edible Flowers': [
        { item: 'Banana Pusô', pack: '10 pcs' },
        { item: 'Blue Ternate', pack: '25 g' },
        { item: 'Bougainvillea', pack: '25 g' },
        { item: 'Hibiscus', pack: '50 g' },
        { item: 'Marigold Orange', pack: '50 g' },
        { item: 'Rose Red Local', pack: '50 g' },
        { item: 'Roselle (Seasonal)', pack: '100 g' }
    ],
    'From the Wild': [
        { item: 'Taklong / Tree Snail Escargot', pack: '1 kg' },
        { item: 'Pepinito', pack: '100 g' },
        { item: 'Wild Passion Fruit / Sto Papa', pack: '100 g' }
    ],
    'Eggs & Meat': [
        { item: 'Native Eggs', pack: '1 tray / week' },
        { item: 'Native Pig Hybrid (Live)*', pack: 'per kg' }
    ],
    'Slow Fresh Drinks': [
        { item: 'Tubâ', pack: '0–12 hours' },
        { item: 'Tubâ with Tungog', pack: '0–12 hours' },
        { item: 'Tubâ', pack: '12–24 hours' },
        { item: 'Tubâ with Tungog', pack: '12–24 hours' },
        { item: 'Coconut Buko', pack: 'per piece' },
        { item: 'Coconut Buko (50+)', pack: 'per piece' }
    ]
};

// Show product list in modal
window.showProductList = function(category) {
    const modal = new bootstrap.Modal(document.getElementById('productsListModal'));
    const products = productListData[category] || [];
    
    // Update modal title
    document.getElementById('productModalTitle').textContent = category;
    
    // Populate table
    const tableBody = document.getElementById('productListBody');
    tableBody.innerHTML = '';
    
    products.forEach(product => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${product.item}</td>
            <td>${product.pack}</td>
        `;
        tableBody.appendChild(row);
    });
    
    modal.show();
};

// ================================
// INITIALIZATION
// ================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('Agro Farm Website - JavaScript loaded successfully');
    console.log('showProductList function available:', typeof window.showProductList);
    
    // Load saved reviews from localStorage
    loadReviewsFromStorage();
    
    // Initialize pagination after reviews are loaded
    setTimeout(() => {
        initPagination();
    }, 100);
    
    // Initialize booking form handlers
    initializeBookingForms();
});

// ================================
// BOOKING FORM SUBMISSION
// ================================

function initializeBookingForms() {
    // Handle "Book Now" buttons
    document.querySelectorAll('button').forEach(btn => {
        if (btn.textContent.includes('Book Now')) {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                showBookingForm(this);
            });
        }
    });
}

function showBookingForm(buttonElement) {
    // Get package name from the card
    const packageName = buttonElement.closest('.product-card, .glamping-package') 
        ? buttonElement.closest('.product-card, .glamping-package').querySelector('h5')?.textContent || 'Package'
        : 'Package';
    
    const packagePrice = buttonElement.closest('.product-card, .glamping-package')
        ? buttonElement.closest('.product-card, .glamping-package').querySelector('.price')?.textContent || '₱0.00'
        : '₱0.00';

    // Store the package info in session/local storage for the form
    localStorage.setItem('selectedPackage', JSON.stringify({
        name: packageName,
        price: packagePrice
    }));

    // Show booking modal
    const bookingModal = document.getElementById('contactModal');
    if (bookingModal) {
        const modal = new bootstrap.Modal(bookingModal);
        modal.show();
        populateBookingForm(packageName, packagePrice);
    }
}

function populateBookingForm(packageName, packagePrice) {
    // Update booking form with selected package
    const packageInput = document.getElementById('packageName');
    const packagePriceInput = document.getElementById('packagePrice');
    
    if (packageInput) packageInput.value = packageName;
    if (packagePriceInput) {
        // Extract only numeric value from price (remove ₱ and other characters)
        const priceNumeric = packagePrice.replace(/[^0-9.]/g, '');
        packagePriceInput.value = priceNumeric || 0;
    }
}

function updatePackageFromSelect() {
    // Get the selected value from the dropdown
    const packageSelect = document.getElementById('packageSelect');
    if (!packageSelect || !packageSelect.value) {
        document.getElementById('packageName').value = '';
        document.getElementById('packagePrice').value = '';
        return;
    }
    
    // Parse package name and price from the selected value
    const [packageName, packagePrice] = packageSelect.value.split('|');
    
    // Format price with comma separator
    const formattedPrice = '₱' + parseInt(packagePrice).toLocaleString('en-US');
    
    // Update the form fields
    document.getElementById('packageName').value = packageName;
    document.getElementById('packagePrice').value = formattedPrice;
}

// Function to set package directly (used by onclick handlers)
function setPackage(packageName, price) {
    document.getElementById('packageName').value = packageName;
    document.getElementById('packagePrice').value = '₱' + price.toLocaleString('en-US');
}

function submitBooking(event) {
    if (event) event.preventDefault();

    // Get form data
    const form = document.getElementById('bookingForm');
    if (!form) {
        console.error('Booking form not found');
        alert('Booking form not found on this page');
        return;
    }

    const fullName = document.getElementById('bookingFullName')?.value?.trim() || '';
    const email = document.getElementById('bookingEmail')?.value?.trim() || '';
    const phone = document.getElementById('bookingPhone')?.value?.trim() || '';
    const checkinDate = document.getElementById('bookingDate')?.value || '';
    const guests = document.getElementById('bookingGuests')?.value || '';
    const packageName = document.getElementById('packageName')?.value?.trim() || '';
    const packagePrice = document.getElementById('packagePrice')?.value?.trim() || '';
    const specialRequests = document.getElementById('bookingRequests')?.value?.trim() || '';

    // Validate required fields
    if (!fullName || !email || !phone || !checkinDate || !guests || !packageName) {
        console.warn('Validation failed:', { fullName, email, phone, checkinDate, guests, packageName });
        alert('Please fill in all required fields:\n- Full Name\n- Email\n- Phone\n- Check-in Date\n- Number of Guests\n- Package Name');
        return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('Please enter a valid email address');
        return;
    }

    // Prepare data
    const bookingData = {
        fullName: fullName,
        email: email,
        phone: phone,
        checkinDate: checkinDate,
        guests: guests,
        packageName: packageName,
        packagePrice: packagePrice,
        specialRequests: specialRequests
    };

    console.log('Submitting booking:', bookingData);

    // Show success message and reset form
    alert('Thank you for your booking request! We will contact you soon.');
    form.reset();
    
    // Reset package fields
    if (document.getElementById('packageName')) {
        document.getElementById('packageName').value = '';
    }
    if (document.getElementById('packagePrice')) {
        document.getElementById('packagePrice').value = '';
    }
    
    // Close modal
    const modalElement = document.getElementById('contactModal');
    if (modalElement && window.bootstrap) {
        const modal = bootstrap.Modal.getInstance(modalElement);
        if (modal) {
            modal.hide();
        }
    }
}

// ================================
// SUCCESS MODAL WITH ANIMATION
// ================================

function showSuccessModal(title, message) {
    // Create modal HTML if it doesn't exist
    let modalContainer = document.getElementById('success-modal-container');
    if (!modalContainer) {
        modalContainer = document.createElement('div');
        modalContainer.id = 'success-modal-container';
        document.body.appendChild(modalContainer);
        
        // Add CSS for animations
        const style = document.createElement('style');
        style.textContent = `
            #success-modal-container {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                display: none;
                align-items: center;
                justify-content: center;
                background-color: rgba(0, 0, 0, 0.5);
                z-index: 9999;
                animation: fadeIn 0.3s ease-in-out;
            }
            
            #success-modal-container.show {
                display: flex;
            }
            
            .success-modal-content {
                background: white;
                border-radius: 15px;
                padding: 40px;
                text-align: center;
                max-width: 400px;
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
                animation: slideUp 0.4s ease-out;
            }
            
            .success-checkmark {
                width: 80px;
                height: 80px;
                margin: 0 auto 20px;
            }
            
            .checkmark-circle {
                width: 100%;
                height: 100%;
                position: relative;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
                animation: scaleIn 0.5s ease-out 0.2s both;
            }
            
            .checkmark-circle svg {
                width: 50px;
                height: 50px;
                filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
            }
            
            .checkmark-path {
                stroke-dasharray: 48;
                stroke-dashoffset: 48;
                animation: checkmark 0.6s ease-out 0.7s forwards;
            }
            
            .success-title {
                font-size: 24px;
                font-weight: 600;
                color: #333;
                margin-bottom: 10px;
                animation: fadeInUp 0.5s ease-out 0.3s both;
            }
            
            .success-message {
                font-size: 14px;
                color: #666;
                margin-bottom: 0;
                animation: fadeInUp 0.5s ease-out 0.5s both;
            }
            
            @keyframes fadeIn {
                from {
                    opacity: 0;
                }
                to {
                    opacity: 1;
                }
            }
            
            @keyframes slideUp {
                from {
                    transform: translateY(30px);
                    opacity: 0;
                }
                to {
                    transform: translateY(0);
                    opacity: 1;
                }
            }
            
            @keyframes scaleIn {
                from {
                    transform: scale(0);
                }
                to {
                    transform: scale(1);
                }
            }
            
            @keyframes checkmark {
                to {
                    stroke-dashoffset: 0;
                }
            }
            
            @keyframes fadeInUp {
                from {
                    transform: translateY(10px);
                    opacity: 0;
                }
                to {
                    transform: translateY(0);
                    opacity: 1;
                }
            }
            
            @keyframes fadeOut {
                from {
                    opacity: 1;
                }
                to {
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Build the modal HTML
    modalContainer.innerHTML = `
        <div class="success-modal-content">
            <div class="success-checkmark">
                <div class="checkmark-circle">
                    <svg viewBox="0 0 52 52" xmlns="http://www.w3.org/2000/svg">
                        <polyline 
                            class="checkmark-path" 
                            points="13 24 19 30 39 14" 
                            fill="none" 
                            stroke="white" 
                            stroke-width="3" 
                            stroke-linecap="round" 
                            stroke-linejoin="round"
                        />
                    </svg>

/**
 * Initialize booking form with smooth animations
 */
document.addEventListener('DOMContentLoaded', function() {
    // Add staggered animation to form sections
    var sections = document.querySelectorAll('.form-section');
    sections.forEach(function(section, index) {
        section.style.animationDelay = (index * 0.1) + 's';
    });
    
    // Initialize price display with event listener
    var packageSelect = document.getElementById('packageName');
    if (packageSelect) {
        packageSelect.addEventListener('change', function() {
            updatePrice();
        });
        updatePrice();
    }
    
    // Add event listeners for date inputs to recalculate price
    var checkInInput = document.getElementById('bookingCheckIn');
    var checkOutInput = document.getElementById('bookingCheckOut');
    
    if (checkInInput) {
        checkInInput.addEventListener('change', function() {
            updatePrice();
        });
    }
    
    if (checkOutInput) {
        checkOutInput.addEventListener('change', function() {
            updatePrice();
        });
    }

    // Sync email to Formspree _replyto field
    var emailInput = document.getElementById('bookingEmail');
    if (emailInput) {
        emailInput.addEventListener('input', function() {
            syncEmailToReplyTo();
        });
        emailInput.addEventListener('change', function() {
            syncEmailToReplyTo();
        });
        // Initial sync on page load
        syncEmailToReplyTo();
    }
    
    // Phone number validation
    const phoneInput = document.getElementById('bookingPhone');
    if (phoneInput) {
        phoneInput.addEventListener('input', function() {
            // Allow only numbers, spaces, dashes, parentheses, and + sign
            this.value = this.value.replace(/[^0-9+\s\-()]/g, '');
        });
        phoneInput.addEventListener('blur', function() {
            if (this.value && !validatePhoneNumber(this.value)) {
                this.style.borderColor = '#ffc107';
                const feedback = this.closest('.form-group').querySelector('.form-feedback');
                if (feedback) {
                    feedback.textContent = '⚠️ Please enter a valid phone number (at least 10 digits)';
                    feedback.style.color = '#ffc107';
                }
            }
        });
    }
    
    // Smooth focus animations for inputs
    const inputs = document.querySelectorAll('.ecommerce-input, .ecommerce-select');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });
        
        input.addEventListener('blur', function() {
            if (!this.value) {
                this.parentElement.classList.remove('focused');
            }
        });
    });
    
    // ================================
    // BOOKING FORM VALIDATION
    // ================================
    const bookingInputs = document.querySelectorAll('#bookingForm .form-input');
    if (bookingInputs.length > 0) {
        bookingInputs.forEach(input => {
            input.addEventListener('blur', function() {
                validateField(this);
            });
            
            input.addEventListener('input', function() {
                if (this.type === 'email' || this.type === 'tel' || this.type === 'text') {
                    validateField(this);
                }
            });
        });
    }
    
    // Remove this section - using DOMContentLoaded version instead

    // ================================
    // BOOKING FORM SUBMISSION WITH SUCCESS ANIMATION
    // ================================

// Package prices mapping
const bookingOikosPrices = {
    'Regular': '5000',
    'Glamping': '7500',
    'Premium': '10000',
    'VIP': '15000'
};

// Update price when package is selected
document.addEventListener('DOMContentLoaded', function() {
    const packageNameEl = document.getElementById('packageName');
    if (packageNameEl) {
        packageNameEl.addEventListener('change', function() {
            const selectedPackage = this.value;
            const packagePriceEl = document.getElementById('packagePrice');
            if (packagePriceEl) {
                packagePriceEl.value = bookingOikosPrices[selectedPackage] || '';
            }
        });
    }

    // Handle form submission - SEND TO FORMSPREE
    const bookingForm = document.getElementById('bookingForm');
    if (bookingForm) {
        bookingForm.addEventListener('submit', function(e) {
            e.preventDefault();

            // Get form data
            const formData = new FormData(bookingForm);
            const fullName = formData.get('name');
            const email = formData.get('email');
            const phone = formData.get('phone');
            const guests = formData.get('guests');
            const checkinDate = formData.get('checkin');
            const checkoutDate = formData.get('checkout');
            const packageValue = formData.get('package');
            const messageDiv = document.getElementById('formMessage');

            // Validate required fields
            if (!fullName || !email || !phone || !checkinDate || !checkoutDate || !packageValue) {
                if (messageDiv) {
                    messageDiv.style.display = 'block';
                    messageDiv.style.backgroundColor = '#f8d7da';
                    messageDiv.style.color = '#721c24';
                    messageDiv.textContent = '⚠️ Please fill in all required fields.';
                }
                return false;
            }

            // Validate email format
            if (!isValidEmail(email)) {
                if (messageDiv) {
                    messageDiv.style.display = 'block';
                    messageDiv.style.backgroundColor = '#f8d7da';
                    messageDiv.style.color = '#721c24';
                    messageDiv.textContent = '⚠️ Please enter a valid email address.';
                }
                return false;
            }

            // Validate phone number
            if (!validatePhoneNumber(phone)) {
                if (messageDiv) {
                    messageDiv.style.display = 'block';
                    messageDiv.style.backgroundColor = '#f8d7da';
                    messageDiv.style.color = '#721c24';
                    messageDiv.textContent = '⚠️ Please enter a valid phone number (at least 10 digits).';
                }
                return false;
            }

            // Validate dates
            if (!isDateAvailable(checkinDate, checkoutDate)) {
                if (messageDiv) {
                    messageDiv.style.display = 'block';
                    messageDiv.style.backgroundColor = '#f8d7da';
                    messageDiv.style.color = '#721c24';
                    messageDiv.textContent = '❌ One or more of your selected dates are not available. Please choose different dates.';
                }
                showNotAvailableModal(checkinDate, checkoutDate);
                return false;
            }

            // Extract price from package value (format: "Package Name|Price")
            const packageParts = packageValue.split('|');
            const price = packageParts[1] || '0';
            
            // Format dates for display
            const checkinDateObj = new Date(checkinDate + 'T00:00:00');
            const checkoutDateObj = new Date(checkoutDate + 'T00:00:00');
            
            const formattedCheckIn = checkinDateObj.toLocaleDateString('en-US', { 
                weekday: 'short', 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
            });
            
            const formattedCheckOut = checkoutDateObj.toLocaleDateString('en-US', { 
                weekday: 'short', 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
            });

            // Populate confirmation modal with details
            document.getElementById('confirmCheckIn').textContent = formattedCheckIn;
            document.getElementById('confirmCheckOut').textContent = formattedCheckOut;
            document.getElementById('confirmFullName').textContent = fullName;
            document.getElementById('confirmGuests').textContent = guests || '---';
            document.getElementById('confirmAmount').textContent = '₱' + price.toLocaleString();

            // Store form data globally for submission after confirmation
            window.pendingBookingForm = bookingForm;
            window.pendingFormData = formData;

            // Show booking confirmation modal
            const confirmationModal = new bootstrap.Modal(document.getElementById('bookingConfirmationModal'));
            confirmationModal.show();
        });
    }

    // Function to confirm and submit booking after modal confirmation
    function confirmAndSubmitBooking() {
        if (!window.pendingBookingForm || !window.pendingFormData) {
            console.error('No pending booking data');
            return;
        }

        // Get the form and button
        const bookingForm = window.pendingBookingForm;
        const submitBtn = bookingForm.querySelector('button[type="submit"]');
        const messageDiv = document.getElementById('formMessage');
        
        // Hide confirmation modal
        const confirmationModal = bootstrap.Modal.getInstance(document.getElementById('bookingConfirmationModal'));
        if (confirmationModal) {
            confirmationModal.hide();
        }

        // Show loading state
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Processing...';
        }

        // Sync email to _replyto field
        const formData = window.pendingFormData;
        const email = formData.get('email');
        const replytoField = document.getElementById('replyto_field');
        if (replytoField) {
            replytoField.value = email;
        }

        console.log('📤 Sending booking to Formspree...');

        // SEND TO FORMSPREE
        const formspreeURL = 'https://formspree.io/f/mykdpbrk';

        fetch(formspreeURL, {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json'
            }
        })
        .then(response => {
            console.log('✅ Response received:', response.status);
            if (response.status === 200) {
                return response.json();
            } else {
                throw new Error('Form submission failed');
            }
        })
        .then(data => {
            console.log('✅ Success! Data sent to Formspree:', data);
            
            if (messageDiv) {
                messageDiv.style.display = 'block';
                messageDiv.style.backgroundColor = '#d4edda';
                messageDiv.style.color = '#155724';
                messageDiv.innerHTML = '✅ Booking submitted successfully!<br>We will contact you shortly to confirm your reservation.';
            }
            
            // Reset form
            bookingForm.reset();
            
            // Close modal after 3 seconds
            setTimeout(() => {
                if (messageDiv) {
                    messageDiv.style.display = 'none';
                }
                if (submitBtn) {
                    submitBtn.textContent = '✅ Confirm & Check Availability';
                    submitBtn.disabled = false;
                }
            }, 3000);
        })
        .catch(error => {
            console.error('❌ Error:', error);
            
            if (messageDiv) {
                messageDiv.style.display = 'block';
                messageDiv.style.backgroundColor = '#f8d7da';
                messageDiv.style.color = '#721c24';
                messageDiv.innerHTML = '❌ Error submitting booking. Please try again.';
            }
            
            // Reset button state
            if (submitBtn) {
                submitBtn.textContent = '🔒 Confirm & Check Availability';
                submitBtn.disabled = false;
            }

            // Hide error message after 4 seconds
            setTimeout(() => {
                if (messageDiv) {
                    messageDiv.style.display = 'none';
                }
            }, 4000);
        });
    }
});

// Make confirmAndSubmitBooking globally accessible
window.confirmAndSubmitBooking = function() {
    if (!window.pendingBookingForm || !window.pendingFormData) {
        console.error('No pending booking data');
        return;
    }

    // Get the form and button
    const bookingForm = window.pendingBookingForm;
    const submitBtn = bookingForm.querySelector('button[type="submit"]');
    const messageDiv = document.getElementById('formMessage');
    
    // Hide confirmation modal
    const confirmationModal = bootstrap.Modal.getInstance(document.getElementById('bookingConfirmationModal'));
    if (confirmationModal) {
        confirmationModal.hide();
    }

    // Show loading state
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Processing...';
    }

    // Sync email to _replyto field
    const formData = window.pendingFormData;
    const email = formData.get('email');
    const replytoField = document.getElementById('replyto_field');
    if (replytoField) {
        replytoField.value = email;
    }

    console.log('📤 Sending booking to Formspree...');

    // SEND TO FORMSPREE
    const formspreeURL = 'https://formspree.io/f/mykdpbrk';

    fetch(formspreeURL, {
        method: 'POST',
        body: formData,
        headers: {
            'Accept': 'application/json'
        }
    })
    .then(response => {
        console.log('✅ Response received:', response.status);
        if (response.status === 200) {
            return response.json();
        } else {
            throw new Error('Form submission failed');
        }
    })
    .then(data => {
        console.log('✅ Success! Data sent to Formspree:', data);
        
        if (messageDiv) {
            messageDiv.style.display = 'block';
            messageDiv.style.backgroundColor = '#d4edda';
            messageDiv.style.color = '#155724';
            messageDiv.innerHTML = '✅ Booking submitted successfully!<br>We will contact you shortly to confirm your reservation.';
        }
        
        // Reset form
        bookingForm.reset();
        
        // Close modal after 3 seconds
        setTimeout(() => {
            if (messageDiv) {
                messageDiv.style.display = 'none';
            }
            if (submitBtn) {
                submitBtn.textContent = '✅ Confirm & Check Availability';
                submitBtn.disabled = false;
            }
        }, 3000);
    })
    .catch(error => {
        console.error('❌ Error:', error);
        
        if (messageDiv) {
            messageDiv.style.display = 'block';
            messageDiv.style.backgroundColor = '#f8d7da';
            messageDiv.style.color = '#721c24';
            messageDiv.innerHTML = '❌ Error submitting booking. Please try again.';
        }
        
        // Reset button state
        if (submitBtn) {
            submitBtn.textContent = '🔒 Confirm & Check Availability';
            submitBtn.disabled = false;
        }

        // Hide error message after 4 seconds
        setTimeout(() => {
            if (messageDiv) {
                messageDiv.style.display = 'none';
            }
        }, 4000);
    });
};

    // ================================
    // GOOGLE CALENDAR AVAILABILITY CHECK
    // ================================
    
    // Local PHP endpoint for fetching unavailable dates
    const CALENDAR_CHECK_URL = './api/check-calendar.php';
    let unavailableDates = [];
    let lastFetchTime = 0;
    const CACHE_DURATION = 1800000; // 30 minutes in milliseconds
    
    // Fetch unavailable dates from local PHP
    async function fetchUnavailableDates() {
        const now = Date.now();
        
        // Return cached data if still fresh
        if (unavailableDates.length > 0 && (now - lastFetchTime) < CACHE_DURATION) {
            return unavailableDates;
        }
        
        try {
            // Try PHP endpoint first
            const phpResponse = await fetch(CALENDAR_CHECK_URL, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            const phpContentType = phpResponse.headers.get('content-type');
            
            // If PHP isn't executing (returns application/x-httpd-php), use JSON fallback
            if (phpContentType && phpContentType.includes('application/x-httpd-php')) {
                console.warn('⚠️ PHP not executing, using JSON fallback');
                return await fetchFromJSONFile();
            }
            
            if (!phpResponse.ok) {
                throw new Error(`HTTP Error: ${phpResponse.status}`);
            }
            
            if (!phpContentType || !phpContentType.includes('application/json')) {
                console.warn(`⚠️ Unexpected content type: ${phpContentType}, trying JSON fallback`);
                return await fetchFromJSONFile();
            }
            
            const data = await phpResponse.json();
            
            if (data.success && data.unavailableDates && Array.isArray(data.unavailableDates)) {
                unavailableDates = data.unavailableDates;
                lastFetchTime = now;
                console.log('✅ Unavailable dates fetched from PHP:', unavailableDates);
                updateDateInputs();
                return unavailableDates;
            }
        } catch (error) {
            console.warn('⚠️ PHP endpoint failed, trying JSON fallback:', error.message);
        }
        
        // Fallback to JSON file
        return await fetchFromJSONFile();
    }
    
    async function fetchFromJSONFile() {
        try {
            const response = await fetch('./api/calendar-data.json', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP Error: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.success && data.unavailableDates && Array.isArray(data.unavailableDates)) {
                unavailableDates = data.unavailableDates;
                lastFetchTime = Date.now();
                console.log('✅ Unavailable dates loaded from JSON:', unavailableDates);
                updateDateInputs();
                return unavailableDates;
            }
        } catch (error) {
            console.error('❌ Error fetching calendar from JSON:', error.message);
        }
        
        return [];
    }
    
    // Update date input attributes to disable unavailable dates
    function updateDateInputs() {
        const checkInInput = document.getElementById('bookingCheckIn');
        const checkOutInput = document.getElementById('bookingCheckOut');
        
        if (checkInInput) {
            checkInInput.addEventListener('change', validateDateSelection);
            checkInInput.addEventListener('focus', validateDateSelection);
        }
        
        if (checkOutInput) {
            checkOutInput.addEventListener('change', validateDateSelection);
            checkOutInput.addEventListener('focus', validateDateSelection);
        }
    }
    
    // Check if a date range is available
    function isDateAvailable(checkInStr, checkOutStr) {
        if (!checkInStr || !checkOutStr) return false;
        
        const checkInDate = new Date(checkInStr);
        const checkOutDate = new Date(checkOutStr);
        
        // Check if checkout is after checkin
        if (checkOutDate <= checkInDate) {
            return false;
        }
        
        // Check each day in the range (including checkout date)
        for (let d = new Date(checkInDate); d <= checkOutDate; d.setDate(d.getDate() + 1)) {
            const dateString = d.toISOString().split('T')[0];
            if (unavailableDates.includes(dateString)) {
                return false;
            }
        }
        
        return true;
    }
    
    // Validate date selection and show warnings
    function validateDateSelection(e) {
        const checkInInput = document.getElementById('bookingCheckIn');
        const checkOutInput = document.getElementById('bookingCheckOut');
        const formMessage = document.getElementById('formMessage');
        
        // Check if check-in date alone is unavailable
        if (checkInInput.value && unavailableDates.includes(checkInInput.value)) {
            checkInInput.style.borderColor = '#dc3545';
            
            // Show toast notification
            const checkInDate = new Date(checkInInput.value);
            const formattedDate = checkInDate.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });
            showUnavailableToast(`❌ ${formattedDate} is unavailable`);
            
            // Show "Not Available" modal immediately
            showNotAvailableModal(checkInInput.value, checkOutInput.value || checkInInput.value);
            
            if (formMessage) {
                formMessage.style.display = 'block';
                formMessage.style.backgroundColor = '#f8d7da';
                formMessage.style.color = '#721c24';
                formMessage.style.border = '1px solid #f5c6cb';
                formMessage.textContent = '❌ This check-in date is not available.';
            }
            return;
        }
        
        // Check if check-out date alone is unavailable
        if (checkOutInput.value && unavailableDates.includes(checkOutInput.value)) {
            checkOutInput.style.borderColor = '#dc3545';
            
            // Show toast notification
            const checkOutDate = new Date(checkOutInput.value);
            const formattedDate = checkOutDate.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });
            showUnavailableToast(`❌ ${formattedDate} is unavailable`);
            
            // Show "Not Available" modal immediately
            showNotAvailableModal(checkInInput.value || checkOutInput.value, checkOutInput.value);
            
            if (formMessage) {
                formMessage.style.display = 'block';
                formMessage.style.backgroundColor = '#f8d7da';
                formMessage.style.color = '#721c24';
                formMessage.style.border = '1px solid #f5c6cb';
                formMessage.textContent = '❌ This check-out date is not available.';
            }
            return;
        }
        
        if (!checkInInput.value || !checkOutInput.value) {
            return; // Don't validate if either date is empty
        }
        
        const checkInDate = new Date(checkInInput.value);
        const checkOutDate = new Date(checkOutInput.value);
        
        // Check if checkout is before or equal to checkin
        if (checkOutDate <= checkInDate) {
            if (formMessage) {
                formMessage.style.display = 'block';
                formMessage.style.backgroundColor = '#fff3cd';
                formMessage.style.color = '#856404';
                formMessage.style.border = '1px solid #ffeeba';
                formMessage.textContent = '⚠️ Check-out date must be after check-in date.';
            }
            checkInInput.style.borderColor = '#ffc107';
            checkOutInput.style.borderColor = '#ffc107';
            return;
        }
        
        // Check for unavailable dates in the range
        if (!isDateAvailable(checkInInput.value, checkOutInput.value)) {
            if (formMessage) {
                formMessage.style.display = 'block';
                formMessage.style.backgroundColor = '#f8d7da';
                formMessage.style.color = '#721c24';
                formMessage.style.border = '1px solid #f5c6cb';
                formMessage.textContent = '❌ Not Available - One or more selected dates are booked. Please choose different dates.';
            }
            checkInInput.style.borderColor = '#dc3545';
            checkOutInput.style.borderColor = '#dc3545';
            
            // Show "Not Available" modal
            showNotAvailableModal(checkInInput.value, checkOutInput.value);
        } else {
            if (formMessage) {
                formMessage.style.display = 'none';
            }
            checkInInput.style.borderColor = '';
            checkOutInput.style.borderColor = '';
        }
    }
    
    // Show Not Available Modal
    function showNotAvailableModal(checkInDate, checkOutDate) {
        const modal = document.getElementById('notAvailableModal');
        const infoText = document.getElementById('unavailableDateInfo');
        
        if (!modal) return;
        
        // Find which dates are unavailable
        const unavailableDatesInRange = [];
        const start = new Date(checkInDate);
        const end = new Date(checkOutDate);
        
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            const dateString = d.toISOString().split('T')[0];
            if (unavailableDates.includes(dateString)) {
                unavailableDatesInRange.push(dateString);
            }
        }
        
        // Update modal info
        if (infoText) {
            if (unavailableDatesInRange.length > 0) {
                const formattedDates = unavailableDatesInRange.map(d => {
                    return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric' 
                    });
                }).join(', ');
                infoText.textContent = `Booked: ${formattedDates}`;
            }
        }
        
        // Show modal using Bootstrap
        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();
    }
    
    // Show Toast Notification for Unavailable Dates
    function showUnavailableToast(message) {
        // Remove existing toast if present
        const existingToast = document.getElementById('unavailableToast');
        if (existingToast) {
            existingToast.remove();
        }
        
        // Create toast container
        const toastContainer = document.createElement('div');
        toastContainer.id = 'unavailableToast';
        toastContainer.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background-color: #f8d7da;
            color: #721c24;
            padding: 15px 20px;
            border-radius: 4px;
            border: 1px solid #f5c6cb;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
            z-index: 9999;
            font-size: 16px;
            font-weight: 500;
            max-width: 400px;
            animation: slideIn 0.3s ease-out;
        `;
        
        toastContainer.textContent = message;
        document.body.appendChild(toastContainer);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            toastContainer.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => {
                toastContainer.remove();
            }, 300);
        }, 5000);
    }
    
    // Contact Us function for modal button
    function contactUsAboutDates() {
        const modal = document.getElementById('notAvailableModal');
        if (modal) {
            const bsModal = bootstrap.Modal.getInstance(modal);
            if (bsModal) bsModal.hide();
        }
        
        // Scroll to contact or show contact info
        const contactSection = document.getElementById('contact');
        if (contactSection) {
            contactSection.scrollIntoView({ behavior: 'smooth' });
        }
    }
    
    // Initialize calendar availability check on page load
    fetchUnavailableDates();
    
    // Refresh available dates every 30 minutes
    setInterval(fetchUnavailableDates, CACHE_DURATION);
    
    // Update calendar status banner
    async function updateCalendarStatusBanner() {
        const banner = document.getElementById('calendarStatusBanner');
        const statusText = document.getElementById('calendarStatusText');
        
        if (!banner || !statusText) return;
        
        try {
            await fetchUnavailableDates();
            
            if (unavailableDates.length > 0) {
                banner.style.display = 'block';
                banner.style.borderLeftColor = '#ff9800';
                banner.style.backgroundColor = '#fff3e0';
                banner.style.color = '#e65100';
                statusText.innerHTML = `<i class="fas fa-info-circle me-2"></i>${unavailableDates.length} date(s) are currently booked.`;
            } else {
                banner.style.display = 'block';
                banner.style.borderLeftColor = '#27ae60';
                banner.style.backgroundColor = '#e8f5e9';
                banner.style.color = '#27ae60';
                statusText.innerHTML = `<i class="fas fa-calendar-check me-2"></i>All dates are available! ✨`;
            }
        } catch (error) {
            console.error('Error updating banner:', error);
        }
    }
    
    // Update banner when modal opens
    const bookingModal = document.getElementById('contactModal');
    if (bookingModal) {
        bookingModal.addEventListener('show.bs.modal', updateCalendarStatusBanner);
    }
});



