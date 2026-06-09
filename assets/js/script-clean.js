// ================================
// ESSENTIAL BOOKING FORM FUNCTIONALITY
// ================================

// Validate phone number
function validatePhoneNumber(phone) {
    const phoneRegex = /^(\+63|0)?[0-9\s\-()]+$/;
    return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
}

// Validate email address
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Update price display based on package and dates
function updatePrice() {
    const packageSelect = document.getElementById('packageName');
    const checkInInput = document.getElementById('bookingCheckIn');
    const checkOutInput = document.getElementById('bookingCheckOut');
    const guestsInput = document.getElementById('bookingGuests');
    const tentsInput = document.getElementById('bookingTents');
    const displayPriceEl = document.getElementById('displayPrice');
    
    if (!packageSelect || !displayPriceEl) return;
    
    const selectedValue = packageSelect.value;
    const checkInDate = checkInInput ? checkInInput.value : '';
    const checkOutDate = checkOutInput ? checkOutInput.value : '';
    const guests = parseInt(guestsInput?.value || 0);
    const tents = parseInt(tentsInput?.value || 0);
    
    if (!selectedValue) {
        displayPriceEl.textContent = '---';
        const amountInput = document.getElementById('amountToPay');
        if (amountInput) amountInput.value = '';
        return;
    }
    
    const parts = selectedValue.split('|');
    if (parts.length !== 2) {
        displayPriceEl.textContent = '---';
        const amountInput = document.getElementById('amountToPay');
        if (amountInput) amountInput.value = '';
        return;
    }
    
    const pricePerNight = parseInt(parts[1]);
    const guestAddOn = guests * 400;  // 400 per guest
    const tentAddOn = tents * 500;    // 500 per tent
    const addOnsTotal = guestAddOn + tentAddOn;
    
    if (checkInDate && checkOutDate) {
        const checkIn = new Date(checkInDate);
        const checkOut = new Date(checkOutDate);
        const diffTime = checkOut - checkIn;
        const numberOfNights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (numberOfNights > 0) {
            const packageTotal = numberOfNights * pricePerNight;
            const totalAmount = packageTotal + addOnsTotal;
            const formattedPrice = '₱' + totalAmount.toLocaleString('en-US');
            const nightText = numberOfNights > 1 ? 'nights' : 'night';
            const breakdownText = addOnsTotal > 0 ? ` + Add Ons: ₱${addOnsTotal.toLocaleString('en-US')}` : '';
            displayPriceEl.innerHTML = formattedPrice + ' <small style="font-size: 0.8em; opacity: 0.8;">(' + numberOfNights + ' ' + nightText + breakdownText + ')</small>';
            displayPriceEl.style.color = '#27ae60';
            displayPriceEl.style.fontWeight = 'bold';
            
            // Store the amount in hidden input for form submission
            const amountInput = document.getElementById('amountToPay');
            if (amountInput) amountInput.value = totalAmount;
        }
    } else {
        const totalAmount = pricePerNight + addOnsTotal;
        const formattedPrice = '₱' + totalAmount.toLocaleString('en-US');
        const breakdownText = addOnsTotal > 0 ? ` + Add Ons: ₱${addOnsTotal.toLocaleString('en-US')}` : '';
        displayPriceEl.innerHTML = formattedPrice + ' <small style="font-size: 0.8em; opacity: 0.8;">per night' + breakdownText + '</small>';
        displayPriceEl.style.color = '#27ae60';
        displayPriceEl.style.fontWeight = 'bold';
        
        // Store the amount in hidden input for form submission
        const amountInput = document.getElementById('amountToPay');
        if (amountInput) amountInput.value = totalAmount;
    }
}

// Formspree booking submission
window.confirmAndSubmitBooking = function() {
    if (!window.pendingBookingForm || !window.pendingFormData) {
        console.error('No pending booking data');
        return;
    }

    const bookingForm = window.pendingBookingForm;
    const submitBtn = bookingForm.querySelector('button[type="submit"]');
    const messageDiv = document.getElementById('formMessage');
    
    // Hide confirmation modal
    const confirmationModal = bootstrap.Modal.getInstance(document.getElementById('bookingConfirmationModal'));
    if (confirmationModal) {
        confirmationModal.hide();
    }

    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Processing...';
    }

    // Submit form directly to Formspree (avoids CORS issues)
    // Use native form submission instead of Fetch
    console.log('✅ Submitting booking form to Formspree...');
    
    if (messageDiv) {
        messageDiv.style.display = 'block';
        messageDiv.style.backgroundColor = '#d4edda';
        messageDiv.style.color = '#155724';
        messageDiv.innerHTML = '✅ Submitting your booking...<br>Please wait while we process your request.';
    }

    // Submit the form (Formspree will handle the POST)
    setTimeout(() => {
        bookingForm.submit();
    }, 300);
};

