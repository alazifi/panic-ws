const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { WebSocketServer } = require('ws');

// Inisialisasi aplikasi
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Data default yang disimpan di memori
let data = {
  id: "id",
  name: "Default name",
  addr: "Default Address",
  loc: "Default Address",
};

// GET Endpoint
app.get('/api/data', (req, res) => {
  res.json(data);
});

// POST Endpoint
app.post('/api/data', (req, res) => {
  const { id, name, addr, loc } = req.body;

  // Validasi input dan update data
  if (id) data.id = id;
  if (name) data.name = name;
  if (addr) data.addr = addr;
  if (loc) data.loc = loc;

  // Broadcast ke semua klien WebSocket
  broadcast(JSON.stringify({ event: 'update', data }));

  res.json({
    message: "Data updated successfully",
    data
  });
});

// Jalankan server HTTP
const server = app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

// WebSocket Server
const wss = new WebSocketServer({ server });

// Fungsi untuk broadcast pesan ke semua klien
function broadcast(message) {
  wss.clients.forEach(client => {
    if (client.readyState === client.OPEN) {
      client.send(message);
    }
  });
}

// Handling koneksi WebSocket
wss.on('connection', (ws) => {
  console.log('New WebSocket connection');

  // Kirim data awal ke klien
  ws.send(JSON.stringify({ event: 'init', data }));

  // Tangani pesan dari klien jika diperlukan
  ws.on('message', (message) => {
    console.log(`Received from client: ${message}`);
  });

  // Tangani jika klien terputus
  ws.on('close', () => {
    console.log('WebSocket client disconnected');
  });
});
