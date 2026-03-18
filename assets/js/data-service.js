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
  
  if (!appState.settings) {
    appState.settings = { storageMode: 'cloud', autoSaveEnabled: true };
    changed = true;
  }
  if (!appState.settings.storageMode) {
    appState.settings.storageMode = 'cloud';
    changed = true;
  }
  if (appState.settings.autoSaveEnabled === undefined) {
    appState.settings.autoSaveEnabled = true;
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

  if (Array.isArray(appState.offers)) {
    appState.offers.forEach(o => {
      if (!o || typeof o !== 'object') return;
      if (o.priceDzd == null && o.price != null) o.priceDzd = o.price;
      const p = Number(o.priceDzd || 0);
      o.priceDzd = Number.isFinite(p) ? p : 0;
      const c = Number(o.costPerUnit || 0);
      o.costPerUnit = Number.isFinite(c) ? c : 0;
      if (!o.name) o.name = 'Offre';
    });
  }

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
    
    // Process pending deletions
    if (appState.sync && appState.sync.pendingDeletions && appState.sync.pendingDeletions.length > 0) {
        console.log(`Processing ${appState.sync.pendingDeletions.length} pending cloud deletions...`);
        const deletePromises = appState.sync.pendingDeletions.map(del => {
            // Wait, for users/settings and employees, they usually don't have their own granular collection
            // But if they do, we delete. For safety, let's catch errors individually.
            return db.collection(del.col).doc(del.id).delete().catch(e => console.error("Del Err", e));
        });
        await Promise.all(deletePromises);
        appState.sync.pendingDeletions = [];
        saveToLocalStorage();
    }
    
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
    if (Array.isArray(items)) {
        items.forEach(item => {
        if (!item.id) item.id = generateId();
        item.uid = uid;
        item.updatedAt = item.updatedAt || Date.now();
        
        promises.push(db.collection(colName).doc(item.id).set(item, { merge: true }));
        });
    }
  });

  await Promise.all(promises);
}

/**
 * Chargement Cloud
 */
// Track unsubscribe functions
window.cloudListeners = [];

window.loadFromCloud = async function() {
  try {
    const user = auth.currentUser;
    if (!user) return;
    const uid = user.uid;
    const db = firebase.firestore();
    
    // Cleanup previous listeners if any
    if (window.cloudListeners.length > 0) {
        window.cloudListeners.forEach(unsub => unsub());
        window.cloudListeners = [];
    }
    
    // Listen to user settings document
    const unsubSettings = db.collection('users').doc(uid).onSnapshot(doc => {
        if (doc.exists) {
            const cloudData = doc.data().data || {};
            Object.assign(appState, cloudData);
            normalizeAppState();
            if (typeof renderTables === 'function') renderTables();
        }
    });
    
    window.cloudListeners.push(unsubSettings);
    
    // Initiate granular listeners
    loadGranularFromCloud();
    
    showToast('Synchronisation Cloud en temps réel activée', 'success');
  } catch (err) {
    console.error('Erreur init cloud listeners:', err);
    showToast('Erreur de synchronisation Cloud', 'error');
  }
};

/**
 * Variables to prevent infinite loops during initial sync
 */
let initialLoadCount = 0;
const totalCollections = 10;

function loadGranularFromCloud() {
  const db = firebase.firestore();
  const uid = auth.currentUser?.uid;
  if (!uid) return;

  const collections = ['clients', 'offers', 'transactions', 'todoTransactions', 'payments', 'usdPurchases', 'expenses', 'clientRequests', 'recurringExpenses', 'usdtExpenses'];
  initialLoadCount = 0;

  collections.forEach(colName => {
    const unsub = db.collection(colName).where('uid', '==', uid).onSnapshot(snapshot => {
      appState[colName] = snapshot.docs.map(d => d.data());
      
      initialLoadCount++;
      if (initialLoadCount >= totalCollections) {
          // Only render after everything is loaded initially, or on subsequent single-collection updates
          normalizeAppState();
          if (typeof renderTables === 'function') renderTables();
          if (typeof recalculateFinanceBalances === 'function') recalculateFinanceBalances();
      }
    });
    
    window.cloudListeners.push(unsub);
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
