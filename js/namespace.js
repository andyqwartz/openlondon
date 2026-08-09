/* OpenLondon — Namespace global unique + helpers */
/**
 * OL est le namespace global de OpenLondon (viewer mobilité Londres).
 * Tous les modules y attachent leurs propriétés.
 * Chargé en premier (après Leaflet, avant config.js).
 */
var OL = window.OL || {};

/** Échappe du HTML (anti-XSS pour les contenus TfL affichés dans les popups). */
OL.esc = function(s) {
  var d = document.createElement('div');
  d.textContent = s == null ? '' : String(s);
  return d.innerHTML;
};