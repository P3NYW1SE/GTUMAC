import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { API_BASE_URL } from '../config'
import { motion, AnimatePresence } from 'framer-motion'

type Room = { id: string; title: string; viewers: number; isPlaying: boolean }

export default function Home() {
  const [rooms, setRooms] = useState<Room[]>([])

  useEffect(() => {
    fetch(`${API_BASE_URL}/rooms`).then(r=>r.json()).then(setRooms)
  }, [])

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Canlı Maçlar</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {rooms.map((r, i) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25, delay: i * 0.05 }}
            >
              <Link to={`/room/${r.id}`} className="block p-4 rounded bg-zinc-800 hover:bg-zinc-700 transition">
                <div className="font-medium">{r.title}</div>
                <div className="text-sm opacity-70 mt-1">İzleyici: {r.viewers}</div>
                <div className="text-xs mt-2">Durum: {r.isPlaying ? 'Canlı' : 'Bekliyor'}</div>
              </Link>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}