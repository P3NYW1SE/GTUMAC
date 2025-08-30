import { useEffect, useRef, useState } from 'react'
import type { Socket } from 'socket.io-client'

type PeerInfo = {
  pc: RTCPeerConnection
  audioEl: HTMLAudioElement
  mic: boolean
  userName?: string
}

type Props = { socket: Socket | null, roomId?: string }

export default function VoiceChat({ socket, roomId }: Props) {
  const [micOn, setMicOn] = useState(false)
  const [peersState, setPeersState] = useState<Record<string, { mic: boolean; userName?: string }>>({})
  const localStreamRef = useRef<MediaStream | null>(null)
  const peersRef = useRef<Map<string, PeerInfo>>(new Map())

  // Notify ready
  useEffect(() => {
    if (!socket || !roomId) return
    socket.emit('voice:ready', roomId)
  }, [socket, roomId])

  // Socket listeners
  useEffect(() => {
    if (!socket) return

    const onPeerJoin = async (payload: { socketId: string; user?: { name?: string } }) => {
      await ensureLocalStream()
      const targetId = payload.socketId
      const pc = createPeer(targetId)
      if (localStreamRef.current) {
        for (const track of localStreamRef.current.getTracks()) pc.addTrack(track, localStreamRef.current)
      }
      const offer = await pc.createOffer()
      await pc.setLocalDescription(offer)
      socket.emit('voice:signal', { roomId, targetId, data: { sdp: offer } })
      setPeersState(s => ({ ...s, [targetId]: { ...(s[targetId]||{}), userName: payload.user?.name ?? 'Kullanıcı', mic: true } }))
    }

    const onSignal = async (payload: { fromId: string; data: any }) => {
      const fromId = payload.fromId
      const data = payload.data
      let peer = peersRef.current.get(fromId)
      if (!peer) {
        peer = createPeer(fromId)
      }
      if (data.sdp) {
        const desc = new RTCSessionDescription(data.sdp)
        await peer!.pc.setRemoteDescription(desc)
        if (desc.type === 'offer') {
          await ensureLocalStream()
          if (localStreamRef.current) {
            for (const track of localStreamRef.current.getTracks()) peer!.pc.addTrack(track, localStreamRef.current)
          }
          const answer = await peer!.pc.createAnswer()
          await peer!.pc.setLocalDescription(answer)
          socket.emit('voice:signal', { roomId, targetId: fromId, data: { sdp: answer } })
        }
      } else if (data.candidate) {
        try { await peer!.pc.addIceCandidate(data.candidate) } catch {}
      }
    }

    const onMic = (payload: { socketId: string; active: boolean; user?: { name?: string } }) => {
      setPeersState(s => ({ ...s, [payload.socketId]: { ...(s[payload.socketId]||{}), mic: payload.active, userName: payload.user?.name ?? s[payload.socketId]?.userName } }))
    }

    socket.on('voice:peer-join', onPeerJoin)
    socket.on('voice:signal', onSignal)
    socket.on('voice:mic', onMic)

    return () => {
      socket.off('voice:peer-join', onPeerJoin)
      socket.off('voice:signal', onSignal)
      socket.off('voice:mic', onMic)
    }
  }, [socket, roomId])

  function createPeer(id: string): PeerInfo {
    let existing = peersRef.current.get(id)
    if (existing) return existing
    const pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] })
    const audioEl = new Audio()
    audioEl.autoplay = true

    pc.onicecandidate = (e) => {
      if (e.candidate && socket) socket.emit('voice:signal', { roomId, targetId: id, data: { candidate: e.candidate } })
    }
    pc.ontrack = (e) => {
      audioEl.srcObject = e.streams[0]
    }
    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed' || pc.connectionState === 'closed') {
        cleanupPeer(id)
      }
    }

    const info: PeerInfo = { pc, audioEl, mic: true }
    peersRef.current.set(id, info)
    return info
  }

  function cleanupPeer(id: string) {
    const info = peersRef.current.get(id)
    if (info) {
      try { info.pc.close() } catch {}
      peersRef.current.delete(id)
      setPeersState(s => { const n = { ...s }; delete n[id]; return n })
    }
  }

  async function ensureLocalStream() {
    if (!localStreamRef.current) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        localStreamRef.current = stream
      } catch {
        // user denied mic
      }
    }
  }

  async function toggleMic() {
    if (!micOn) {
      await ensureLocalStream()
      if (!localStreamRef.current) return
      for (const [, p] of peersRef.current) {
        for (const track of localStreamRef.current.getTracks()) p.pc.addTrack(track, localStreamRef.current)
      }
      localStreamRef.current.getAudioTracks().forEach(t => t.enabled = true)
      setMicOn(true)
      socket?.emit('voice:mic', { roomId, active: true })
    } else {
      if (localStreamRef.current) {
        localStreamRef.current.getAudioTracks().forEach(t => t.enabled = false)
      }
      setMicOn(false)
      socket?.emit('voice:mic', { roomId, active: false })
    }
  }

  return (
    <div className="p-3 rounded bg-zinc-800 space-y-3">
      <div className="flex items-center justify-between">
        <div className="font-medium">Sesli Sohbet</div>
        <button onClick={toggleMic} className={`px-3 py-1 rounded ${micOn ? 'bg-green-600' : 'bg-zinc-700'}`}>{micOn ? 'Mikrofon Açık' : 'Mikrofon Kapalı'}</button>
      </div>
      <div className="space-y-1 text-sm">
        {Object.entries(peersState).map(([id, p]) => (
          <div key={id} className="flex items-center gap-2">
            <span className={`inline-block w-2 h-2 rounded-full ${p.mic ? 'bg-green-500' : 'bg-zinc-600'}`}></span>
            <span>{p.userName || 'Kullanıcı'}</span>
          </div>
        ))}
        {Object.keys(peersState).length === 0 && (
          <div className="opacity-60">Şu an konuşan yok.</div>
        )}
      </div>
    </div>
  )
}