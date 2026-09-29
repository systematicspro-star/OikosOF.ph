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

document.addEventListener('change', function(event) {
    const target = event.target;
    if (!target || target.id !== 'paymentScreenshot') {
        return;
    }

    const preview = document.getElementById('paymentScreenshotPreview');
    const wrapper = document.getElementById('paymentScreenshotPreviewWrap');
    const file = target.files && target.files[0];

    if (!preview || !wrapper || !file) {
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        preview.src = e.target.result;
        wrapper.classList.remove('d-none');
    };
    reader.readAsDataURL(file);
});

function initGalleryInteractions() {
    const shareButtons = document.querySelectorAll('[data-action="share"]');
    const saveButtons = document.querySelectorAll('[data-action="save"]');
    const showPhotosButtons = document.querySelectorAll('.show-photos-btn');
    const galleryModal = document.getElementById('photoGalleryModal');
    const galleryGrid = document.getElementById('galleryModalGrid');

    const galleryImages = [
        'assets/images/image.png',
        'assets/images/Glamping.jpg',
        'assets/images/oikos (1).jpg',
        'assets/images/Car Glamping.jpg',
        'assets/images/Seedlings.jpg',
        'assets/images/Tour Guide.jpg',
        'assets/images/656721120_939751078808334_6703760845923348850_n.jpg'
    ];

    if (galleryGrid) {
        galleryGrid.innerHTML = galleryImages.map(src => `
            <img src="${src}" alt="Oikos Orchard and Farm photo" loading="lazy">
        `).join('');
    }

    shareButtons.forEach(button => {
        button.addEventListener('click', async function() {
            const shareText = button.innerHTML;
            const url = window.location.href;

            try {
                if (navigator.clipboard && window.isSecureContext) {
                    await navigator.clipboard.writeText(url);
                } else {
                    const tempInput = document.createElement('input');
                    tempInput.value = url;
                    document.body.appendChild(tempInput);
                    tempInput.select();
                    document.execCommand('copy');
                    tempInput.remove();
                }
                button.innerHTML = '<i class="fas fa-check"></i> Link copied';
                setTimeout(() => {
                    button.innerHTML = shareText;
                }, 1200);
            } catch (error) {
                window.prompt('Copy this link:', url);
            }
        });
    });

    saveButtons.forEach(button => {
        button.addEventListener('click', function() {
            const isSaved = button.classList.toggle('saved');
            button.innerHTML = isSaved
                ? '<i class="fas fa-heart"></i> Saved'
                : '<i class="fas fa-heart"></i> Save';
            button.setAttribute('aria-pressed', String(isSaved));
        });
    });

    showPhotosButtons.forEach(button => {
        button.addEventListener('click', function() {
            if (galleryModal) {
                const modal = new bootstrap.Modal(galleryModal);
                modal.show();
            }
        });
    });
}

document.addEventListener('DOMContentLoaded', function() {
    initGalleryInteractions();
});

