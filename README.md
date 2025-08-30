# 🎥 GTÜ Canlı Yayın Platformu

Modern, gerçek zamanlı canlı yayın izleme platformu. React + Node.js + Socket.IO ile yapılmış.

## ✨ Özellikler

- 🔐 **GTU Email ile Giriş** - Sadece @gtu.edu.tr uzantılı emailler
- 📺 **Canlı Yayın İzleme** - iframe ve HLS desteği  
- 💬 **Gerçek Zamanlı Chat** - Anlık mesajlaşma
- ⚡ **Tepki Sistemi** - Emoji tepkiler
- 👥 **Katılımcı Listesi** - Kim online görebilme
- 🔧 **Admin Paneli** - Oda oluşturma/düzenleme
- 📱 **Responsive Tasarım** - Mobile uyumlu

## 🚀 Quick Start

### Geliştirme
```bash
# Backend
cd server && npm install && npm run dev

# Frontend (yeni terminal)
cd web && npm install && npm run dev
```

**URL'ler:** Backend `http://localhost:4000` | Frontend `http://localhost:5173`

### Production Deploy
En kolay yöntem **Vercel**:
1. GitHub'a yükle
2. [vercel.com](https://vercel.com) → Import Repository
3. 2 dakikada live! 🎉

Detaylı deployment guide: **[DEPLOYMENT.md](./DEPLOYMENT.md)**

## 📁 Proje Yapısı

```
├── web/          # React Frontend (Vite + TypeScript + TailwindCSS)
├── server/       # Node.js Backend (Express + Socket.IO + TypeScript)
├── .github/      # GitHub Actions (otomatik deploy)
└── docs/         # Deployment guides
```

## 🛠 Tech Stack

**Frontend:**
- React 18 + TypeScript + Vite
- TailwindCSS + Framer Motion
- Socket.IO Client
- React Router

**Backend:**
- Node.js + TypeScript + Express
- Socket.IO (realtime)
- JWT Authentication
- Zod (validation)

## 📱 Kullanım

1. **Giriş:** GTU emailin ile giriş yap
2. **Admin:** Oda oluştur, URL ekle
3. **İzleyici:** Odaya gir, yayını izle, chat'te konuş
4. **Tepki:** Emoji ile tepki ver

## 🔧 Environment Variables

**Backend (.env):**
```env
JWT_SECRET=your-secret-key
ADMIN_EMAILS=admin@gtu.edu.tr
CLIENT_ORIGIN=http://localhost:5173
```

**Frontend (.env):**
```env
VITE_API_URL=http://localhost:4000
```

---

### 🎯 **Online Demo:** [Yakında...]

Made with ❤️ by **GTU Students**