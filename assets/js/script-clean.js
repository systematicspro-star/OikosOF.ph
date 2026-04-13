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
    const displayPriceEl = document.getElementById('displayPrice');
    
    if (!packageSelect || !displayPriceEl) return;
    
    const selectedValue = packageSelect.value;
   const checkInDate = checkInInput ? checkInInput.value : '';
    const checkOutDate = checkOutInput ? checkOutInput.value : '';
    
    if (!selectedValue) {
        displayPriceEl.textContent = '---';
        return;
    }
    
    const parts = selectedValue.split('|');
    if (parts.length !== 2) {
        displayPriceEl.textContent = '---';
        return;
    }
    
    const pricePerNight = parseInt(parts[1]);
    
    if (checkInDate && checkOutDate) {
        const checkIn = new Date(checkInDate);
        const checkOut = new Date(checkOutDate);
        const diffTime = checkOut - checkIn;
        const numberOfNights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (numberOfNights > 0) {
            const totalAmount = numberOfNights * pricePerNight;
            const formattedPrice = '₱' + totalAmount.toLocaleString('en-US');
            const nightText = numberOfNights > 1 ? 'nights' : 'night';
            displayPriceEl.innerHTML = formattedPrice + ' <small style="font-size: 0.8em; opacity: 0.8;">(' + numberOfNights + ' ' + nightText + ')</small>';
            displayPriceEl.style.color = '#27ae60';
            displayPriceEl.style.fontWeight = 'bold';
        }
    } else {
        const formattedPrice = '₱' + pricePerNight.toLocaleString('en-US');
        displayPriceEl.innerHTML = formattedPrice + ' <small style="font-size: 0.8em; opacity: 0.8;">per night</small>';
        displayPriceEl.style.color = '#27ae60';
        displayPriceEl.style.fontWeight = 'bold';
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

    const formData = window.pendingFormData;

    fetch('https://formspree.io/f/mykdpbrk', {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' }
    })
    .then(response => {
        if (response.ok) return response.json();
        throw new Error('Submission failed');
    })
    .then(data => {
        console.log('✅ Booking submitted to Formspree');
        if (messageDiv) {
            messageDiv.style.display = 'block';
            messageDiv.style.backgroundColor = '#d4edda';
            messageDiv.style.color = '#155724';
            messageDiv.innerHTML = '✅ Booking submitted successfully!<br>We will contact you shortly to confirm your reservation.';
        }
        bookingForm.reset();
        if (submitBtn) {
            submitBtn.textContent = '✅ Confirm & Check Availability';
            submitBtn.disabled = false;
        }
        setTimeout(() => {
            if (messageDiv) messageDiv.style.display = 'none';
            if (confirmationModal) confirmationModal.hide();
        }, 3000);
    })
    .catch(error => {
        console.error('❌ Error:', error);
        if (messageDiv) {
            messageDiv.style.display = 'block';
            messageDiv.style.backgroundColor = '#f8d7da';
            messageDiv.style.color = '#721c24';
            messageDiv.innerHTML = '❌ Error submitting booking.<br>Error: ' + error.message;
        }
        if (submitBtn) {
            submitBtn.textContent = '🔒 Confirm & Check Availability';
            submitBtn.disabled = false;
        }
        setTimeout(() => {
            if (messageDiv) messageDiv.style.display = 'none';
        }, 5000);
    });
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    // Price update listeners
    const packageSelect = document.getElementById('packageName');
    const checkInInput = document.getElementById('bookingCheckIn');
    const checkOutInput = document.getElementById('bookingCheckOut');
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
            document.getElementById('confirmAmount').textContent = '₱' + price.toLocaleString();

            // Store form data globally
            window.pendingBookingForm = bookingForm;
            window.pendingFormData = formData;

            // Show confirmation modal
            const confirmationModal = new bootstrap.Modal(document.getElementById('bookingConfirmationModal'));
            confirmationModal.show();
        });
    }
});
