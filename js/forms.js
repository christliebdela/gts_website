document.addEventListener('DOMContentLoaded', function() {

    function generateCaptcha() {
        return Math.floor(1000 + Math.random() * 9000).toString();
    }

    const captchaImage = document.getElementById('captchaImage');
    if (captchaImage) {
        const captchaValue = generateCaptcha();
        captchaImage.innerText = captchaValue;

        const captchaValueField = document.getElementById('captchaValueField');
        if (captchaValueField) {
            captchaValueField.value = captchaValue;
        }
    }

    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', async function(event) {
            event.preventDefault();
            if (!contactForm.checkValidity()) {
                event.stopPropagation();
                contactForm.classList.add('was-validated');
                return;
            }

            const securityCode = document.getElementById('security').value;
            const captchaValue = document.getElementById('captchaImage').innerText.trim();

            if (securityCode !== captchaValue) {
                const formMessage = document.getElementById('formMessage');
                formMessage.innerHTML = '<div class="alert alert-danger">Incorrect security code. Please try again.</div>';
                formMessage.style.display = 'block';
                return;
            }

            try {

                const submitButton = contactForm.querySelector('button[type="submit"]');
                const originalText = submitButton.innerHTML;
                submitButton.disabled = true;
                submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Sending...';

                const formData = {
                    name: document.getElementById('name').value,
                    email: document.getElementById('email').value,
                    phone: document.getElementById('phone').value,
                    company: document.getElementById('company').value || '',
                    message: document.getElementById('message').value
                };

                const { data, error } = await supabaseClient
                    .from('contact_submissions')
                    .insert([formData]);

                if (error) throw error;

                const formMessage = document.getElementById('formMessage');
                formMessage.innerHTML = '<div class="alert alert-success">Thank you for your message! We will get back to you soon.</div>';
                formMessage.style.display = 'block';
                contactForm.reset();
                contactForm.classList.remove('was-validated');

                const newCaptchaValue = generateCaptcha();
                captchaImage.innerText = newCaptchaValue;
                if (captchaValueField) {
                    captchaValueField.value = newCaptchaValue;
                }

            } catch (error) {
                console.error('Error submitting form:', error);
                const formMessage = document.getElementById('formMessage');
                formMessage.innerHTML = '<div class="alert alert-danger">There was a problem submitting your form. Please try again later.</div>';
                formMessage.style.display = 'block';
            } finally {

                submitButton.disabled = false;
                submitButton.innerHTML = originalText;
            }
        });
    }

    const quoteForm = document.getElementById('quoteForm');
    if (quoteForm) {
        quoteForm.addEventListener('submit', async function(event) {
            event.preventDefault();
            if (!quoteForm.checkValidity()) {
                event.stopPropagation();
                quoteForm.classList.add('was-validated');
                return;
            }

            try {

                const submitButton = quoteForm.querySelector('button[type="submit"]');
                const originalText = submitButton.innerHTML;
                submitButton.disabled = true;
                submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Sending...';

                const formData = {
                    name: document.getElementById('quoteName').value,
                    email: document.getElementById('quoteEmail').value,
                    phone: document.getElementById('quotePhone').value,
                    company: document.getElementById('quoteCompany').value || '',
                    product_type: document.getElementById('productType').value,
                    message: document.getElementById('quoteMessage').value
                };

                const { data, error } = await supabaseClient
                    .from('quote_requests')
                    .insert([formData]);

                if (error) throw error;

                const quoteFormMessage = document.getElementById('quoteFormMessage');
                quoteFormMessage.innerHTML = '<div class="alert alert-success">Thank you for your quotation request! Our team will prepare a personalized quote and contact you shortly.</div>';
                quoteFormMessage.style.display = 'block';
                quoteForm.reset();
                quoteForm.classList.remove('was-validated');

            } catch (error) {
                console.error('Error submitting quote form:', error);
                const quoteFormMessage = document.getElementById('quoteFormMessage');
                quoteFormMessage.innerHTML = '<div class="alert alert-danger">There was a problem submitting your form. Please try again later.</div>';
                quoteFormMessage.style.display = 'block';
            } finally {

                submitButton.disabled = false;
                submitButton.innerHTML = originalText;
            }
        });
    }

    const sb = window.supabaseClient;
});