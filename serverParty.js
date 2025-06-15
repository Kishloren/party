// serverParty.js (anciennement app.js)
require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const path = require('path');

const apiRoutes = require('./routes/api');
const { initSocketHandlers } = require('./socket/gameHandlers');

const isProd = process.env.ENV === 'PROD';
const app = express();
const server = http.createServer(app);
const io = new Server(server, isProd ? {
  path: "/party/socket.io",
  cors: {
    origin: "https://www.stansgames.fr",
    methods: ["GET", "POST"],
    credentials: true
  }
} : {});

if (isProd) {
  app.use(cors({
    origin: "https://www.stansgames.fr",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
  }));
}

app.use(express.json());
app.use(express.static('public'));
app.use('/api', apiRoutes);

// Initialisation des sockets
initSocketHandlers(io);

// Lancement du serveur
const PORT = 7780;
server.listen(PORT, () => {
  console.log(`Server listening on *:${PORT}`);
});
