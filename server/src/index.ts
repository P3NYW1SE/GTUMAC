import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import http from 'http';
import jwt from 'jsonwebtoken';
import { Server } from 'socket.io';
import { z } from 'zod';

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';
const DEFAULT_HLS_URL = process.env.DEFAULT_HLS_URL || '';
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean);

const app = express();
app.use(cors({ origin: CLIENT_ORIGIN, credentials: true }));
app.use(express.json());

// In-memory stores for skeleton purposes
type User = { id: string; email: string; name: string; department?: string; classYear?: string; isAdmin?: boolean };
const users = new Map<string, User>(); // id -> user

// Minimal match/room model
type RoomState = {
  id: string;
  title: string;
  hlsUrl: string;
  isPlaying: boolean;
  position: number; // seconds
  updatedAt: number; // epoch ms when position was last set
  viewers: Set<string>; // socket ids
};

const rooms = new Map<string, RoomState>();
// Presence tracking: roomId -> (socketId -> minimal user)
const roomMembers = new Map<string, Map<string, { id: string; name: string }>>();

// Seed with a couple of demo matches
['fb-vs-gs', 'gtu-derby'].forEach((id, idx) => {
  rooms.set(id, {
    id,
    title: idx === 0 ? 'Fenerbahçe vs Galatasaray' : 'GTÜ Interfaculty Derby',
    hlsUrl: DEFAULT_HLS_URL,
    isPlaying: false,
    position: 0,
    updatedAt: Date.now(),
    viewers: new Set(),
  });
});

// --- Auth ---
const LoginBody = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  department: z.string().optional(),
  classYear: z.string().optional(),
});

// Profile update
app.put('/me', (req, res) => {
  try {
    const auth = req.headers.authorization?.split(' ')[1];
    if (!auth) return res.status(401).json({ error: 'No token' });
    const payload = jwt.verify(auth, JWT_SECRET) as any;
    const id = payload.sub as string;
    const user = users.get(id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const { name, department, classYear } = req.body || {};
    if (typeof name === 'string' && name.length >= 2) user.name = name;
    if (typeof department === 'string') user.department = department;
    if (typeof classYear === 'string') user.classYear = classYear;
    users.set(id, user);
    return res.json({ ok: true, user });
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
});

function isGtuEmail(email: string) {
  return email.toLowerCase().endsWith('@gtu.edu.tr');
}

app.post('/auth/login', (req, res) => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid payload' });
  const { email, name, department, classYear } = parsed.data;
  if (!isGtuEmail(email)) return res.status(403).json({ error: 'Only @gtu.edu.tr emails allowed' });

  const id = email.toLowerCase();
  const isAdmin = ADMIN_EMAILS.includes(id);
  const user: User = { id, email: id, name, department, classYear, isAdmin };
  users.set(id, user);
  const token = jwt.sign({ sub: id, name, isAdmin }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user });
});

// --- Rooms REST ---
app.get('/rooms', (_req, res) => {
  res.json(Array.from(rooms.values()).map(r => ({
    id: r.id,
    title: r.title,
    hlsUrl: r.hlsUrl,
    viewers: r.viewers.size,
    isPlaying: r.isPlaying,
  })));
});

// Presence list for a room
app.get('/rooms/:id/presence', (req, res) => {
  const members = roomMembers.get(req.params.id);
  res.json(members ? Array.from(members.values()) : []);
});

// Admin create/update room
app.post('/rooms', (req, res) => {
  const auth = req.headers.authorization?.split(' ')[1];
  if (!auth) return res.status(401).json({ error: 'No token' });
  try {
    const payload = jwt.verify(auth, JWT_SECRET) as any;
    if (!payload.isAdmin) return res.status(403).json({ error: 'Admin only' });
    const { id, title, hlsUrl } = req.body || {};
    if (!id || !title) return res.status(400).json({ error: 'id and title required' });
    const room: RoomState = rooms.get(id) || { id, title, hlsUrl: '', isPlaying: false, position: 0, updatedAt: Date.now(), viewers: new Set() };
    room.title = title;
    if (typeof hlsUrl === 'string') room.hlsUrl = hlsUrl;
    rooms.set(id, room);
    return res.json({ ok: true, room: { id: room.id, title: room.title, hlsUrl: room.hlsUrl } });
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
});

// Admin delete room
app.delete('/rooms/:id', (req, res) => {
  const auth = req.headers.authorization?.split(' ')[1];
  if (!auth) return res.status(401).json({ error: 'No token' });
  try {
    const payload = jwt.verify(auth, JWT_SECRET) as any;
    if (!payload.isAdmin) return res.status(403).json({ error: 'Admin only' });
    const id = req.params.id;
    const existed = rooms.delete(id);
    roomMembers.delete(id);
    return res.json({ ok: true, deleted: existed });
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
});

// Admin controls via REST (optional besides sockets)
app.post('/rooms/:id/control', (req, res) => {
  const auth = req.headers.authorization?.split(' ')[1];
  if (!auth) return res.status(401).json({ error: 'No token' });
  try {
    const payload = jwt.verify(auth, JWT_SECRET) as any;
    if (!payload.isAdmin) return res.status(403).json({ error: 'Admin only' });
    const room = rooms.get(req.params.id);
    if (!room) return res.status(404).json({ error: 'Room not found' });
    const { action, position } = req.body || {};
    if (action === 'play') {
      room.isPlaying = true;
      room.updatedAt = Date.now();
    } else if (action === 'pause') {
      room.isPlaying = false;
      room.position = currentPosition(room);
      room.updatedAt = Date.now();
    } else if (action === 'seek' && typeof position === 'number') {
      room.position = Math.max(0, position);
      room.updatedAt = Date.now();
    }
    io.to(room.id).emit('video:state', publicVideoState(room));
    return res.json(publicVideoState(room));
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
});

// --- HTTP server and Socket.IO ---
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: CLIENT_ORIGIN, credentials: true } });

