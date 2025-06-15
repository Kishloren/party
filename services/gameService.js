// services/gameService.js
const serverData = require('../data/serverData');
const { getById } = require('../utils/helpers');

/**
 * Calcule les résultats de la manche courante et attribue les points aux joueurs.
 */
function calculResultat() {
  const resultats = serverData.resultatsJeuCourant;

  resultats.sort((j1, j2) => {
    if (j1.gagne !== j2.gagne) {
      return j2.gagne - j1.gagne; // gagne = true en premier
    }
    if (j1.temps !== j2.temps) {
      return j1.temps - j2.temps;
    }
    return j1.actions - j2.actions;
  });

  for (let i = 0; i < resultats.length; i++) {
    const res = resultats[i];
    const nbPoints = resultats.length - i;
    res.nbPoints = res.gagne ? nbPoints : 0;

    const joueur = getById(serverData.joueurs, res.playerId);
    if (joueur) {
      res.avatar = joueur.avatar;
      res.pseudo = joueur.pseudo;
      joueur.score += res.nbPoints;
    }
  }

  console.log('Résultats calculés :', resultats);
}

/**
 * Trie les joueurs par score et les transmet à tous les clients.
 * @param {SocketIO.Server} io
 */
function majScores(io) {
  serverData.joueurs.sort((j1, j2) => {
    if (j1.score !== j2.score) {
      return j2.score - j1.score;
    }
    return j1.pseudo.localeCompare(j2.pseudo);
  });

  io.emit('serverAllScores', serverData.joueurs);
  console.log('Scores mis à jour.');
}

module.exports = { calculResultat, majScores };
