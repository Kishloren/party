require('dotenv').config();
const isProd = process.env.ENV === 'PROD';
const express = require('express');
const http = require('http');
const {Server} = require('socket.io');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');
const app = express();
const server = http.createServer(app);
console.log("IS PROD : " + isProd);
/* Bloc local */
const { sqlSelect, sqlExec } = isProd ? require('/home/ubuntu/shared/common.js') : require('../shared/common.js');
const io = isProd ? new Server(server, {
  path: "/party/socket.io",  // <== Important
  cors: {
    origin: "https://www.stansgames.fr",
    methods: ["GET", "POST"],
    credentials: true
  }
}) :  new Server(server);

if(isProd) {
    app.use(cors({
    origin: "https://www.stansgames.fr",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
    }));
}

const path = require('path');
const appId = 3; // partie de Stan's Party
const serverData = {};

const crypto = require('crypto');
app.use(express.json());


app.use(express.static('public'));

server.listen(7780, () => {
    console.log('listening on *:7780');
}); 

// API endpoint to execute a SQL SELECT query
app.get('/api/select', async (req, res) => {
  try {
    const query = req.query.query;
    console.log(query);
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
    const query = req.body.query;
    console.log(query);
    await sqlExec(query);
    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

// lancement d'une nouvelle partie, au démarrage du serveur
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


//communication socket.io
io.on('connection', (socket) => { 
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
                //console.log(JSON.stringify(serverData.joueurs));
                io.emit('serverTousJoueurs', serverData.joueurs);
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

    socket.on('displayReady', () => {
        console.log('Display ready');
        //socket.emit('serverTousJoueurs', serverData.joueurs);
    });

    socket.on('animationPrepareJeu', (name) => {
        let data = {};
        switch(name) {
            case 'water' :
                data.titre = 'Water works';
                data.url = '../jeux/water/water.html';
                data.imageTitre = '../jeux/water/assets/waterTitle.png';
                data.pisteSonore = '../jeux/water/assets/yaketi.mp3';
                data.nbCols = 4;
                data.nbRows = 4;
                data.maxDuration = 20000;
                data.seed = de(100000);
        }
        serverData.jeuCourant = data;
        serverData.resultatsJeuCourant = [];
        io.emit('serverPrepareJeu', data);
    });

    socket.on('animationReadyJeu', () => {
        io.emit('serverReadyJeu');
    });

    socket.on('animationDepartJeu', () => {
        io.emit('serverDepartJeu');
    });

    socket.on('playerFinJeu', (data) => {

        serverData.resultatsJeuCourant.push(data);
        if(serverData.resultatsJeuCourant.length == serverData.joueurs.length) {
            calculResultat();
        }
    });

    socket.on('animationDemandeResultat', () => {
        io.emit('serverResultatsCoup', serverData.resultatsJeuCourant);
    })

    socket.on('animationDemandeScores', () => {
        majScores();
    })
}); 
 
function calculResultat() {

    serverData.resultatsJeuCourant.sort((j1, j2) => {
        if(j1.gagne != j2.gagne) {
            return j1.gagne;
        }

        if(j1.temps != j2.temps) {
            return j1.temps - j2.temps;
        }

        return(j1.actions - j2.actions);
    });

    for(let i=0;i<serverData.resultatsJeuCourant.length;i++) {
        let nbPoints = serverData.resultatsJeuCourant.length - i;
        if(serverData.resultatsJeuCourant[i].gagne) {
            serverData.resultatsJeuCourant[i].nbPoints = nbPoints;
        } else {
            serverData.resultatsJeuCourant[i].nbPoints = 0;
        }
        serverData.resultatsJeuCourant[i].avatar = getById(serverData.joueurs, serverData.resultatsJeuCourant[i].playerId).avatar;
        serverData.resultatsJeuCourant[i].pseudo = getById(serverData.joueurs, serverData.resultatsJeuCourant[i].playerId).pseudo;
        getById(serverData.joueurs, serverData.resultatsJeuCourant[i].playerId).score += serverData.resultatsJeuCourant[i].nbPoints;
    }
}

function majScores() {
    serverData.joueurs.sort((j1, j2) => {
        if(j1.score != j2.score) {
            return j2.score - j1.score;
        }
        return (j1.pseudo.localeCompare(j2.pseudo));
    });
    //console.log(JSON.stringify(serverData.joueurs));
    io.emit('serverAllScores', serverData.joueurs);
}

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
                    //console.log("Joueur ajouté : " + joueurId);

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
     io.emit('serverTousJoueurs', serverData.joueurs);
}


function getById(tab, id) {
    for(item of tab) {
        if(item.id == id) {
            return item;
        }
    }
    return null;
}

function de(nbFaces) {
    return 1 + Math.floor(Math.random() * nbFaces);
}
