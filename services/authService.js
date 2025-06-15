// services/authService.js
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');
const { sqlSelect, sqlExec } = require(process.env.ENV === 'PROD' ? '/home/ubuntu/shared/common.js' : '../lib/db.js');

/**
 * Vérifie si un joueur existe, et si non, le crée.
 * @param {string} pseudo
 * @param {string} pwd
 * @returns {Promise<{ success: boolean, id?: string }>}
 */
async function verifierOuCreerJoueur(pseudo, pwd) {
  const hashedPwd = crypto.createHash('sha256').update(pwd).digest('hex');
  const query = `SELECT * FROM joueurs WHERE pseudo = $1`;
  const results = await sqlSelect(query, [pseudo]);

  if (results.length === 0) {
    const id = uuidv4();
    const insertQuery = `INSERT INTO joueurs (id, pseudo, pwd) VALUES ($1, $2, $3)`;
    await sqlExec(insertQuery, [id, pseudo, hashedPwd]);
    console.log('Nouveau joueur créé :', pseudo);
    return { success: true, id };
  } else if (results[0].pwd === hashedPwd) {
    console.log('Connexion réussie pour :', pseudo);
    return { success: true, id: results[0].id };
  } else {
    console.log('Échec de connexion pour :', pseudo);
    return { success: false };
  }
}

module.exports = { verifierOuCreerJoueur };
