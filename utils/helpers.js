// utils/helpers.js

/**
 * Recherche un élément par ID dans un tableau d’objets.
 * @param {Array} tab - Tableau contenant des objets avec un champ 'id'.
 * @param {string} id - ID à rechercher.
 * @returns {Object|null}
 */
function getById(tab, id) {
  return tab.find(item => item.id === id) || null;
}

/**
 * Lance un dé virtuel avec le nombre de faces donné.
 * @param {number} nbFaces
 * @returns {number}
 */
function de(nbFaces) {
  return 1 + Math.floor(Math.random() * nbFaces);
}

module.exports = { getById, de };
