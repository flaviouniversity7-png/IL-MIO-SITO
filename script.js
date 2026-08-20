const fotoPrincipale = document.getElementById('foto-principale');
const schermataTransizione = document.getElementById('schermata-transizione');
const singoleFoto = document.querySelectorAll('.foto-slide');

fotoPrincipale.addEventListener('click', () => {
  // Attiva lo sfondo beige
  schermataTransizione.classList.add('attiva');

  // Aspetta un istante e poi fa nascere le tre foto dal puntino
  setTimeout(() => {
    singoleFoto.forEach((foto, indice) => {
      setTimeout(() => {
        foto.classList.add('zoom');
      }, indice * 150); // Ritardo a cascata tra una foto e l'altra
    });
  }, 250); 
});