document.addEventListener("DOMContentLoaded", function () {
    const lightboxModal = document.getElementById("lightboxModal");
    const lightboxImg = document.getElementById("lightboxImg");
    const lightboxClose = document.querySelector(".lightbox-close");
    const arrowLeft = document.querySelector(".arrow-left");
    const arrowRight = document.querySelector(".arrow-right");
    const lightboxDots = document.getElementById("lightboxDots");

    let currentGalleryImages = [];
    let currentIndex = 0;
    
    // Variabili Swipe
    let touchStartX = 0;
    let touchEndX = 0;

    // Variabili Zoom & Panning
    let isZoomed = false;
    let zoomLevel = 2; // Ingrandimento fisso impostato al 200% (puoi modificarlo a piacere)
    let pointX = 0, pointY = 0;
    let startX = 0, startY = 0;
    let panning = false;
    let mouseMoved = false;
    let lastTap = 0;

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
            resetZoom(); // Resetta lo zoom quando si cambia foto
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
    // GESTIONE ZOOM (LENTE AL CLICK) & PANNING
    // ==========================================
    
    function applyZoomTransform() {
        if (isZoomed) {
            lightboxImg.style.transform = `translate(${pointX}px, ${pointY}px) scale(${zoomLevel})`;
            lightboxImg.style.cursor = 'grab'; // Cambia in manina per trascinare
        } else {
            lightboxImg.style.transform = `translate(0px, 0px) scale(1)`;
            lightboxImg.style.cursor = 'zoom-in'; // Cursore a lente
        }
    }

    function resetZoom() {
        isZoomed = false;
        pointX = 0;
        pointY = 0;
        if (lightboxImg) {
            applyZoomTransform();
        }
    }

    if (lightboxImg) {
        // Cursore iniziale a lente
        lightboxImg.style.cursor = 'zoom-in';

        // 1. Zoom In sul punto esatto con 1 Click / Zoom Out con 2° Click
        lightboxImg.addEventListener("click", function(e) {
            // Se stavi trascinando l'immagine, ignora il click per evitare di togliere lo zoom per errore
            if (mouseMoved) {
                mouseMoved = false;
                return;
            }

            const rect = lightboxImg.getBoundingClientRect();
            
            if (!isZoomed) {
                // Calcola le coordinate dove hai cliccato rispetto all'immagine
                const xClick = e.clientX - rect.left;
                const yClick = e.clientY - rect.top;
                
                // Centra lo zoom esattamente nel punto in cui si trova il mouse
                pointX = ((rect.width / 2) - xClick) * (zoomLevel - 1);
                pointY = ((rect.height / 2) - yClick) * (zoomLevel - 1);
                
                isZoomed = true;
            } else {
                // Secondo click: ripristina la dimensione originale
                resetZoom();
            }
            
            applyZoomTransform();
        });

        // 2. Trascinamento immagine zoomata da PC (Mouse Drag)
        lightboxImg.addEventListener("mousedown", function(e) {
            if (isZoomed) {
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
                    if (isZoomed) lightboxImg.style.cursor = 'grab';
                }

                document.addEventListener("mousemove", onMouseMove);
                document.addEventListener("mouseup", onMouseUp);
            }
        });

        // 3. Trascinamento & Doppio Tap per Mobile
        lightboxImg.addEventListener("touchstart", function(e) {
            if (e.touches.length === 1 && isZoomed) {
                panning = true;
                startX = e.touches[0].clientX - pointX;
                startY = e.touches[0].clientY - pointY;
            }
        }, { passive: true });

        lightboxImg.addEventListener("touchmove", function(e) {
            if (e.touches.length === 1 && panning && isZoomed) {
                e.preventDefault(); // Impedisce lo scroll di pagina durante il drag
                pointX = e.touches[0].clientX - startX;
                pointY = e.touches[0].clientY - startY;
                applyZoomTransform();
            }
        }, { passive: false });

        lightboxImg.addEventListener("touchend", function(e) {
            panning = false;
            
            // Doppio tap rapido da mobile per lo zoom nel punto toccato
            let currentTime = new Date().getTime();
            let tapLength = currentTime - lastTap;
            if (tapLength < 300 && tapLength > 0 && e.changedTouches.length === 1) {
                const rect = lightboxImg.getBoundingClientRect();
                const touchX = e.changedTouches[0].clientX;
                const touchY = e.changedTouches[0].clientY;

                if (!isZoomed) {
                    const xClick = touchX - rect.left;
                    const yClick = touchY - rect.top;

                    pointX = ((rect.width / 2) - xClick) * (zoomLevel - 1);
                    pointY = ((rect.height / 2) - yClick) * (zoomLevel - 1);

                    isZoomed = true;
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
            if (!isZoomed && e.touches.length === 1) { 
                touchStartX = e.changedTouches[0].screenX;
            }
        }, { passive: true });

        lightboxModal.addEventListener('touchend', e => {
            if (!isZoomed && e.changedTouches.length === 1) {
                touchEndX = e.changedTouches[0].screenX;
                handleSwipe();
            }
        }, { passive: true });
    }

    function handleSwipe() {
        if (isZoomed) return; 
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