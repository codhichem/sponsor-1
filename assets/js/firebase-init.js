// === FIREBASE CONFIG & INIT ===
const firebaseConfig = {
  apiKey: "AIzaSyATuFiDT8YMov68euJCMB4Ax1eyBOCGqqc",
  authDomain: "sponsor-test-20c6b.firebaseapp.com",
  databaseURL: "https://sponsor-test-20c6b-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "sponsor-test-20c6b",
  storageBucket: "sponsor-test-20c6b.firebasestorage.app",
  messagingSenderId: "882035160210",
  appId: "1:882035160210:web:7a7d005155c4ba91bee24b",
  measurementId: "G-8KJ1NBDCCJ"
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
window.db = getDb();
