# 🎬 GTU Medya Oynatıcı

Modern ve şık tasarımlı, canlı chat özellikli medya oynatıcı uygulaması.

## 🚀 Özellikler

- ✨ Modern ve responsive tasarım
- 🎥 Gömülü video oynatıcı
- 💬 Gerçek zamanlı chat sistemi
- 👥 Canlı kullanıcı sayısı
- 🔥 Firebase Realtime Database entegrasyonu
- 📱 Mobil uyumlu
- ⚡ Hızlı ve performanslı

## 📁 Dosya Yapısı

```
├── index.html      # Ana HTML dosyası
├── style.css       # CSS stilleri
├── script.js       # JavaScript kodları
├── config.js       # Firebase konfigürasyonu
└── README.md       # Bu dosya
```

## 🔧 Kurulum

### 1. Firebase Projesi Oluşturma

1. [Firebase Console](https://console.firebase.google.com)'a gidin
2. "Create a project" tıklayın
3. Proje adını girin (örn: "gtu-medya-oynatici")
4. Analytics'i etkinleştirin (opsiyonel)
5. Projeyi oluşturun

### 2. Realtime Database Kurulumu

1. Sol menüden "Build" > "Realtime Database" seçin
2. "Create Database" tıklayın
3. Güvenlik kuralları için "Start in test mode" seçin
4. Lokasyon seçin (Europe recommended)

### 3. Web App Ekleme

1. Project Overview'den "Web" ikonuna tıklayın
2. App nickname girin
3. Firebase Hosting'i etkinleştirin (opsiyonel)
4. "Register app" tıklayın
5. Config kodunu kopyalayın

### 4. Config Dosyasını Güncelleme

`config.js` dosyasını açın ve `firebaseConfig` objesini kendi config'inizle değiştirin:

```javascript
const firebaseConfig = {
    apiKey: "your-api-key",
    authDomain: "your-project.firebaseapp.com",
    databaseURL: "https://your-project-rtdb.firebaseio.com",
    projectId: "your-project",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "your-app-id"
};
```

### 5. Güvenlik Kuralları (Opsiyonel)

Realtime Database > Rules bölümünden güvenlik kurallarını güncelleyebilirsiniz:

```json
{
  "rules": {
    "activeUsers": {
      ".read": true,
      ".write": true
    },
    "messages": {
      ".read": true,
      ".write": true,
      ".indexOn": "timestamp"
    }
  }
}
```

## 🌐 Deployment

### GitHub Pages
1. Dosyaları GitHub repo'nuzda yayınlayın
2. Settings > Pages'den GitHub Pages'i etkinleştirin
3. Source olarak "Deploy from a branch" seçin
4. Branch'i "main" yapın

### Netlify
1. Dosyaları bir klasörde toplayın
2. [Netlify](https://netlify.com)'ye sürükleyip bırakın
3. Otomatik deploy olur

### Vercel
1. [Vercel](https://vercel.com)'e GitHub repo'nuzu bağlayın
2. Otomatik deploy edilir

## 🎮 Kullanım

1. Sayfayı açın
2. Kullanıcı adınızı girin
3. "Giriş Yap" tıklayın
4. Video oynatıcıyı başlatın
5. Chat'de diğer kullanıcılarla iletişim kurun

## ⌨️ Klavye Kısayolları

- `Space` / `Enter`: Video oynatıcıyı başlat
- `R`: Video oynatıcıyı yeniden yükle  
- `C`: Chat input'a odaklan (giriş yaptıktan sonra)

## 🔍 Sorun Giderme

### Chat Çalışmıyor
- Firebase config'inizi kontrol edin
- Realtime Database'in etkin olduğundan emin olun
- Browser console'da hata mesajlarını kontrol edin

### Online Kullanıcı Sayısı Görünmüyor
- Firebase bağlantısını kontrol edin
- Internet bağlantınızı kontrol edin

### Video Yüklenmiyor
- Player URL'sinin çalıştığından emin olun
- Adblocker'ınızı devre dışı bırakın

## 🛠️ Geliştirme

### Yerel Geliştirme
```bash
# Basit HTTP server başlatma
python -m http.server 8000
# veya
npx serve .
```

### Özelleştirme
- `style.css`: Renkleri ve stilleri değiştirin
- `script.js`: Yeni özellikler ekleyin
- `index.html`: Yapıyı değiştirin

## 📱 Responsive Tasarım

Uygulama tüm cihazlarda çalışacak şekilde tasarlanmıştır:
- 📱 Mobil (768px altı)
- 📟 Tablet (768px - 1024px)
- 💻 Desktop (1024px üzeri)

## 🎨 Renk Paleti

```css
--primary-dark: #0a0a0a
--secondary-dark: #1a1a1a
--gtu-blue: #1e3a8a
--gtu-light-blue: #3b82f6
--success-green: #10b981
--text-light: #f8fafc
--text-gray: #94a3b8
```

## 📄 Lisans

Bu proje eğitim amaçlı olarak geliştirilmiştir.

## 👨‍💻 Geliştirici

**EMREÇALIŞKAN** - Gebze Teknik Üniversitesi

---

⭐ **Beğendiyseniz yıldız vermeyi unutmayın!**