type AuthedSocket = typeof io extends Server<infer T, any, any, any> ? any : any;

io.use((socket, next) => {
  try {
    const token = socket.handshake.auth?.token as string | undefined;
    if (!token) return next(new Error('No token'));
    const payload = jwt.verify(token, JWT_SECRET) as any;
    (socket as any).userId = payload.sub;
    (socket as any).isAdmin = !!payload.isAdmin;
    next();
  } catch (e) {
    next(new Error('Unauthorized'));
  }
});

function currentPosition(room: RoomState) {
  if (!room.isPlaying) return room.position;
  const delta = (Date.now() - room.updatedAt) / 1000;
  return Math.max(0, room.position + delta);
}

function publicVideoState(room: RoomState) {
  return { isPlaying: room.isPlaying, position: currentPosition(room), ts: Date.now() };
}

io.on('connection', (socket) => {
  const userId = (socket as any).userId as string;
  const user = users.get(userId);

  // Join room
  socket.on('room:join', (roomId: string, ack?: Function) => {
    const room = rooms.get(roomId);
    if (!room) return ack?.({ error: 'Room not found' });
    socket.join(roomId);
    room.viewers.add(socket.id);
    // presence add
    const userMin = { id: user?.id || (socket as any).userId, name: user?.name || 'Kullanıcı' };
    const map = roomMembers.get(roomId) || new Map<string, { id: string; name: string }>();
    map.set(socket.id, userMin);
    roomMembers.set(roomId, map);
    const membersArr = Array.from(map.values());
    io.to(roomId).emit('room:presence', membersArr);
    io.to(roomId).emit('room:stats', { viewers: room.viewers.size });
    ack?.({ ok: true, video: publicVideoState(room), hlsUrl: room.hlsUrl, presence: membersArr });
  });

  socket.on('room:leave', (roomId: string) => {
    const room = rooms.get(roomId);
    socket.leave(roomId);
    if (room) {
      room.viewers.delete(socket.id);
      const map = roomMembers.get(roomId);
      if (map) {
        map.delete(socket.id);
        io.to(roomId).emit('room:presence', Array.from(map.values()));
      }
      io.to(roomId).emit('room:stats', { viewers: room.viewers.size });
    }
  });

  socket.on('disconnect', () => {
    // remove from any viewer sets
    for (const room of rooms.values()) {
      if (room.viewers.delete(socket.id)) {
        io.to(room.id).emit('room:stats', { viewers: room.viewers.size });
      }
      const map = roomMembers.get(room.id);
      if (map && map.delete(socket.id)) {
        io.to(room.id).emit('room:presence', Array.from(map.values()));
      }
    }
  });

  // Chat
  socket.on('chat:message', (payload: { roomId: string; text: string }) => {
    if (!payload?.roomId || !payload?.text) return;
    io.to(payload.roomId).emit('chat:message', {
      user: { id: user?.id, name: user?.name },
      text: payload.text,
      at: Date.now(),
    });
  });

  // Reactions
  socket.on('reaction', (payload: { roomId: string; type: string }) => {
    if (!payload?.roomId || !payload?.type) return;
    io.to(payload.roomId).emit('reaction', {
      user: { id: user?.id, name: user?.name },
      type: payload.type,
      at: Date.now(),
    });
  });

  // Video control - admin only
  socket.on('video:control', (payload: { roomId: string; action: 'play'|'pause'|'seek'; position?: number }) => {
    const room = payload?.roomId ? rooms.get(payload.roomId) : undefined;
    if (!room) return;
    if (!(socket as any).isAdmin) return; // ignore non-admin
    if (payload.action === 'play') {
      room.isPlaying = true;
      room.updatedAt = Date.now();
    } else if (payload.action === 'pause') {
      room.isPlaying = false;
      room.position = currentPosition(room);
      room.updatedAt = Date.now();
    } else if (payload.action === 'seek' && typeof payload.position === 'number') {
      room.position = Math.max(0, payload.position);
      room.updatedAt = Date.now();
    }
    io.to(room.id).emit('video:state', publicVideoState(room));
  });

  // Voice (WebRTC signaling - mesh skeleton)
  socket.on('voice:ready', (roomId: string) => {
    socket.to(roomId).emit('voice:peer-join', { socketId: socket.id, user: { id: user?.id, name: user?.name } });
  });

  socket.on('voice:signal', (payload: { roomId: string; targetId: string; data: any }) => {
    socket.to(payload.targetId).emit('voice:signal', { fromId: socket.id, data: payload.data });
  });

  socket.on('voice:mic', (payload: { roomId: string; active: boolean }) => {
    socket.to(payload.roomId).emit('voice:mic', { socketId: socket.id, active: payload.active, user: { id: user?.id, name: user?.name } });
  });
});

server.listen(PORT, () => {
  console.log(`API + Realtime listening on http://localhost:${PORT}`);
});