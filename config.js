// Firebase Configuration
// ✅ GERÇEK Firebase projesi config'i - gtuhub-187e5
// Firebase konsolu: https://console.firebase.google.com

const firebaseConfig = {
    apiKey: "AIzaSyAmuFEk9DpxGwyvy8cyszWi86xgrOIXSSU",
    authDomain: "gtuhub-187e5.firebaseapp.com",
    databaseURL: "https://gtuhub-187e5-default-rtdb.firebaseio.com",
    projectId: "gtuhub-187e5",
    storageBucket: "gtuhub-187e5.firebasestorage.app",
    messagingSenderId: "671991063707",
    appId: "1:671991063707:web:2710bc3f40d3d97043923e",
    measurementId: "G-3VZJL6TRTC"
};

// Ana config olarak gerçek Firebase project'i kullan
const config = firebaseConfig;

// Firebase'i başlat
try {
    if (typeof firebase !== 'undefined') {
        firebase.initializeApp(config);
        console.log('🔥 Firebase başarıyla başlatıldı!');
        
        // Database bağlantısını test et
        const database = firebase.database();
        database.ref('.info/connected').on('value', function(snapshot) {
            if (snapshot.val() === true) {
                console.log('✅ Firebase Database bağlantısı aktif!');
            } else {
                console.log('❌ Firebase Database bağlantısı kesildi.');
            }
        });
    } else {
        throw new Error('Firebase SDK yüklenmedi');
    }
} catch (error) {
    console.error('❌ Firebase başlatma hatası:', error);
    alert('Firebase bağlantısı kurulamadı. Chat sistemi çalışmayabilir.');
}

// Export database for use in other scripts
window.firebaseDB = firebase.database();