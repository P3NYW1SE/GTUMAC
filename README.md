# GTÜ Canlı Maç Platformu (İskelet)

## Proje Yapısı
- **server/**: Node.js + Express + Socket.IO (TypeScript). E-posta ile giriş (yalnızca @gtu.edu.tr), oda listesi, senkron video durumları, chat, reaksiyon ve WebRTC sinyalleşme iskeleti.
- **web/**: React + Vite + TailwindCSS (koyu tema). Ana sayfa oda listesi, oda sayfasında HLS player, chat, reaksiyon butonları.

## Çalıştırma (Geliştirme)
1. Sunucu
   - Klasör: `server`
   - `cp .env.example .env` düzenleyin.
   - `npm i`
   - `npm run dev`
2. İstemci
   - Klasör: `web`
   - `cp .env.example .env` düzenleyin (HLS URL). 
   - `npm i`
   - `npm run dev`

Varsayılan adresler: API `http://localhost:4000`, Web `http://localhost:5173`.

## Özellikler (İskelet)
- Giriş: `POST /auth/login` — sadece `@gtu.edu.tr` uzantısı kabul edilir. JWT döner.
- Oda listesi: `GET /rooms`
- Oda içinde gerçek zamanlılar:
  - `room:join`, `room:leave`
  - `chat:message`
  - `reaction`
  - `video:state` (yayından gelen), `video:control` (sadece admin)
  - Sesli sohbet için `voice:*` sinyalleşme olayları (P2P mesh iskeleti)

## Notlar
- Video senkronizasyonu: Sunucu tek bir `position + updatedAt + isPlaying` durumu tutar. Katılanlar bu duruma göre otomatik senkronize olur.
- Play/Pause/Seek kontrolü sadece admin token'ı olanlarda açıktır (örnek: `ADMIN_EMAILS`).
- Sesli sohbet şu an sinyalleşme iskeleti içerir; tarafa özel `RTCPeerConnection` kurulumu eklenmelidir.
- Üyeler/profiller/kalıcı veriler için bir veritabanı (ör. Prisma + SQLite/Postgres) eklenebilir.