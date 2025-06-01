const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { sqlSelect, sqlExec } = require('/home/ubuntu/shared/common.js');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  path: "/party/socket.io",  // <== Important
  cors: {
    origin: "https://www.stansgames.fr",
    methods: ["GET", "POST"],
    credentials: true
  }
});
const appId = 3; // partie de Stan's Party
const serverData = {};
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Middleware to parse JSON bodies
app.use(express.json());

// Enable CORS for all routes
app.use(cors({
  origin: "https://www.stansgames.fr",
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

// Serve static files
app.use(express.static('public'));


// API endpoint to execute a SQL SELECT query
app.get('/api/select', async (req, res) => {
  try {
    const query = req.query.query;
    const results = await sqlSelect(query);
    res.json(results);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

// API endpoint to execute a SQL command
app.post('/api/exec', async (req, res) => {
  try {
    const { query } = req.body;
    await sqlExec(query);
    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

// lancement d'une nouvelle partie, au démarrage du serveur


server.listen(7780, () => {
  console.log('listening on *:7780');
});

serverData.uuidPartieCourante = uuidv4();
serverData.joueurs = [];
(async () => {
    try {
        await sqlExec ("UPDATE apps SET partieencours = '" + serverData.uuidPartieCourante + "' WHERE idApp = " + appId);
        console.log('Id de la partie : ' + serverData.uuidPartieCourante);
    } catch(err) {
        console.error('Erreur SQL : ' , err);
    }
})();

io.on('connection', (socket) => {
  console.log(`[WS] New client connected: ${socket.id}`);

  socket.onAny((event, ...args) => {
    console.log(`[WS] Event received: ${event}`, args);
  });

  socket.on('disconnect', (reason) => {
    console.log(`[WS] Client disconnected: ${socket.id}`, reason);
  });

  socket.on('playerConnection', (id) => {
    console.log('Player connected with ID:', id);
    // Handle player connection logic here
  });

  // Add more socket.io event handlers as needed
  socket.on('message', (msg) => {
    console.log('Received message:', msg);
    io.emit('message', msg);
  });
  
    socket.on('loginDemandeConnexion', (data) => {
        (async () => {
            try {
                const query = "SELECT * FROM joueurs WHERE pseudo = '" + data.pseudo + "'";
                const results = await sqlSelect(query);
                let pwd = crypto.createHash('sha256').update(data.pwd).digest('hex');

                if(results.length == 0) {
                    // création d'un nouveau joueur
                    let id = uuidv4();
                    let query = "INSERT INTO joueurs (id, pseudo, pwd) VALUES ('" + id + "','" + data.pseudo + "','" + pwd + "')";
                    (async () => {
                        try {
                            await sqlExec (query);
                            console.log('joueur créé');
                            socket.emit('serverConnexionOK', id);
                        } catch(err) {
                            console.error('Erreur SQL : ' , err);
                        }
                    })();

                } else {
                    if(results[0].pwd==pwd) {
                        // joueur trouvé
                        console.log('joueur trouvé');
                        socket.emit('serverConnexionOK', results[0].id);
                        
                    } else {
                        // mauvais pwd
                        socket.emit('serverConnexionNOK');
                    }
                }


            } catch (err) {
                console.error('Error executing query:', err);
            } 
        })();        
    });

    socket.on('playerConnexion', (joueurId) => {
    console.log('toto');
        // est-ce que le joueur est déja dans la partie (reconnexion) ?
        (async () => {
            try {
                const query = "SELECT * FROM parties WHERE idjoueur = '" + joueurId + "' AND idapp = " + appId + "  AND dernierepartie = '" + serverData.uuidPartieCourante +"'";
                const results = await sqlSelect(query);
                if(results.length == 0) {
                    // pas de partie en cours, ajout du joueur
                    ajouterJoueur(joueurId);
                } else {
                    // récupération des données et envoi au joueur
                    reconnecterJoueur(joueurId);
                }
            } catch (err) {
                console.error('Error executing query:', err);
            } 
        })();
    });

    socket.on('playerUpdateData', (data) => {
        (async () => { 
            try {
                const query = "UPDATE joueurs SET avatar  = '" + JSON.stringify(data.avatar) + "' WHERE id = '" + data.id + "'";
                await sqlExec(query);
            } catch (err) {
                console.error('Error executing query:', err);
            } 
        })();
        getById(serverData.joueurs, data.id).avatar = data.avatar;
    });

    socket.on('animationEtatServeur', () => {
        console.log(JSON.stringify(serverData));
    });
}); 
 
 

function ajouterJoueur(joueurId) {

    (async () => {
        try {
            const query = "SELECT * FROM joueurs WHERE id = '" + joueurId + "'";
            const results = await sqlSelect(query);

            const nouveauJoueur = {};
            nouveauJoueur.id = joueurId;
            nouveauJoueur.pseudo = results[0].pseudo;
            nouveauJoueur.avatar = JSON.parse(results[0].avatar);
            nouveauJoueur.score = 0;
            nouveauJoueur.tempsCumule = 0;
            nouveauJoueur.ping = 0;

            serverData.joueurs.push(nouveauJoueur);

            (async () => {
                try {
                    let query = "DELETE FROM parties WHERE idJoueur = '" + joueurId + "' AND idapp=" + appId;
                    await sqlExec(query);
                    query = "INSERT INTO parties (idjoueur, idapp, dernierepartie, jsondata)";
                    query += " VALUES('" + joueurId + "'," + appId + ",'" + serverData.uuidPartieCourante + "','" + JSON.stringify(nouveauJoueur) + "')";
                    await sqlExec(query);
                    console.log("Joueur ajouté : " + joueurId);
                    io.emit('serverDonneesJoueur', nouveauJoueur);
                } catch (err) {
                    console.error('Error executing query:', err);
                } 
                })();

        } catch (err) {
            console.error('Error executing query:', err);
        } 
     })();

}

function reconnecterJoueur(id) {
     for(j of serverData.joueurs) {
        if(j.id == id) {
            io.emit('serverDonneesJoueur', j);
        }
     }
}


function getById(tab, id) {
    for(item of tab) {
        if(item.id == id) {
            return item;
        }
    }
    return null;
}

