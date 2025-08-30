import { useEffect, useState } from 'react'

export default function Profile() {
  const [name, setName] = useState('')
  const [department, setDepartment] = useState('')
  const [classYear, setClassYear] = useState('')
  const token = localStorage.getItem('token')

  useEffect(() => {
    // In a real app we'd fetch current profile; for skeleton, fields are manual unless stored in token
  }, [])

  async function save(e: React.FormEvent) {
    e.preventDefault()
    if (!token) return
    await fetch('http://localhost:4000/me', {
      method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name, department, classYear })
    })
    alert('Profil güncellendi')
  }

  return (
    <div className="max-w-md space-y-3">
      <h2 className="text-xl font-semibold">Profil</h2>
      <form onSubmit={save} className="space-y-3">
        <input className="w-full p-2 rounded bg-zinc-800" placeholder="Ad Soyad" value={name} onChange={e=>setName(e.target.value)} />
        <input className="w-full p-2 rounded bg-zinc-800" placeholder="Bölüm" value={department} onChange={e=>setDepartment(e.target.value)} />
        <input className="w-full p-2 rounded bg-zinc-800" placeholder="Sınıf" value={classYear} onChange={e=>setClassYear(e.target.value)} />
        <button className="w-full bg-indigo-600 py-2 rounded">Kaydet</button>
      </form>
    </div>
  )
}