// socket/gameHandlers.js
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');
const { sqlSelect, sqlExec } = require(process.env.ENV === 'PROD' ? '/home/ubuntu/shared/common.js' : '../lib/db.js');

const { verifierOuCreerJoueur } = require('../services/authService');
const { ajouterJoueur, reconnecterJoueur } = require('../services/playerService');
const { calculResultat, majScores } = require('../services/gameService');
const { getById, de } = require('../utils/helpers');
const serverData = require('../data/serverData');

const appId = 3;

serverData.uuidPartieCourante = uuidv4();
serverData.joueurs = [];

(async () => {
  try {
    await sqlExec(`UPDATE apps SET partieencours = '${serverData.uuidPartieCourante}' WHERE idApp = ${appId}`);
    console.log('Id de la partie : ' + serverData.uuidPartieCourante);
  } catch (err) {
    console.error('Erreur SQL : ', err);
  }
})();

function initSocketHandlers(io) {
  io.on('connection', (socket) => {

    socket.on('loginDemandeConnexion', async (data) => {
      try {
        const result = await verifierOuCreerJoueur(data.pseudo, data.pwd);
        console.log(JSON.stringify(result));
        if (result.success) {
          socket.emit('serverConnexionOK', result.id);
        } else {
          socket.emit('serverConnexionNOK');
        }
      } catch (err) {
        console.error(err);
      }
    });

    socket.on('playerConnexion', async (joueurId) => {
      try {
        const query = `SELECT * FROM parties WHERE idjoueur = '${joueurId}' AND idapp = ${appId} AND dernierepartie = '${serverData.uuidPartieCourante}'`;
        const results = await sqlSelect(query);
        if (results.length === 0) {
          await ajouterJoueur(io, joueurId);
        } else {
          reconnecterJoueur(io, joueurId);
        }
        io.emit('serverTousJoueurs', serverData.joueurs);
      } catch (err) {
        console.error('Error executing query:', err);
      }
    });

    socket.on('playerUpdateData', async (data) => {
      try {
        const query = `UPDATE joueurs SET avatar = '${JSON.stringify(data.avatar)}' WHERE id = '${data.id}'`;
        await sqlExec(query);
        const joueur = getById(serverData.joueurs, data.id);
        if (joueur) joueur.avatar = data.avatar;
      } catch (err) {
        console.error('Error executing query:', err);
      }
    });

    socket.on('animationEtatServeur', () => {
      console.log(JSON.stringify(serverData));
    });

    socket.on('displayReady', () => {
      console.log('Display ready');
    });

    socket.on('animationPrepareJeu', (name) => {
      let data = {};
      switch (name) {
        case 'water':
          data = {
            titre: 'Water works',
            url: '../jeux/water/water.html',
            imageTitre: '../jeux/water/assets/waterTitle.png',
            pisteSonore: '../jeux/water/assets/yaketi.mp3',
            nbCols: 4,
            nbRows: 4,
            maxDuration: 20000,
            seed: de(100000),
          };
          break;
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
      if (serverData.resultatsJeuCourant.length === serverData.joueurs.length) {
        calculResultat();
      }
    });

    socket.on('animationDemandeResultat', () => {
      io.emit('serverResultatsCoup', serverData.resultatsJeuCourant);
    });

    socket.on('animationDemandeScores', () => {
      majScores(io);
    });

  });
}

module.exports = { initSocketHandlers };
