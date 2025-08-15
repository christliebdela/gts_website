// Initialize Gallery functionality
function initGallery() {
    // Initialize GLightbox
    const lightbox = GLightbox({
        touchNavigation: true,
        loop: true,
        autoplayVideos: true
    });

    // Initialize Isotope
    const grid = document.querySelector('.gallery-grid');
    if (grid) {
        const iso = new Isotope(grid, {
            itemSelector: '.gallery-item',
            percentPosition: true,
            layoutMode: 'fitRows',
            fitRows: {
                gutter: 24
            }
        });

        // Filter items on button click
        const filterBtns = document.querySelectorAll('.gallery-filter .nav-link');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const filterValue = btn.getAttribute('data-filter');
                iso.arrange({ filter: filterValue === '*' ? null : filterValue });
                
                // Update active state
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });
    }
}

// Initialize gallery when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    if (document.querySelector('.gallery-grid')) {
        initGallery();
    }
});
