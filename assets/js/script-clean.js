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
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const formspreeUrl = this.getAttribute('data-formspree') || this.getAttribute('action');
            const email = this.querySelector('input[type="email"]').value.trim();
            
            if (!isValidEmail(email)) {
                alert('Please enter a valid email address.');
                return;
            }

            // Get form data
            const formData = new FormData(this);
            
            // Show modal
            const modal = new bootstrap.Modal(document.getElementById('newsletterSuccessModal'));
            modal.show();

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
                    console.log('Newsletter submitted successfully');
                    this.reset();
                })
                .catch(error => {
                    console.error('Error submitting newsletter:', error);
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
    if (footerNewsletterForm) {
        footerNewsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const formspreeUrl = this.getAttribute('action');
            const email = this.querySelector('input[type="email"]').value.trim();
            
            if (!isValidEmail(email)) {
                alert('Please enter a valid email address.');
                return;
            }

            // Get form data
            const formData = new FormData(this);
            
            // Show modal
            const modal = new bootstrap.Modal(document.getElementById('newsletterSuccessModal'));
            modal.show();

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
                    console.log('Newsletter submitted successfully');
                    this.reset();
                })
                .catch(error => {
                    console.error('Error submitting newsletter:', error);
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
