document.addEventListener("DOMContentLoaded", function () {
    const lightboxModal = document.getElementById("lightboxModal");
    const lightboxImg = document.getElementById("lightboxImg");
    const lightboxClose = document.querySelector(".lightbox-close");
    const arrowLeft = document.querySelector(".arrow-left");
    const arrowRight = document.querySelector(".arrow-right");
    const lightboxDots = document.getElementById("lightboxDots");

    let currentGalleryImages = [];
    let currentIndex = 0;

    // Seleziona tutte le immagini della galleria nel portfolio
    const galleryImages = document.querySelectorAll(".gallery-img");

    galleryImages.forEach(img => {
        img.addEventListener("click", function () {
            const galleryName = this.getAttribute("data-gallery");
            // Raccoglie tutte le immagini appartenenti alla stessa cartella/galleria
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

    // Funzione che genera e aggiorna i puntini in basso nel lightbox
    function updateDots() {
        if (!lightboxDots) return;
        lightboxDots.innerHTML = ""; // Pulisce i puntini precedenti

        currentGalleryImages.forEach((_, index) => {
            const dot = document.createElement("span");
            dot.classList.add("dot");
            
            if (index === currentIndex) {
                dot.classList.add("active"); // Evidenzia il puntino della foto corrente
            }

            // Cliccando sul puntino si passa direttamente a quell'immagine
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

    if (arrowLeft) {
        arrowLeft.addEventListener("click", function () {
            currentIndex = (currentIndex - 1 + currentGalleryImages.length) % currentGalleryImages.length;
            updateLightboxContent();
        });
    }

    if (arrowRight) {
        arrowRight.addEventListener("click", function () {
            currentIndex = (currentIndex + 1) % currentGalleryImages.length;
            updateLightboxContent();
        });
    }

    // Chiude il lightbox cliccando sullo sfondo scuro esterno
    if (lightboxModal) {
        lightboxModal.addEventListener("click", function (e) {
            if (e.target === lightboxModal) {
                closeLightbox();
            }
        });
    }

    // Navigazione da tastiera (Frecce sinistra/destra e ESC)
    document.addEventListener("keydown", function (e) {
        if (lightboxModal && lightboxModal.style.display === "flex") {
            if (e.key === "Escape") {
                closeLightbox();
            } else if (e.key === "ArrowLeft") {
                currentIndex = (currentIndex - 1 + currentGalleryImages.length) % currentGalleryImages.length;
                updateLightboxContent();
            } else if (e.key === "ArrowRight") {
                currentIndex = (currentIndex + 1) % currentGalleryImages.length;
                updateLightboxContent();
            }
        }
    });
});