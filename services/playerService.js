// services/playerService.js
const { sqlSelect, sqlExec } = require(process.env.ENV === 'PROD' ? '/home/ubuntu/shared/common.js' : '../lib/db.js');
const serverData = require('../data/serverData');
const { getById } = require('../utils/helpers');

const appId = 3;

/**
 * Ajoute un joueur à la partie courante et enregistre sa participation.
 * @param {string} joueurId
 */
async function ajouterJoueur(io, joueurId) {
  try {
    const results = await sqlSelect("SELECT * FROM joueurs WHERE id = $1", [joueurId]);
    if (results.length === 0) return;

    const joueur = {
      id: joueurId,
      pseudo: results[0].pseudo,
      avatar: JSON.parse(results[0].avatar),
      score: 0,
      tempsCumule: 0,
      ping: 0
    };

    serverData.joueurs.push(joueur);
    io.emit('serverDonneesJoueur', joueur);
    await sqlExec("DELETE FROM parties WHERE idJoueur = $1 AND idapp = $2", [joueurId, appId]);
    await sqlExec(
      "INSERT INTO parties (idjoueur, idapp, dernierepartie, jsondata) VALUES ($1, $2, $3, $4)",
      [joueurId, appId, serverData.uuidPartieCourante, JSON.stringify(joueur)]
    );

    console.log('Joueur ajouté à la partie :', joueur.pseudo);
  } catch (err) {
    console.error('Erreur lors de l’ajout du joueur :', err);
  }
}

/**
 * Réémet les données d’un joueur reconnecté.
 * @param {SocketIO.Server} io
 * @param {string} joueurId
 */
function reconnecterJoueur(io, joueurId) {
  const joueur = getById(serverData.joueurs, joueurId);
  if (joueur) {
    io.emit('serverDonneesJoueur', joueur);
    io.emit('serverTousJoueurs', serverData.joueurs);
    console.log('Joueur reconnecté :', joueur.pseudo);
  }
}

module.exports = { ajouterJoueur, reconnecterJoueur };
