// === DATA-SERVICE.JS ===

/**
 * Normalise l'état global de l'application
 */
window.normalizeAppState = function() {
  const currentUid = auth.currentUser ? auth.currentUser.uid : null;
  const now = Date.now();
  let changed = false;

  if (!appState.balances) {
    appState.balances = { liquide: 0, baridimob: 0, usdt: 0 };
    changed = true;
  }
  
  if (!appState.sync) {
    appState.sync = { pendingCloudSave: false, retryDelayMs: 5000, itemSnapshots: {}, pendingDeletions: [] };
    changed = true;
  }

  const collections = ['clients', 'offers', 'transactions', 'todoTransactions', 'payments', 'usdPurchases', 'expenses', 'usdtExpenses', 'recurringExpenses', 'clientRequests'];
  
  collections.forEach(col => {
    if (!Array.isArray(appState[col])) {
      appState[col] = [];
      changed = true;
    }
  });

  if (changed) {
    saveToLocalStorage();
  }
};

/**
 * Sauvegarde locale
 */
window.saveToLocalStorage = function() {
  localStorage.setItem('hichemSponsor', JSON.stringify(appState));
};

/**
 * Chargement local
 */
window.loadFromLocalStorage = function() {
  const data = localStorage.getItem('hichemSponsor');
  if (data) {
    try {
      const parsed = JSON.parse(data);
      if (parsed && typeof parsed === 'object') {
        Object.assign(window.appState, parsed);
        normalizeAppState();
      }
    } catch (e) {
      console.error('Erreur parse localStorage', e);
    }
  }
};

/**
 * Sauvegarde Cloud (Firestore)
 */
window.saveToCloud = async function() {
  try {
    const user = auth.currentUser;
    if (!user) return;
    const uid = user.uid;
    const db = firebase.firestore();
    
    appState.lastUpdated = Date.now();
    
    // On sauvegarde un snapshot des réglages
    const settings = {
      globalConfig: appState.globalConfig,
      settings: appState.settings,
      manualBalances: appState.manualBalances,
      lastUpdated: appState.lastUpdated
    };
    
    await db.collection('users').doc(uid).set({ data: settings }, { merge: true });
    
    // Synchro granulaire des collections
    await syncGranularToCloud();
    
    console.log('☁️ Sauvegarde Cloud réussie');
    appState.sync.pendingCloudSave = false;
    
    // Si c'est une sauvegarde manuelle, on notifie
    if (window.isManualSave) {
      showToast('Sauvegarde Cloud réussie !', 'success');
      window.isManualSave = false;
    }
  } catch (err) {
    console.error('Erreur sauvegarde cloud:', err);
    appState.sync.pendingCloudSave = true;
    showToast('Erreur de synchronisation Cloud. Vérifiez votre connexion.', 'error');
  }
};

/**
 * Synchronisation granulaire (Delta)
 */
async function syncGranularToCloud() {
  const db = firebase.firestore();
  const uid = auth.currentUser?.uid;
  if (!uid) return;

  const collections = ['clients', 'offers', 'transactions', 'todoTransactions', 'payments', 'usdPurchases', 'expenses', 'clientRequests', 'recurringExpenses', 'usdtExpenses'];
  
  const promises = [];
  
  collections.forEach(colName => {
    const items = appState[colName];
    items.forEach(item => {
      if (!item.id) item.id = generateId();
      item.uid = uid;
      item.updatedAt = item.updatedAt || Date.now();
      
      promises.push(db.collection(colName).doc(item.id).set(item, { merge: true }));
    });
  });

  await Promise.all(promises);
}

/**
 * Chargement Cloud
 */
window.loadFromCloud = async function() {
  try {
    const user = auth.currentUser;
    if (!user) return;
    const uid = user.uid;
    const db = firebase.firestore();
    
    const doc = await db.collection('users').doc(uid).get();
    if (doc.exists) {
      const cloudData = doc.data().data || {};
      Object.assign(appState, cloudData);
      
      // Charger les collections granulaires
      await loadGranularFromCloud();
      
      normalizeAppState();
      renderTables(); // Si disponible
      showToast('Données chargées depuis le Cloud', 'success');
    }
  } catch (err) {
    console.error('Erreur chargement cloud:', err);
    showToast('Erreur lors du chargement des données Cloud', 'error');
  }
};

/**
 * Chargement granulaire
 */
async function loadGranularFromCloud() {
  const db = firebase.firestore();
  const uid = auth.currentUser?.uid;
  if (!uid) return;

  const collections = ['clients', 'offers', 'transactions', 'todoTransactions', 'payments', 'usdPurchases', 'expenses', 'clientRequests', 'recurringExpenses', 'usdtExpenses'];
  
  const promises = collections.map(col => 
    db.collection(col).where('uid', '==', uid).get()
  );

  const snapshots = await Promise.all(promises);
  
  snapshots.forEach((snap, index) => {
    const colName = collections[index];
    appState[colName] = snap.docs.map(d => d.data());
  });
}

/**
 * Auto-sauvegarde déclenchée par les changements
 */
window.autoSave = function() {
  saveToLocalStorage();
  if (appState.settings.autoSaveEnabled && auth.currentUser) {
    saveToCloud();
  }
};
