import { useEffect, useState } from 'react'
import { API_BASE_URL } from '../config'

type Room = { id: string; title: string; hlsUrl?: string }

export default function Admin() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [id, setId] = useState('')
  const [title, setTitle] = useState('')
  const [hlsUrl, setHlsUrl] = useState('')
  const token = localStorage.getItem('token')

  async function load() {
    const r = await fetch(`${API_BASE_URL}/rooms`).then(r=>r.json())
    setRooms(r)
  }

  useEffect(()=>{ load() }, [])

  async function saveRoom(e: React.FormEvent) {
    e.preventDefault()
    if (!token) return
    const res = await fetch(`${API_BASE_URL}/rooms`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ id, title, hlsUrl })
    })
    if (res.ok) {
      setId(''); setTitle(''); setHlsUrl('');
      await load()
    } else {
      alert('Kaydetme başarısız (admin gerekli olabilir)')
    }
  }

  async function removeRoom(roomId: string) {
    if (!token) return
    if (!confirm('Odayı silmek istediğine emin misin?')) return
    const res = await fetch(`${API_BASE_URL}/rooms/${roomId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
    if (res.ok) await load()
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-2">🎛️ Admin Paneli</h1>
        <p className="text-white/70">Oda ve yayın ayarlarını yönetin</p>
      </div>

      {/* Room Creation Form */}
      <div className="max-w-2xl mx-auto">
        <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-2xl">
          <h2 className="text-xl font-semibold mb-4 text-white flex items-center gap-2">
            <span>📝</span> Oda Oluştur / Güncelle
          </h2>
          <form onSubmit={saveRoom} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Oda ID</label>
              <input 
                className="w-full p-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/60 focus:border-white/40 focus:outline-none transition-all" 
                placeholder="ör. gtu-derby" 
                value={id} 
                onChange={e=>setId(e.target.value)} 
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Oda Başlığı</label>
              <input 
                className="w-full p-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/60 focus:border-white/40 focus:outline-none transition-all" 
                placeholder="ör. Fenerbahçe vs Galatasaray" 
                value={title} 
                onChange={e=>setTitle(e.target.value)} 
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Yayın URL</label>
              <input 
                className="w-full p-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/60 focus:border-white/40 focus:outline-none transition-all" 
                placeholder="https://playerch2t24.pages.dev/ch?id=yayin1" 
                value={hlsUrl} 
                onChange={e=>setHlsUrl(e.target.value)} 
              />
              <p className="text-xs text-white/60 mt-1">💡 Yayın URL'sini buraya yapıştırın</p>
            </div>
            <button className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 py-3 rounded-xl text-white font-medium transition-all duration-300 hover:scale-[1.02] shadow-lg">
              ✅ Kaydet
            </button>
          </form>
        </div>
      </div>

      {/* Rooms List */}
      <div>
        <h3 className="text-2xl font-semibold mb-6 text-white text-center flex items-center justify-center gap-2">
          <span>🏠</span> Mevcut Odalar
        </h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map(r => (
            <div key={r.id} className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-xl p-5 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
              <div className="font-bold text-white text-lg mb-2">{r.title}</div>
              <div className="text-sm text-white/60 mb-1">🆔 {r.id}</div>
              {'hlsUrl' in r && (r as any).hlsUrl && (
                <div className="text-xs text-white/50 break-all bg-black/20 p-2 rounded-lg mt-2 font-mono">
                  {(r as any).hlsUrl.length > 50 
                    ? (r as any).hlsUrl.substring(0, 50) + '...'
                    : (r as any).hlsUrl
                  }
                </div>
              )}
              <div className="mt-4 flex gap-2">
                <button 
                  onClick={()=>{ setId(r.id); setTitle(r.title); setHlsUrl((r as any).hlsUrl || '') }} 
                  className="flex-1 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-all"
                >
                  ✏️ Düzenle
                </button>
                <button 
                  onClick={()=>removeRoom(r.id)} 
                  className="flex-1 px-3 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm font-medium transition-all"
                >
                  🗑️ Sil
                </button>
              </div>
            </div>
          ))}
          {rooms.length === 0 && (
            <div className="col-span-full text-center py-12">
              <div className="text-4xl mb-3">📭</div>
              <p className="text-white/60">Henüz oda bulunmuyor. İlk odayı oluşturun!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}