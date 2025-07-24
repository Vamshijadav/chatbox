const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const mysql = require('mysql2');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

// MySQL Connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Vamshi@11',        // your MySQL password here
  database: 'chatapp'
});

db.connect((err) => {
  if (err) throw err;
  console.log('✅ Connected to MySQL');
});

// Fetch messages
app.get('/messages', (req, res) => {
  db.query('SELECT * FROM messages ORDER BY timestamp ASC', (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

// Socket handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('send_message', (data) => {
    const { sender, message } = data;
    db.query('INSERT INTO messages (sender, message) VALUES (?, ?)', [sender, message]);
    io.emit('receive_message', { sender, message, timestamp: new Date() });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

server.listen(3001, () => {
  console.log('🚀 Backend running at http://localhost:3001');
});
