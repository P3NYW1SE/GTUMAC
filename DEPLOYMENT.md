# 🚀 Deployment Guide

Bu projeyi online yayınlamak için 3 kolay seçenek:

## ⚡ Seçenek 1: Vercel (En Kolay - Önerilen)

### Adımlar:
1. **GitHub'a yükle** projeyi
2. **[vercel.com](https://vercel.com)** → "Import Git Repository"
3. **GitHub hesabını bağla**
4. **Projeyi seç** → Otomatik detect eder
5. **Environment Variables ekle:**
   ```
   VITE_API_URL=https://your-project.vercel.app
   JWT_SECRET=your-secret-key
   ADMIN_EMAILS=admin@gtu.edu.tr
   ```
6. **Deploy** → 2 dakikada hazır! 🎉

### Vercel Avantajları:
- ✅ Full-stack support (Frontend + Backend)
- ✅ Otomatik HTTPS
- ✅ Git ile senkron (commit atınca otomatik deploy)
- ✅ Serverless functions

---

## 🚆 Seçenek 2: Railway

### Adımlar:
1. **[railway.app](https://railway.app)** → Sign up with GitHub
2. **"Deploy from GitHub Repo"**
3. **Projeyi seç** → Otomatik detect eder
4. **Environment Variables:**
   ```
   NODE_ENV=production
   JWT_SECRET=your-secret-key
   ADMIN_EMAILS=admin@gtu.edu.tr
   ```
5. **Deploy** → Çok kolay! 🚀

---

## 📄 Seçenek 3: GitHub Pages (Sadece Frontend)

⚠️ **Not:** Bu seçenek sadece frontend'i deploy eder, backend için ayrı hosting gerekir.

### Adımlar:
1. **GitHub repo settings** → Pages
2. **Source:** GitHub Actions seç
3. **Commit at** → Otomatik deploy olur
4. **Frontend URL:** `https://username.github.io/repo-name`

### Backend için ayrıca:
- Railway/Vercel'de backend deploy et
- `.env` file'da VITE_API_URL'yi güncelle

---

## 🔧 Production Environment Variables

### Frontend (.env):
```
VITE_API_URL=https://your-backend-url.com
VITE_HLS_URL=https://playerch2t24.pages.dev/ch?id=yayin1
```

### Backend (.env):
```
NODE_ENV=production
PORT=4000
JWT_SECRET=your-super-secret-key-change-this
ADMIN_EMAILS=admin1@gtu.edu.tr,admin2@gtu.edu.tr
CLIENT_ORIGIN=https://your-frontend-url.com
DEFAULT_HLS_URL=https://playerch2t24.pages.dev/ch?id=yayin1
```

---

## 🎯 Önerilen: Vercel

En kolay ve güvenilir seçenek **Vercel**. Hem frontend hem backend bir arada, otomatik deploy, HTTPS, domain custom edilebilir.

**5 dakikada live!** 🚀