// Update price display based on package and dates
function updatePrice() {
    const packageSelect = document.getElementById('packageName');
    const checkInInput = document.getElementById('bookingCheckIn');
    const checkOutInput = document.getElementById('bookingCheckOut');
    const guestsInput = document.getElementById('bookingGuests');
    const tentsInput = document.getElementById('bookingTents');
    const displayPriceEl = document.getElementById('displayPrice');
    const cardPriceEl = document.querySelector('.card-price');
    const cardNightEl = document.querySelector('.card-night');
    
    if (!packageSelect || !displayPriceEl) return;
    
    const selectedValue = packageSelect.value;
    const checkInDate = checkInInput ? checkInInput.value : '';
    const checkOutDate = checkOutInput ? checkOutInput.value : '';
    const extraGuests = parseInt(guestsInput?.value || 0, 10);
    const tents = parseInt(tentsInput?.value || 0, 10);
    const extraGuestCount = Number.isFinite(extraGuests) && extraGuests > 0 ? extraGuests : 0;
    
    if (!selectedValue) {
        displayPriceEl.textContent = '---';
        if (cardPriceEl) cardPriceEl.textContent = '₱3,800';
        if (cardNightEl) cardNightEl.textContent = '/ night';
        const amountInput = document.getElementById('amountToPay');
        if (amountInput) amountInput.value = '';
        return;
    }
    
    const parts = selectedValue.split('|');
    if (parts.length < 2) {
        displayPriceEl.textContent = '---';
        if (cardPriceEl) cardPriceEl.textContent = '₱3,800';
        if (cardNightEl) cardNightEl.textContent = '/ night';
        const amountInput = document.getElementById('amountToPay');
        if (amountInput) amountInput.value = '';
        return;
    }

    const priceValue = parseInt(parts[1], 10) || 0;
    const pricingUnit = (parts[2] || 'night').toLowerCase();
    const formattedPrice = '₱' + priceValue.toLocaleString('en-US');

    const guestAddOnRate = (() => {
        const selectedText = packageSelect.value || '';
        if (selectedText.includes('Couple Small Package') || selectedText.includes('Barkada Package') || selectedText.includes('Family Package') || selectedText.includes('Exclusive Camp')) return 1000;
        if (selectedText.includes('Car Camping') || selectedText.includes('DIY Camping') || selectedText.includes('Group Camping Package')) return 300;
        return 0;
    })();

    const guestAddOnTotal = extraGuestCount * guestAddOnRate;
    const addOnsTotal = guestAddOnTotal;

    if (cardPriceEl) {
        cardPriceEl.textContent = formattedPrice;
    }

    if (cardNightEl) {
        if (pricingUnit === 'person-day') cardNightEl.textContent = '/ person';
        else if (pricingUnit === 'person-night') cardNightEl.textContent = '/ person / night';
        else if (pricingUnit === 'package') cardNightEl.textContent = '/ package';
        else cardNightEl.textContent = '/ night';
    }

    if (pricingUnit === 'person-day') {
        const baseTotal = priceValue * Math.max(1, extraGuestCount || 1);
        const totalAmount = baseTotal + guestAddOnTotal;
        const formattedTotal = '₱' + totalAmount.toLocaleString('en-US');
        const label = extraGuestCount > 0 ? `(${extraGuestCount} guest add-on)` : '(1 guest)';
        displayPriceEl.innerHTML = formattedTotal + ' <small style="font-size: 0.8em; opacity: 0.8;">' + label + '</small>';
        displayPriceEl.style.color = '#27ae60';
        displayPriceEl.style.fontWeight = 'bold';
        const amountInput = document.getElementById('amountToPay');
        if (amountInput) amountInput.value = totalAmount;
        return;
    }

    if (pricingUnit === 'person-night') {
        let numberOfNights = 1;
        if (checkInDate && checkOutDate) {
            const checkIn = new Date(checkInDate);
            const checkOut = new Date(checkOutDate);
            const diffTime = checkOut - checkIn;
            numberOfNights = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
        }

        const baseTotal = priceValue * Math.max(1, extraGuestCount || 1) * numberOfNights;
        const totalAmount = baseTotal + guestAddOnTotal;
        const formattedTotal = '₱' + totalAmount.toLocaleString('en-US');
        const nightText = numberOfNights > 1 ? 'nights' : 'night';
        const addOnText = extraGuestCount > 0 ? ' + ' + extraGuestCount + ' guest add-on' : '';
        displayPriceEl.innerHTML = formattedTotal + ' <small style="font-size: 0.8em; opacity: 0.8;">(' + Math.max(1, extraGuestCount || 1) + ' guest' + (extraGuestCount > 1 || extraGuestCount === 0 ? 's' : '') + ' × ' + numberOfNights + ' ' + nightText + addOnText + ')</small>';
        displayPriceEl.style.color = '#27ae60';
        displayPriceEl.style.fontWeight = 'bold';
        const amountInput = document.getElementById('amountToPay');
        if (amountInput) amountInput.value = totalAmount;
        return;
    }

    if (pricingUnit === 'package') {
        const totalAmount = priceValue + guestAddOnTotal;
        const formattedTotal = '₱' + totalAmount.toLocaleString('en-US');
        const addOnText = extraGuestCount > 0 ? ' + ' + extraGuestCount + ' guest add-on' : '';
        displayPriceEl.innerHTML = formattedTotal + ' <small style="font-size: 0.8em; opacity: 0.8;">/package' + addOnText + '</small>';
        displayPriceEl.style.color = '#27ae60';
        displayPriceEl.style.fontWeight = 'bold';
        const amountInput = document.getElementById('amountToPay');
        if (amountInput) amountInput.value = totalAmount;
        return;
    }
    
    if (checkInDate && checkOutDate) {
        const checkIn = new Date(checkInDate);
        const checkOut = new Date(checkOutDate);
        const diffTime = checkOut - checkIn;
        const numberOfNights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (numberOfNights > 0) {
            const packageTotal = numberOfNights * priceValue;
            const totalAmount = packageTotal + addOnsTotal;
            const formattedTotal = '₱' + totalAmount.toLocaleString('en-US');
            const nightText = numberOfNights > 1 ? 'nights' : 'night';
            const breakdownText = addOnsTotal > 0 ? ` + Add Ons: ₱${addOnsTotal.toLocaleString('en-US')}` : '';
            displayPriceEl.innerHTML = formattedTotal + ' <small style="font-size: 0.8em; opacity: 0.8;">(' + numberOfNights + ' ' + nightText + breakdownText + ')</small>';
            displayPriceEl.style.color = '#27ae60';
            displayPriceEl.style.fontWeight = 'bold';
            const amountInput = document.getElementById('amountToPay');
            if (amountInput) amountInput.value = totalAmount;
        }
    } else {
        const totalAmount = priceValue + addOnsTotal;
        const formattedTotal = '₱' + totalAmount.toLocaleString('en-US');
        const breakdownText = addOnsTotal > 0 ? ` + Add Ons: ₱${addOnsTotal.toLocaleString('en-US')}` : '';
        displayPriceEl.innerHTML = formattedTotal + ' <small style="font-size: 0.8em; opacity: 0.8;">per night' + breakdownText + '</small>';
        displayPriceEl.style.color = '#27ae60';
        displayPriceEl.style.fontWeight = 'bold';
        const amountInput = document.getElementById('amountToPay');
        if (amountInput) amountInput.value = totalAmount;
    }
}

