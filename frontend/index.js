document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.btn-login').forEach(button => {
        button.addEventListener('click', function() {
            window.location.href = "./register/register.html";
        });
    });
    
    document.querySelectorAll('.btn-signup, .btn-hero').forEach(button => {
        button.addEventListener('click', function() {
            window.location.href = "./register/register.html";
        });
    });

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    document.querySelectorAll('.feature-card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });

    // Add hover effect to footer links
    document.querySelectorAll('.footer-links a').forEach(link => {
        link.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
        });
        
        link.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });

    window.validateForm = function(formData) {
        const errors = [];
        
        if (!formData.email || !formData.email.includes('@')) {
            errors.push('Please enter a valid email address');
        }
        
        if (!formData.password || formData.password.length < 6) {
            errors.push('Password must be at least 6 characters long');
        }
        
        return errors;
    };

    console.log('Connectly Address Book Management loaded successfully!');
});