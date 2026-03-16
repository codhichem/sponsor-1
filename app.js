// === APP.JS ===

/**
 * Initialisation au chargement de la page
 */
document.addEventListener('DOMContentLoaded', async () => {
  console.log('🚀 Initialisation de l\'application...');
  
  // 1. Charger les données locales en premier pour une UI rapide
  loadFromLocalStorage();
  
  // 2. Initialiser Firebase
  if (typeof initFirebase === 'function') {
    initFirebase();
  }
  
  // 3. Écouter l'état de l'authentification
  firebase.auth().onAuthStateChanged(async (user) => {
    if (user) {
      console.log('👤 Utilisateur connecté:', user.email);
      await loadFromCloud();
      showAdminSpace();
    } else {
      console.log('� Aucun utilisateur connecté');
      // Si on n'est pas en mode employé, on reste sur le login
      if (!appState.session || appState.session.type !== 'employee') {
        document.getElementById('loginContainer').style.display = 'flex';
        document.getElementById('appContainer').style.display = 'none';
      } else {
        showAdminSpace();
      }
    }
    renderTables();
  });
  
  // 4. Premier rendu si local
  renderTables();
});

/**
 * Fonction de secours pour afficher l'UI si Firebase est lent
 */
window.emergencyRevealUI = function() {
  if (document.getElementById('loginContainer').style.display === 'none' && 
      document.getElementById('appContainer').style.display === 'none' &&
      document.getElementById('clientSpaceContainer').style.display === 'none') {
    document.getElementById('loginContainer').style.display = 'flex';
  }
};

setTimeout(emergencyRevealUI, 3000);
