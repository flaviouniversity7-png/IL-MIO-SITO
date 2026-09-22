document.addEventListener("DOMContentLoaded", function () {
    const lightboxModal = document.getElementById("lightboxModal");
    const lightboxImg = document.getElementById("lightboxImg");
    const lightboxClose = document.querySelector(".lightbox-close");
    const arrowLeft = document.querySelector(".arrow-left");
    const arrowRight = document.querySelector(".arrow-right");
    const lightboxDots = document.getElementById("lightboxDots");

    let currentGalleryImages = [];
    let currentIndex = 0;
    
    // Variabili Swipe (Scorrimento galleria)
    let touchStartX = 0;
    let touchEndX = 0;

    // Variabili Zoom & Panning (PC + Mobile)
    let currentScale = 1;
    let zoomLevel = 2; // Ingrandimento al click/doppio tap (200%)
    const maxScale = 4;
    const minScale = 1;
    let pointX = 0, pointY = 0;
    let startX = 0, startY = 0;
    let panning = false;
    let mouseMoved = false;
    let lastTap = 0;

    // Variabili Pinch-to-Zoom (Mobile)
    let initialPinchDistance = 0;
    let initialPinchScale = 1;

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
            resetZoom(); // Resetta lo zoom ad ogni cambio foto
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
            resetZoom();
        }
    }

    if (lightboxClose) {
        lightboxClose.addEventListener("click", closeLightbox);
    }

    function nextImage() {
        currentIndex = (currentIndex + 1) % currentGalleryImages.length;
        updateLightboxContent();
    }

    function prevImage() {
        currentIndex = (currentIndex - 1 + currentGalleryImages.length) % currentGalleryImages.length;
        updateLightboxContent();
    }

    if (arrowLeft) arrowLeft.addEventListener("click", prevImage);
    if (arrowRight) arrowRight.addEventListener("click", nextImage);

    // ==========================================
    // GESTIONE ZOOM (PC & MOBILE) & PANNING
    // ==========================================
    
    function applyZoomTransform() {
        if (currentScale > 1) {
            lightboxImg.style.transform = `translate(${pointX}px, ${pointY}px) scale(${currentScale})`;
            lightboxImg.style.cursor = 'grab';
        } else {
            lightboxImg.style.transform = `translate(0px, 0px) scale(1)`;
            lightboxImg.style.cursor = 'zoom-in';
        }
    }

    function resetZoom() {
        currentScale = 1;
        pointX = 0;
        pointY = 0;
        initialPinchDistance = 0;
        if (lightboxImg) {
            applyZoomTransform();
        }
    }

    if (lightboxImg) {
        lightboxImg.style.cursor = 'zoom-in';

        // 1. Zoom PC: Click con la lente
        lightboxImg.addEventListener("click", function(e) {
            if (mouseMoved) {
                mouseMoved = false;
                return;
            }

            const rect = lightboxImg.getBoundingClientRect();
            
            if (currentScale === 1) {
                const xClick = e.clientX - rect.left;
                const yClick = e.clientY - rect.top;
                
                pointX = ((rect.width / 2) - xClick) * (zoomLevel - 1);
                pointY = ((rect.height / 2) - yClick) * (zoomLevel - 1);
                currentScale = zoomLevel;
            } else {
                resetZoom();
            }
            
            applyZoomTransform();
        });

        // 2. Trascinamento PC (Mouse Drag)
        lightboxImg.addEventListener("mousedown", function(e) {
            if (currentScale > 1) {
                e.preventDefault();
                startX = e.clientX - pointX;
                startY = e.clientY - pointY;
                lightboxImg.style.cursor = 'grabbing';
                mouseMoved = false;

                function onMouseMove(moveEvent) {
                    mouseMoved = true;
                    panning = true;
                    pointX = moveEvent.clientX - startX;
                    pointY = moveEvent.clientY - startY;
                    applyZoomTransform();
                }

                function onMouseUp() {
                    document.removeEventListener("mousemove", onMouseMove);
                    document.removeEventListener("mouseup", onMouseUp);
                    panning = false;
                    if (currentScale > 1) lightboxImg.style.cursor = 'grab';
                }

                document.addEventListener("mousemove", onMouseMove);
                document.addEventListener("mouseup", onMouseUp);
            }
        });

        // 3. ZOOM MOBILE: Pinch-To-Zoom (2 dita) e Trascinamento (1 dito)
        lightboxImg.addEventListener("touchstart", function(e) {
            if (e.touches.length === 2) {
                // Avvia Pinch-To-Zoom con due dita
                e.preventDefault();
                initialPinchDistance = Math.hypot(
                    e.touches[0].clientX - e.touches[1].clientX,
                    e.touches[0].clientY - e.touches[1].clientY
                );
                initialPinchScale = currentScale;
            } else if (e.touches.length === 1 && currentScale > 1) {
                // Avvia trascinamento con un dito quando la foto è zoomata
                panning = true;
                startX = e.touches[0].clientX - pointX;
                startY = e.touches[0].clientY - pointY;
            }
        }, { passive: false });

        lightboxImg.addEventListener("touchmove", function(e) {
            if (e.touches.length === 2 && initialPinchDistance > 0) {
                // Calcola lo zoom durante il pinch
                e.preventDefault();
                const currentDistance = Math.hypot(
                    e.touches[0].clientX - e.touches[1].clientX,
                    e.touches[0].clientY - e.touches[1].clientY
                );

                let newScale = initialPinchScale * (currentDistance / initialPinchDistance);
                if (newScale < minScale) newScale = minScale;
                if (newScale > maxScale) newScale = maxScale;

                currentScale = newScale;

                if (currentScale === 1) {
                    pointX = 0;
                    pointY = 0;
                }

                applyZoomTransform();
            } else if (e.touches.length === 1 && panning && currentScale > 1) {
                // Sposta l'immagine durante il trascinamento ad un dito
                e.preventDefault();
                pointX = e.touches[0].clientX - startX;
                pointY = e.touches[0].clientY - startY;
                applyZoomTransform();
            }
        }, { passive: false });

        lightboxImg.addEventListener("touchend", function(e) {
            panning = false;
            
            if (e.touches.length < 2) {
                initialPinchDistance = 0;
            }

            // Se lo zoom si è ridotto quasi a 1, ripristina la posizione normale
            if (currentScale < 1.05) {
                resetZoom();
            }

            // Doppio tap rapido da mobile per Zoom / Unzoom nel punto toccato
            let currentTime = new Date().getTime();
            let tapLength = currentTime - lastTap;
            if (tapLength < 300 && tapLength > 0 && e.changedTouches.length === 1 && e.touches.length === 0) {
                const rect = lightboxImg.getBoundingClientRect();
                const touchX = e.changedTouches[0].clientX;
                const touchY = e.changedTouches[0].clientY;

                if (currentScale === 1) {
                    const xClick = touchX - rect.left;
                    const yClick = touchY - rect.top;

                    pointX = ((rect.width / 2) - xClick) * (zoomLevel - 1);
                    pointY = ((rect.height / 2) - yClick) * (zoomLevel - 1);
                    currentScale = zoomLevel;
                } else {
                    resetZoom();
                }
                applyZoomTransform();
            }
            lastTap = currentTime;
        });
    }

    // ==========================================
    // GESTIONE SWIPE (SCORRIMENTO FOTO MOBILE)
    // ==========================================

    if (lightboxModal) {
        lightboxModal.addEventListener("click", function (e) {
            if (e.target === lightboxModal) closeLightbox();
        });

        lightboxModal.addEventListener('touchstart', e => {
            if (currentScale === 1 && e.touches.length === 1) { 
                touchStartX = e.changedTouches[0].screenX;
            }
        }, { passive: true });

        lightboxModal.addEventListener('touchend', e => {
            if (currentScale === 1 && e.changedTouches.length === 1) {
                touchEndX = e.changedTouches[0].screenX;
                handleSwipe();
            }
        }, { passive: true });
    }

    function handleSwipe() {
        if (currentScale > 1) return; 
        const swipeThreshold = 50; 
        if (touchEndX < touchStartX - swipeThreshold) nextImage();
        if (touchEndX > touchStartX + swipeThreshold) prevImage();
    }

    // Navigazione da tastiera PC
    document.addEventListener("keydown", function (e) {
        if (lightboxModal && lightboxModal.style.display === "flex") {
            if (e.key === "Escape") closeLightbox();
            else if (e.key === "ArrowLeft") prevImage();
            else if (e.key === "ArrowRight") nextImage();
        }
    });
});