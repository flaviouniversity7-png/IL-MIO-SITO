// Seleziona gli elementi supportando sia la versione camelCase che con trattino
const lightbox = document.getElementById('lightboxModal') || document.getElementById('lightbox'); 
const lightboxImg = document.getElementById('lightboxImg') || document.getElementById('lightbox-img'); 
const closeBtn = document.querySelector('.lightbox-close') || document.getElementById('close-btn');
const nextBtn = document.querySelector('.arrow-right') || document.getElementById('next-btn');
const prevBtn = document.querySelector('.arrow-left') || document.getElementById('prev-btn');

let immaginiFiltrate = [];
let indiceAttuale = 0;

// 1. INIZIALIZZAZIONE GALLERIA DINAMICA PER TUTTI I PROGETTI
document.querySelectorAll('.gallery-img').forEach((img) => {
    img.style.cursor = 'pointer';
    img.addEventListener('click', () => {
        const tipoGalleria = img.getAttribute('data-gallery');
        if (!tipoGalleria) return;
        
        immaginiFiltrate = Array.from(document.querySelectorAll(`.gallery-img[data-gallery="${tipoGalleria}"]`));
        indiceAttuale = immaginiFiltrate.indexOf(img);
        
        mostraImmagine();
        if (lightbox) {
            lightbox.style.display = 'flex';
            document.body.style.overflow = 'hidden'; // Blocca lo scroll di sfondo
        }
        resettaZoom(); 
    });
});

function mostraImmagine() {
    if (immaginiFiltrate.length === 0 || !lightboxImg) return;
    lightboxImg.src = immaginiFiltrate[indiceAttuale].src;
    lightboxImg.alt = immaginiFiltrate[indiceAttuale].alt;
    resettaZoom(); 
}

function fotoSuccessiva() {
    if (immaginiFiltrate.length === 0) return;
    indiceAttuale = (indiceAttuale + 1) % immaginiFiltrate.length;
    mostraImmagine();
}

function fotoPrecedente() {
    if (immaginiFiltrate.length === 0) return;
    indiceAttuale = (indiceAttuale - 1 + immaginiFiltrate.length) % immaginiFiltrate.length;
    mostraImmagine();
}

function chiudiLightbox() {
    if (lightbox) {
        lightbox.style.display = 'none';
        document.body.style.overflow = ''; 
    }
    resettaZoom();
}

// CONTROLLI PULSANTI E TASTIERA
if (closeBtn) closeBtn.addEventListener('click', chiudiLightbox);
if (nextBtn) nextBtn.addEventListener('click', (e) => { e.stopPropagation(); fotoSuccessiva(); });
if (prevBtn) prevBtn.addEventListener('click', (e) => { e.stopPropagation(); fotoPrecedente(); });

if (lightbox) {
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) chiudiLightbox();
    }); 
}
if (lightboxImg) {
    lightboxImg.addEventListener('click', (e) => { e.stopPropagation(); }); 
}

document.addEventListener('keydown', (e) => {
    if (lightbox && lightbox.style.display === 'flex') {
        if (e.key === 'Escape') chiudiLightbox();
        if (e.key === 'ArrowRight') fotoSuccessiva();
        if (e.key === 'ArrowLeft') fotoPrecedente();
    }
});

// ================= GESTIONE TOUCH / MOBILE (SWIPE & PINCH-ZOOM) =================
let touchStartX = 0;
let touchEndX = 0;
let touchStartY = 0;

let scalaCorrente = 1;
let scalaIniziale = 1;
let distanzaIniziale = 0;

let posX = 0, posY = 0;
let startX = 0, startY = 0;
let isDragging = false;

if (lightbox && lightboxImg) {
    lightbox.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1) {
            const primoTocco = e.touches.item(0);
            touchStartX = primoTocco.clientX;
            touchStartY = primoTocco.clientY;
            
            if (scalaCorrente > 1) {
                isDragging = true;
                startX = primoTocco.clientX - posX;
                startY = primoTocco.clientY - posY;
            }
        } else if (e.touches.length === 2) {
            isDragging = false;
            const t1 = e.touches.item(0);
            const t2 = e.touches.item(1);
            distanzaIniziale = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
            scalaIniziale = scalaCorrente;
        }
    }, { passive: true });

    lightbox.addEventListener('touchmove', (e) => {
        if (e.touches.length === 1 && isDragging) {
            e.preventDefault(); 
            const primoTocco = e.touches.item(0);
            posX = primoTocco.clientX - startX;
            posY = primoTocco.clientY - startY;
            
            limitaSpostamento();
            applicaTrasformazione();
        } else if (e.touches.length === 2) {
            e.preventDefault(); 
            const t1 = e.touches.item(0);
            const t2 = e.touches.item(1);
            const distanzaCorrente = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
            const fattore = distanzaCorrente / distanzaIniziale;
            scalaCorrente = Math.min(Math.max(scalaIniziale * fattore, 1), 3); 
            
            limitaSpostamento();
            applicaTrasformazione();
        }
    }, { passive: false });

    lightbox.addEventListener('touchend', (e) => {
        isDragging = false;
        if (e.touches.length === 0) {
            if (scalaCorrente <= 1) {
                resettaZoom();
                const toccoFinale = e.changedTouches.item(0);
                if (toccoFinale) {
                    touchEndX = toccoFinale.clientX;
                    let touchEndY = toccoFinale.clientY;
                    
                    if (Math.abs(touchStartY - touchEndY) < 40) {
                        gestisciSwipe();
                    }
                }
            }
        }
    }, { passive: true });
}

function limitaSpostamento() {
    if (scalaCorrente <= 1) {
        posX = 0;
        posY = 0;
        return;
    }
    const maxShift = 150 * (scalaCorrente - 1);
    posX = Math.min(Math.max(posX, -maxShift), maxShift);
    posY = Math.min(Math.max(posY, -maxShift), maxShift);
}

function gestisciSwipe() {
    const tolleranzaSwipe = 40; 
    if (touchStartX - touchEndX > tolleranzaSwipe) {
        fotoSuccessiva(); 
    } else if (touchEndX - touchStartX > tolleranzaSwipe) {
        fotoPrecedente(); 
    }
}

function applicaTrasformazione() {
    if (!lightboxImg) return;
    if (scalaCorrente <= 1) {
        scalaCorrente = 1;
        posX = 0;
        posY = 0;
    }
    lightboxImg.style.transition = isDragging ? 'none' : 'transform 0.1s ease-out';
    lightboxImg.style.transform = `translate(${posX}px, ${posY}px) scale(${scalaCorrente})`;
}

function resettaZoom() {
    scalaCorrente = 1;
    posX = 0;
    posY = 0;
    if (lightboxImg) {
        lightboxImg.style.transition = 'transform 0.2s ease';
    }
    applicaTrasformazione();
}