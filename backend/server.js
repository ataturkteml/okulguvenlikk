require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const { initDb } = require('./config/database');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});
app.set('io', io);

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], allowedHeaders: ['Content-Type', 'Authorization'] }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Statik dosyalar
app.use('/student', express.static(path.join(__dirname, '..', 'frontend-student', 'public')));
app.use('/admin', express.static(path.join(__dirname, '..', 'frontend-admin', 'public')));

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/ogrenci', require('./routes/ogrenci'));
app.use('/api/admin', require('./routes/admin'));

// Yonlendirmeler
app.get('/', (req, res) => res.redirect('/student/index.html'));

// 404
app.use('/api/*', (req, res) => res.status(404).json({ success: false, message: 'Endpoint bulunamadi.' }));

// Hata yakalayici
app.use((err, req, res, next) => {
  console.error('Sunucu Hatasi:', err);
  res.status(500).json({ success: false, message: 'Sunucu hatasi olustu.' });
});

// WebSocket
io.on('connection', (socket) => {
  socket.on('join-admin', () => socket.join('admin-room'));
  socket.on('join-ogrenci', (id) => {
    socket.join(`ogrenci-${id}`);
    socket.join('ogrenci-room');
  });
});

// Baslatma (async - sql.js icin)
const PORT = process.env.PORT || 3001;

initDb().then(() => {
  server.listen(PORT, () => {
    console.log('');
    console.log('========================================');
    console.log('  OkulGiris Sistemi Basladi!');
    console.log('========================================');
    console.log('  Ogrenci : http://localhost:' + PORT + '/student/index.html');
    console.log('  Admin   : http://localhost:' + PORT + '/admin/index.html');
    console.log('========================================');
    console.log('  Admin Giris: admin / Admin2026!');
    console.log('  Demo Ogrenci: 2026001 / 123456');
    console.log('========================================');
    console.log('');
  });
}).catch(err => {
  console.error('Baslama hatasi:', err);
  process.exit(1);
});
