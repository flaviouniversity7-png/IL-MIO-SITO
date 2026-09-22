document.addEventListener("DOMContentLoaded", function () {
    const lightboxModal = document.getElementById("lightboxModal");
    const lightboxImg = document.getElementById("lightboxImg");
    const lightboxClose = document.querySelector(".lightbox-close");
    const arrowLeft = document.querySelector(".arrow-left");
    const arrowRight = document.querySelector(".arrow-right");
    const lightboxDots = document.getElementById("lightboxDots");

    let currentGalleryImages = [];
    let currentIndex = 0;
    
    // Variabili per lo swipe da mobile
    let touchStartX = 0;
    let touchEndX = 0;

    // Seleziona tutte le immagini della galleria
    const galleryImages = document.querySelectorAll(".gallery-img");

    galleryImages.forEach(img => {
        img.addEventListener("click", function () {
            const galleryName = this.getAttribute("data-gallery");
            currentGalleryImages = Array.from(document.querySelectorAll(`.gallery-img[data-gallery="${galleryName}"]`));
            currentIndex = currentGalleryImages.indexOf(this);
            openLightbox();
        });
    });

    function openLightbox() {
        if (lightboxModal) {
            lightboxModal.style.display = "flex";
            updateLightboxContent();
        }
    }

    function updateLightboxContent() {
        if (currentGalleryImages.length > 0 && lightboxImg) {
            lightboxImg.src = currentGalleryImages[currentIndex].src;
            updateDots();
        }
    }

    function updateDots() {
        if (!lightboxDots) return;
        lightboxDots.innerHTML = ""; 

        currentGalleryImages.forEach((_, index) => {
            const dot = document.createElement("span");
            dot.classList.add("dot");
            
            if (index === currentIndex) {
                dot.classList.add("active"); 
            }

            dot.addEventListener("click", function () {
                currentIndex = index;
                updateLightboxContent();
            });

            lightboxDots.appendChild(dot);
        });
    }

    function closeLightbox() {
        if (lightboxModal) {
            lightboxModal.style.display = "none";
        }
    }

    if (lightboxClose) {
        lightboxClose.addEventListener("click", closeLightbox);
    }

    // Funzioni per cambiare foto
    function nextImage() {
        currentIndex = (currentIndex + 1) % currentGalleryImages.length;
        updateLightboxContent();
    }

    function prevImage() {
        currentIndex = (currentIndex - 1 + currentGalleryImages.length) % currentGalleryImages.length;
        updateLightboxContent();
    }

    if (arrowLeft) {
        arrowLeft.addEventListener("click", prevImage);
    }

    if (arrowRight) {
        arrowRight.addEventListener("click", nextImage);
    }

    if (lightboxModal) {
        lightboxModal.addEventListener("click", function (e) {
            if (e.target === lightboxModal) {
                closeLightbox();
            }
        });

        // GESTIONE SWIPE (TOCCO DA MOBILE)
        lightboxModal.addEventListener('touchstart', e => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        lightboxModal.addEventListener('touchend', e => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, { passive: true });
    }

    function handleSwipe() {
        const swipeThreshold = 50; // Distanza minima per considerare valido lo swipe
        if (touchEndX < touchStartX - swipeThreshold) {
            nextImage(); // Swipe verso sinistra -> prossima foto
        }
        if (touchEndX > touchStartX + swipeThreshold) {
            prevImage(); // Swipe verso destra -> foto precedente
        }
    }

    document.addEventListener("keydown", function (e) {
        if (lightboxModal && lightboxModal.style.display === "flex") {
            if (e.key === "Escape") {
                closeLightbox();
            } else if (e.key === "ArrowLeft") {
                prevImage();
            } else if (e.key === "ArrowRight") {
                nextImage();
            }
        }
    });
});