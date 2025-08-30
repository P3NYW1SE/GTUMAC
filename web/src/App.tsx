import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'

export default function App() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'))
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [department, setDepartment] = useState('')
  const [classYear, setClassYear] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    if (token) localStorage.setItem('token', token)
  }, [token])

  async function login(e: React.FormEvent) {
    e.preventDefault()
    const res = await fetch('http://localhost:4000/auth/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name, department, classYear })
    })
    if (res.ok) {
      const data = await res.json()
      setToken(data.token)
      navigate('/')
    } else {
      alert('Giriş başarısız. Sadece @gtu.edu.tr izinli.')
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen grid place-items-center p-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-zinc-900 to-black">
        <form onSubmit={login} className="w-full max-w-md space-y-4 bg-zinc-900/70 backdrop-blur p-6 rounded-xl border border-zinc-800">
          <div className="flex items-center gap-3">
            <img src="/gtu-logo.svg" alt="GTU" className="h-8" />
            <h1 className="text-xl font-semibold">GTÜ Canlı — Giriş</h1>
          </div>
          <input className="w-full p-2 rounded bg-zinc-800 border border-zinc-700" placeholder="Ad Soyad" value={name} onChange={e=>setName(e.target.value)} required />
          <input className="w-full p-2 rounded bg-zinc-800 border border-zinc-700" placeholder="E-posta (@gtu.edu.tr)" value={email} onChange={e=>setEmail(e.target.value)} required />
          <div className="grid grid-cols-2 gap-2">
            <input className="p-2 rounded bg-zinc-800 border border-zinc-700" placeholder="Bölüm" value={department} onChange={e=>setDepartment(e.target.value)} />
            <input className="p-2 rounded bg-zinc-800 border border-zinc-700" placeholder="Sınıf" value={classYear} onChange={e=>setClassYear(e.target.value)} />
          </div>
          <button className="w-full bg-indigo-600 hover:bg-indigo-500 py-2 rounded">Giriş</button>
        </form>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 bg-zinc-950/70 backdrop-blur border-b border-zinc-800">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-4">
          <Link to="/" className="font-semibold flex items-center gap-2">
            <img src="/gtu-logo.svg" alt="GTU" className="h-6" />
            <span>GTÜ Canlı</span>
          </Link>
          <nav className="text-sm ml-4 flex items-center gap-3">
            <Link to="/" className="opacity-80 hover:opacity-100">Maçlar</Link>
            <Link to="/profile" className="opacity-80 hover:opacity-100">Profil</Link>
            <Link to="/admin" className="opacity-80 hover:opacity-100">Admin</Link>
          </nav>
          <div className="ml-auto text-sm">
            <button onClick={()=>{ localStorage.removeItem('token'); window.location.href='/' }} className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700">Çıkış</button>
          </div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}