// Edit booking details function
window.editBookingDetails = function() {
    console.log('🔧 Reopening booking form for editing...');
    
    // Hide confirmation modal
    const confirmationModal = bootstrap.Modal.getInstance(document.getElementById('bookingConfirmationModal'));
    if (confirmationModal) {
        confirmationModal.hide();
    }

    // Show booking form modal again
    const contactModal = new bootstrap.Modal(document.getElementById('contactModal'));
    setTimeout(() => {
        contactModal.show();
    }, 300);
};

// ================================
// PRODUCT LIST DATA AND MODAL
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

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    // Price update listeners
    const packageSelect = document.getElementById('packageName');
    const checkInInput = document.getElementById('bookingCheckIn');
    const checkOutInput = document.getElementById('bookingCheckOut');
    const guestsInput = document.getElementById('bookingGuests');
    const tentsInput = document.getElementById('bookingTents');
    const contactModal = document.getElementById('contactModal');

    if (packageSelect) {
        packageSelect.addEventListener('change', updatePrice);
        packageSelect.addEventListener('input', updatePrice);
    }
    if (checkInInput) {
        checkInInput.addEventListener('change', updatePrice);
        checkInInput.addEventListener('input', updatePrice);
    }
    if (checkOutInput) {
        checkOutInput.addEventListener('change', updatePrice);
        checkOutInput.addEventListener('input', updatePrice);
    }
    if (guestsInput) {
        guestsInput.addEventListener('change', updatePrice);
        guestsInput.addEventListener('input', updatePrice);
    }
    if (tentsInput) {
        tentsInput.addEventListener('change', updatePrice);
        tentsInput.addEventListener('input', updatePrice);
    }
    if (contactModal) {
        contactModal.addEventListener('show.bs.modal', function() {
            setTimeout(updatePrice, 100);
        });
    }

    updatePrice();

    // Booking form submission
    const bookingForm = document.getElementById('bookingForm');
    if (bookingForm) {
        bookingForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const formData = new FormData(bookingForm);
            const fullName = formData.get('name');
            const email = formData.get('email');
            const phone = formData.get('phone');
            const checkInDate = formData.get('checkin');
            const checkOutDate = formData.get('checkout');
            const packageValue = formData.get('packageName');
            const messageDiv = document.getElementById('formMessage');

            // Validate required fields 
            if (!fullName || !email || !phone || !checkInDate || !checkOutDate || !packageValue) {
                if (messageDiv) {
                    messageDiv.style.display = 'block';
                    messageDiv.style.backgroundColor = '#f8d7da';
                    messageDiv.style.color = '#721c24';
                    messageDiv.textContent = '⚠️ Please fill in all required fields.';
                }
                return false;
            }

            if (!isValidEmail(email)) {
                if (messageDiv) {
                    messageDiv.style.display = 'block';
                    messageDiv.style.backgroundColor = '#f8d7da';
                    messageDiv.style.color = '#721c24';
                    messageDiv.textContent = '⚠️ Please enter a valid email address.';
                }
                return false;
            }

            if (!validatePhoneNumber(phone)) {
                if (messageDiv) {
                    messageDiv.style.display = 'block';
                    messageDiv.style.backgroundColor = '#f8d7da';
                    messageDiv.style.color = '#721c24';
                    messageDiv.textContent = '⚠️ Please enter a valid phone number.';
                }
                return false;
            }

            // Extract price and format dates
            const packageParts = packageValue.split('|');
            const price = packageParts[1] || '0';
            
            const checkInObj = new Date(checkInDate + 'T00:00:00');
            const checkOutObj = new Date(checkOutDate + 'T00:00:00');
            
            const formattedCheckIn = checkInObj.toLocaleDateString('en-US', { 
                weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' 
            });
            const formattedCheckOut = checkOutObj.toLocaleDateString('en-US', { 
                weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' 
            });

            // Populate confirmation modal
            document.getElementById('confirmCheckIn').textContent = formattedCheckIn;
            document.getElementById('confirmCheckOut').textContent = formattedCheckOut;
            document.getElementById('confirmFullName').textContent = fullName;
            document.getElementById('confirmGuests').textContent = formData.get('guests') || '---';
            document.getElementById('confirmTents').textContent = formData.get('tents') || '0';
            
            // Get the calculated amount from hidden input (includes add-ons)
            const amountInput = document.getElementById('amountToPay');
            const totalAmount = amountInput?.value || '0';
            document.getElementById('confirmAmount').textContent = '₱' + parseInt(totalAmount).toLocaleString();

            // Store form data globally
            window.pendingBookingForm = bookingForm;
            window.pendingFormData = formData;

            // Close the booking form modal
            const contactModal = bootstrap.Modal.getInstance(document.getElementById('contactModal'));
            if (contactModal) {
                contactModal.hide();
            }

            // Show confirmation modal
            const confirmationModal = new bootstrap.Modal(document.getElementById('bookingConfirmationModal'));
            confirmationModal.show();
        });
    }

    // Newsletter form submission handler
    const newsletterForm = document.getElementById('newsletterForm');
    console.log('📧 Newsletter form found:', !!newsletterForm);
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('📧 Newsletter form submitted');

            const formspreeUrl = this.getAttribute('data-formspree') || this.getAttribute('action');
            const email = this.querySelector('input[type="email"]').value.trim();
            console.log('📧 Email:', email, 'URL:', formspreeUrl);
            
            if (!isValidEmail(email)) {
                alert('Please enter a valid email address.');
                return;
            }

            // Get form data
            const formData = new FormData(this);
            
            // Show modal
            const modalEl = document.getElementById('newsletterSuccessModal');
            console.log('📧 Modal element found:', !!modalEl);
            if (modalEl) {
                const modal = new bootstrap.Modal(modalEl);
                modal.show();
                console.log('📧 Modal shown');
            } else {
                console.error('📧 Modal not found!');
                alert('Thank you for subscribing!');
            }

            // Submit to Formspree via fetch (prevents redirect)
            if (formspreeUrl) {
                fetch(formspreeUrl, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                })
                .then(response => {
                    console.log('✅ Newsletter submitted successfully');
                    this.reset();
                })
                .catch(error => {
                    console.error('❌ Error submitting newsletter:', error);
                });
            }

            // Auto-close modal after 2.5 seconds
            setTimeout(() => {
                const instance = bootstrap.Modal.getInstance(document.getElementById('newsletterSuccessModal'));
                if (instance) instance.hide();
            }, 2500);
        });
    }

    // Handle newsletter forms in Events page (footer newsletter form)
    const footerNewsletterForm = document.getElementById('footerNewsletterForm');
    console.log('📧 Footer newsletter form found:', !!footerNewsletterForm);
    if (footerNewsletterForm) {
        footerNewsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('📧 Footer newsletter form submitted');

            const formspreeUrl = this.getAttribute('action');
            const email = this.querySelector('input[type="email"]').value.trim();
            console.log('📧 Email:', email, 'URL:', formspreeUrl);
            
            if (!isValidEmail(email)) {
                alert('Please enter a valid email address.');
                return;
            }

            // Get form data
            const formData = new FormData(this);
            
            // Show modal
            const modalEl = document.getElementById('newsletterSuccessModal');
            console.log('📧 Modal element found:', !!modalEl);
            if (modalEl) {
                const modal = new bootstrap.Modal(modalEl);
                modal.show();
                console.log('📧 Modal shown');
            } else {
                console.error('📧 Modal not found!');
                alert('Thank you for subscribing!');
            }

            // Submit to Formspree via fetch (prevents redirect)
            if (formspreeUrl) {
                fetch(formspreeUrl, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                })
                .then(response => {
                    console.log('✅ Newsletter submitted successfully');
                    this.reset();
                })
                .catch(error => {
                    console.error('❌ Error submitting newsletter:', error);
                });
            }

            // Auto-close modal after 2.5 seconds
            setTimeout(() => {
                const instance = bootstrap.Modal.getInstance(document.getElementById('newsletterSuccessModal'));
                if (instance) instance.hide();
            }, 2500);
        });
    }

    // Handle main newsletter form in Events page (newsLetterForm - note capitalL)
    const mainNewsletterForm = document.getElementById('newsLetterForm');
    console.log('📧 Main newsletter form found:', !!mainNewsletterForm);
    if (mainNewsletterForm) {
        mainNewsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('📧 Main newsletter form submitted');

            const formspreeUrl = this.getAttribute('action');
            const email = this.querySelector('input[type="email"]').value.trim();
            console.log('📧 Email:', email, 'URL:', formspreeUrl);
            
            if (!isValidEmail(email)) {
                alert('Please enter a valid email address.');
                return;
            }

            // Get form data
            const formData = new FormData(this);
            
            // Show modal
            const modalEl = document.getElementById('newsletterSuccessModal');
            console.log('📧 Modal element found:', !!modalEl);
            if (modalEl) {
                const modal = new bootstrap.Modal(modalEl);
                modal.show();
                console.log('📧 Modal shown');
            } else {
                console.error('📧 Modal not found!');
                alert('Thank you for subscribing!');
            }

            // Submit to Formspree via fetch (prevents redirect)
            if (formspreeUrl) {
                fetch(formspreeUrl, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                })
                .then(response => {
                    console.log('✅ Newsletter submitted successfully');
                    this.reset();
                })
                .catch(error => {
                    console.error('❌ Error submitting newsletter:', error);
                });
            }

            // Auto-close modal after 2.5 seconds
            setTimeout(() => {
                const instance = bootstrap.Modal.getInstance(document.getElementById('newsletterSuccessModal'));
                if (instance) instance.hide();
            }, 2500);
        });
    }
});