// Payment modal flow
window.showBookingConfirmationAgain = function() {
    const paymentModal = bootstrap.Modal.getInstance(document.getElementById('paymentModal'));
    if (paymentModal) {
        paymentModal.hide();
    }

    const confirmationModal = new bootstrap.Modal(document.getElementById('bookingConfirmationModal'));
    setTimeout(() => {
        confirmationModal.show();
    }, 250);
};

window.confirmAndSubmitBooking = function() {
    if (!window.pendingBookingForm || !window.pendingFormData) {
        console.error('No pending booking data');
        return;
    }

    const confirmationModal = bootstrap.Modal.getInstance(document.getElementById('bookingConfirmationModal'));
    if (confirmationModal) {
        confirmationModal.hide();
    }

    const paymentModal = new bootstrap.Modal(document.getElementById('paymentModal'));
    paymentModal.show();
};

window.submitPaymentProof = function() {
    const bookingForm = window.pendingBookingForm;
    if (!bookingForm) {
        console.error('No pending booking form');
        return;
    }

    const paymentInput = document.getElementById('paymentScreenshot');
    if (!paymentInput || !paymentInput.files || !paymentInput.files.length) {
        alert('Please upload your transaction screenshot before continuing.');
        return;
    }

    const file = paymentInput.files[0];
    if (!file.type.startsWith('image/')) {
        alert('Please upload a valid image file for your transaction screenshot.');
        return;
    }

    const submitBtn = bookingForm.querySelector('button[type="submit"]');
    const messageDiv = document.getElementById('formMessage');
    const paymentModal = bootstrap.Modal.getInstance(document.getElementById('paymentModal'));
    if (paymentModal) {
        paymentModal.hide();
    }

    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Processing...';
    }

    if (messageDiv) {
        messageDiv.style.display = 'block';
        messageDiv.style.backgroundColor = '#d4edda';
        messageDiv.style.color = '#155724';
        messageDiv.innerHTML = '✅ Payment proof uploaded.<br>Submitting your booking request...';
    }

    console.log('✅ Submitting booking form to Formspree after payment proof upload...');
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
