// lib/db.js
const path = require('path');

// Accès au module partagé en dehors du dossier courant
const db = require(path.resolve(__dirname, '../../shared/common.js'));

module.exports = db;
