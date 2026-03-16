// === FIREBASE CONFIG & INIT ===
const firebaseConfig = {
  apiKey: "AIzaSyC-1uQnZRLzqUoTMQ_oaXNZh-QQROfOEqw",
  authDomain: "sponsorhichem.firebaseapp.com",
  projectId: "sponsorhichem",
  storageBucket: "sponsorhichem.firebasestorage.app",
  messagingSenderId: "499965988228",
  appId: "1:499965988228:web:ecdbd5b005c23b6d5c61d1"
};

let auth = null;
let db = null;

function initFirebase() {
  try {
    if (window.firebase && typeof firebase.initializeApp === 'function') {
      firebase.initializeApp(firebaseConfig);
      auth = firebase.auth();
      window.auth = auth;
      try {
        auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);
      } catch (e) {
        console.error("Auth persistence error:", e);
      }
    }
  } catch (e) {
    console.error("Firebase init error:", e);
    auth = {
      currentUser: null,
      signInWithEmailAndPassword: async function () { throw e; },
      onAuthStateChanged: function () {},
      setPersistence: function () {}
    };
    window.auth = auth;
  }
}

function getDb() {
  if (!window.firebase || !firebase.firestore) return null;
  if (!db) {
    db = firebase.firestore();
    try {
      db.settings({
        ignoreUndefinedProperties: true,
        merge: true,
        experimentalForceLongPolling: true,
        useFetchStreams: false
      });
      try {
        db.enablePersistence({ synchronizeTabs: true }).catch(function(err) {
          console.log("Persistence failed", err);
        });
      } catch(e) {}
    } catch (e) {}
  }
  return db;
}

initFirebase();
window.getDb = getDb;
