# 🔥 Firebase Kurulum Rehberi

Bu rehber, GTU Medya Oynatıcı için Firebase Realtime Database kurulumunu adım adım açıklar.

## 📋 Adım 1: Firebase Console'a Erişim

1. Tarayıcınızda [Firebase Console](https://console.firebase.google.com) açın
2. Google hesabınızla giriş yapın
3. "Create a project" veya "Add project" butonuna tıklayın

## 🆕 Adım 2: Yeni Proje Oluşturma

1. **Proje Adı**: `gtu-medya-oynatici` (veya istediğiniz bir isim)
2. **Project ID**: Otomatik oluşturulur, not edin
3. **Analytics**: İsteğe bağlı (önerilen: etkin)
4. "Create project" tıklayın

## 🗄️ Adım 3: Realtime Database Kurulumu

1. Sol menüden **"Build"** > **"Realtime Database"** seçin
2. **"Create Database"** butonuna tıklayın
3. **Database location** seçin:
   - Avrupa için: `europe-west1`
   - ABD için: `us-central1`
4. **Security Rules** için **"Start in test mode"** seçin
5. **"Enable"** tıklayın

## 🔧 Adım 4: Web App Ekleme

1. Project Overview sayfasında **Web ikonu** (`</>`) tıklayın
2. **App nickname**: `GTU Medya Player`
3. **Firebase Hosting**: ✅ (önerilen)
4. **"Register app"** tıklayın

## 📋 Adım 5: Config Kodunu Alma

Firebase size bir config objesi verecek, şuna benzer:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyAbC123...",
  authDomain: "gtu-medya-oynatici.firebaseapp.com",
  databaseURL: "https://gtu-medya-oynatici-rtdb.firebaseio.com",
  projectId: "gtu-medya-oynatici",
  storageBucket: "gtu-medya-oynatici.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123..."
};
```

## 🔄 Adım 6: Config Dosyasını Güncelleme

1. Projenizde `config.js` dosyasını açın
2. `firebaseConfig` objesini yukarıdaki config ile değiştirin:

```javascript
// config.js dosyasında
const firebaseConfig = {
    // Yukarıda aldığınız config'i buraya yapıştırın
    apiKey: "AIzaSyAbC123...",
    authDomain: "gtu-medya-oynatici.firebaseapp.com",
    databaseURL: "https://gtu-medya-oynatici-rtdb.firebaseio.com",
    projectId: "gtu-medya-oynatici",
    storageBucket: "gtu-medya-oynatici.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abc123..."
};

// Bu satırı da config ile değiştirin
const config = firebaseConfig; // workingFirebaseConfig yerine
```

## 🔒 Adım 7: Güvenlik Kuralları (Önemli!)

1. Realtime Database > **"Rules"** sekmesine gidin
2. Aşağıdaki kuralları yapıştırın:

```json
{
  "rules": {
    "activeUsers": {
      ".read": true,
      ".write": true,
      "$userId": {
        ".validate": "newData.hasChildren(['username', 'joinedAt', 'lastSeen'])"
      }
    },
    "messages": {
      ".read": true,
      ".write": true,
      ".indexOn": "timestamp",
      "$messageId": {
        ".validate": "newData.hasChildren(['author', 'content', 'timestamp', 'sessionId']) && newData.child('content').val().length <= 500"
      }
    }
  }
}
```

3. **"Publish"** butonuna tıklayın

## 🧪 Adım 8: Test Etme

1. Projenizi açın (`index.html`)
2. Browser Console'u açın (F12)
3. Şu mesajları görmelisiniz:
   ```
   🔥 Firebase başarıyla başlatıldı!
   ✅ Firebase Database bağlantısı aktif!
   ```

## 📊 Adım 9: Database'i İzleme

Firebase Console'da Realtime Database'i açık tutarak:
1. Kullanıcılar giriş yaptıkça `activeUsers` node'unu görebilirsiniz
2. Chat mesajları `messages` node'unda toplanır
3. Real-time olarak değişiklikleri izleyebilirsiniz

## 🚨 Yaygın Sorunlar ve Çözümleri

### ❌ "Permission denied" hatası
- **Çözüm**: Güvenlik kurallarını kontrol edin, yukarıdaki kuralları kullanın

### ❌ "Database URL not found"
- **Çözüm**: `databaseURL` field'ının doğru olduğundan emin olun

### ❌ "Network error"
- **Çözüm**: Internet bağlantınızı kontrol edin, Firebase project'in aktif olduğundan emin olun

### ❌ Chat mesajları görünmüyor
- **Çözüm**: Browser Console'da hata mesajlarını kontrol edin, config'i kontrol edin

## 💡 Pro İpuçları

1. **Backup**: Database'i düzenli olarak export edin
2. **Monitoring**: Firebase Analytics kullanın
3. **Security**: Production'da daha sıkı güvenlik kuralları kullanın
4. **Performance**: Database queries'i optimize edin

## 🆘 Destek

Sorun yaşıyorsanız:
1. Browser Console'da hataları kontrol edin
2. Firebase Console'da Database Rules'u kontrol edin
3. Config dosyasındaki tüm field'ların dolu olduğundan emin olun

---

✅ **Bu rehberi tamamladıktan sonra chat sistemi ve online kullanıcı sayısı tam olarak çalışacaktır!**