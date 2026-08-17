/* ============================================================
   SEIZUMA.COM — main.js
   Sons, easter eggs (16) et terminal caché.

   ⚠ Si ce repo est public, tout ce fichier est lisible :
   lire le code source EST une façon légitime de trouver
   les secrets. C'est la règle du jeu sur un site statique.
   ============================================================ */

(() => {
'use strict';

/* ============================================================
   1. WAVEFORMS (décor)
   ============================================================ */
const wave = document.getElementById('bigwave');
const bars = [];
for (let i = 0; i < 72; i++) {
  const s = document.createElement('span');
  s.style.height = (12 + Math.abs(Math.sin(i * .35)) * 70 + Math.random() * 14) + 'px';
  wave.appendChild(s);
  bars.push(s);
}
document.querySelectorAll('.mini-wave').forEach(mw => {
  for (let i = 0; i < 7; i++) {
    const b = document.createElement('i');
    b.style.height = (3 + Math.random() * 11) + 'px';
    mw.appendChild(b);
  }
});
function pulse() {
  wave.classList.add('playing');
  bars.forEach(b => b.style.height = (10 + Math.random() * 86) + 'px');
  setTimeout(() => wave.classList.remove('playing'), 350);
}

/* ============================================================
   2. SONS (WebAudio, synthétisés — aucun fichier audio requis)
   ============================================================ */
let actx = null;
const AC = () => actx || (actx = new (window.AudioContext || window.webkitAudioContext)());
function kick() {
  const c = AC(), o = c.createOscillator(), g = c.createGain(), t = c.currentTime;
  o.type = 'sine';
  o.frequency.setValueAtTime(160, t);
  o.frequency.exponentialRampToValueAtTime(42, t + .12);
  g.gain.setValueAtTime(.9, t);
  g.gain.exponentialRampToValueAtTime(.001, t + .28);
  o.connect(g).connect(c.destination);
  o.start(t); o.stop(t + .3);
}
function noise(dur) {
  const c = AC(), b = c.createBuffer(1, c.sampleRate * dur, c.sampleRate), d = b.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  const s = c.createBufferSource(); s.buffer = b; return s;
}
function hihat() {
  const c = AC(), s = noise(.08), f = c.createBiquadFilter(), g = c.createGain(), t = c.currentTime;
  f.type = 'highpass'; f.frequency.value = 7000;
  g.gain.setValueAtTime(.35, t);
  g.gain.exponentialRampToValueAtTime(.001, t + .07);
  s.connect(f).connect(g).connect(c.destination); s.start(t);
}
function snare() {
  const c = AC(), t = c.currentTime;
  const s = noise(.18), f = c.createBiquadFilter(), g = c.createGain();
  f.type = 'bandpass'; f.frequency.value = 1800;
  g.gain.setValueAtTime(.6, t);
  g.gain.exponentialRampToValueAtTime(.001, t + .16);
  s.connect(f).connect(g).connect(c.destination); s.start(t);
  const o = c.createOscillator(), g2 = c.createGain();
  o.type = 'triangle'; o.frequency.value = 180;
  g2.gain.setValueAtTime(.4, t);
  g2.gain.exponentialRampToValueAtTime(.001, t + .1);
  o.connect(g2).connect(c.destination); o.start(t); o.stop(t + .12);
}

/* ============================================================
   3. MOTEUR DES SECRETS
   - 16 secrets au total
   - compteur invisible tant qu'aucun n'est trouvé
   - progression sauvegardée en localStorage
   ============================================================ */
const TOTAL = 16;
const STORE = 'szm_secrets';
const eggsEl = document.getElementById('eggs');
const toast = document.getElementById('toast');
let toastTimer;

let found;
try { found = new Set(JSON.parse(localStorage.getItem(STORE) || '[]')); }
catch (e) { found = new Set(); }

function refreshCounter() {
  if (found.size > 0) {
    eggsEl.hidden = false;
    eggsEl.textContent = '◆ ' + found.size + '/' + TOTAL;
  }
}
refreshCounter();

function egg(id, msg) {
  if (found.has(id)) return false;
  found.add(id);
  try { localStorage.setItem(STORE, JSON.stringify([...found])); } catch (e) {}
  refreshCounter();
  eggsEl.classList.add('lit');
  setTimeout(() => eggsEl.classList.remove('lit'), 900);
  toast.textContent = '◆ Secret ' + found.size + '/' + TOTAL + ' — ' + msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3400);
  if (found.size === TOTAL) setTimeout(finale, 1200);
  return true;
}

function finale() {
  const f = document.getElementById('flash');
  f.textContent = 'SEIZE / SEIZE';
  f.classList.add('on');
  kick(); setTimeout(snare, 150); setTimeout(kick, 300); setTimeout(snare, 450);
  setTimeout(() => f.classList.remove('on'), 1600);
}

/* Indice discret pour ceux qui ouvrent la console (chemin vers le terminal) */
console.log(
  '%cSEIZUMA//OS v1.6 détecté.\n' +
  '%cIl y a des choses cachées ici. Seize, pour être précis.\n' +
  'Le shell attend ceux qui savent demander les droits.',
  'color:#E8542F;font-weight:bold;font-size:14px',
  'color:#8A7F74'
);

/* ============================================================
   4. LES SECRETS HORS TERMINAL (1 → 12)
   Aucun n'est signalé visuellement sur la page.
   ============================================================ */

/* — 01 · cliquer la grande waveform — */
wave.addEventListener('click', () => {
  kick(); pulse();
  egg('wave', 'la waveform est vivante');
});

/* — 02 · jouer les trois sons au clavier (B, T, K) — */
const played = new Set();
/* — 03 · taper "seiz" — */
let buf = '';

document.addEventListener('keydown', e => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
  if (e.metaKey || e.ctrlKey || e.altKey) return;

  const k = e.key.toLowerCase();

  if (!e.repeat) {
    if (k === 'b') { kick(); pulse(); played.add('b'); }
    if (k === 't') { hihat(); pulse(); played.add('t'); }
    if (k === 'k') { snare(); pulse(); played.add('k'); }
    if (played.size === 3) egg('drums', 'kick, hi-hat, snare : le kit complet');
  }

  if (k.length === 1) {
    buf = (buf + k).slice(-8);
    if (buf.endsWith('seiz')) egg('seiz', 'seize… comme 16');
    if (buf.endsWith('sudo')) openTerminal();   /* accès au terminal caché */
  }
});

/* — 04 · code Konami — */
const KONAMI = ['arrowup','arrowup','arrowdown','arrowdown','arrowleft','arrowright','arrowleft','arrowright','b','a'];
let kpos = 0;
document.addEventListener('keydown', e => {
  if (e.target.tagName === 'INPUT') return;
  kpos = (e.key.toLowerCase() === KONAMI[kpos]) ? kpos + 1 : (e.key.toLowerCase() === KONAMI[0] ? 1 : 0);
  if (kpos === KONAMI.length) {
    kpos = 0;
    const f = document.getElementById('flash');
    f.textContent = 'SHOUTOUT !';
    f.classList.add('on');
    kick(); setTimeout(snare, 150); setTimeout(kick, 300); setTimeout(snare, 450);
    setTimeout(() => f.classList.remove('on'), 900);
    egg('konami', 'le vieux code fonctionne toujours');
  }
});

/* — 05 · cliquer le © du footer — */
document.getElementById('rmark').addEventListener('click', () => {
  egg('copyright', 'même le © cache quelque chose');
});

/* — 06 · cliquer le logo 16 fois — */
let logoClics = 0;
document.getElementById('logo').addEventListener('click', () => {
  logoClics++;
  if (logoClics === 16) egg('logo16', 'seize clics. patience récompensée');
});

/* — 07 · cliquer TR·01 → TR·04 dans l'ordre — */
let ordre = 1;
document.querySelectorAll('.no').forEach(el => {
  el.addEventListener('click', () => {
    const n = Number(el.dataset.ordre);
    if (n === ordre) {
      ordre++;
      if (ordre === 5) { ordre = 1; egg('ordre', 'les pistes dans le bon ordre'); }
    } else {
      ordre = (n === 1) ? 2 : 1;
    }
  });
});

/* — 08 · cliquer le ∞ — */
document.getElementById('infini').addEventListener('click', () => {
  egg('infini', 'les projets web ne se terminent jamais');
});

/* — 09 · cliquer la durée 0:16 — */
document.getElementById('duree16').addEventListener('click', () => {
  egg('duree16', 'seize secondes, encore');
});

/* — 10 · arriver avec #seize dans l'URL — */
function checkHash() {
  if (location.hash.toLowerCase() === '#seize') egg('hash', 'tu as lu entre les lignes (ou le code source)');
}
checkHash();
window.addEventListener('hashchange', checkHash);

/* — 11 · cliquer "face A" : le disque se retourne — */
document.getElementById('face').addEventListener('click', function () {
  document.body.classList.toggle('face-b');
  this.textContent = document.body.classList.contains('face-b') ? 'face B' : 'face A';
  egg('faceb', 'tu as retourné le disque');
});

/* — 12 · double-cliquer le titre SEIZUMA — */
document.getElementById('titre').addEventListener('dblclick', () => {
  egg('titre', 'un nom, deux faces');
});

/* ============================================================
   5. TERMINAL CACHÉ — SEIZUMA//OS  (secrets 13 → 16)
   Accès : taper "sudo" n'importe où sur la page.
   Impossible d'y arriver par accident : aucun bouton,
   aucun lien, aucune mention visible ne l'ouvre.
   ============================================================ */
const term = document.getElementById('terminal');
const termEcran = document.getElementById('termEcran');
const termInput = document.getElementById('termInput');
let booted = false;

function tprint(html, cls) {
  const d = document.createElement('div');
  d.className = 'ligne' + (cls ? ' ' + cls : '');
  d.innerHTML = html;
  termEcran.appendChild(d);
  termEcran.scrollTop = termEcran.scrollHeight;
}
const escapeHtml = s => s.replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

function openTerminal() {
  term.hidden = false;
  termInput.focus();
  egg('terminal', 'tu as trouvé SEIZUMA//OS');
  if (!booted) {
    booted = true;
    tprint('SEIZUMA//OS v1.6 — accès accordé', 't-dim');
    tprint('&gt; contrôle des cordes vocales ....... <span class="t-vif">OK</span>');
    tprint('&gt; calibration kick / snare / hi-hat . <span class="t-vif">OK</span>');
    tprint('&gt; secrets restants dans la machine .. <span class="t-vif">' + (TOTAL - found.size) + '</span>');
    tprint('');
    tprint('Tape <span class="t-inv">help</span> — ou tape autre chose, justement.', 't-dim');
  }
}
function closeTerminal() { term.hidden = true; }
document.getElementById('termClose').addEventListener('click', closeTerminal);
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && !term.hidden) closeTerminal();
});

const CMDS = {
  help() {
    tprint('Commandes documentées :');
    tprint('  <span class="t-vif">palmares</span>   résultats en battle', 't-dim');
    tprint('  <span class="t-vif">wildcards</span>  wildcards &amp; vidéos', 't-dim');
    tprint('  <span class="t-vif">projets</span>    sites web', 't-dim');
    tprint('  <span class="t-vif">clear</span>      nettoyer l\u2019écran', 't-dim');
    tprint('  <span class="t-vif">exit</span>       quitter', 't-dim');
    tprint('Les commandes non documentées existent aussi. Fouille.', 't-dim');
  },
  palmares() {
    tprint('2026  One One Battle International .. <span class="t-vif">2e PLACE</span>');
    tprint('2025  Championnat de France ......... <span class="t-vif">TOP 4</span>');
    tprint('      1up Beatbox Battle 2 .......... <span class="t-vif">TOP 4</span>');
    tprint('2024  FBB House Double Strike ....... <span class="t-vif">TOP 8</span>');
  },
  wildcards() {
    tprint('Les wildcards et les vidéos sont sur la page principale (TR·02).');
    tprint('Instagram : @seizuma', 't-dim'); /* TODO : vrai handle */
  },
  projets() {
    tprint('beatboxgames.com ........ blind test multijoueur');
    tprint('beatboxpredictions.com .. pronostics de battles');
    tprint('seizuma.com ............. vous êtes DANS celui-ci ◄', 't-dim');
  },
  clear() { termEcran.innerHTML = ''; },
  exit() { closeTerminal(); },

  /* ---- non documentées : secrets 14, 15, 16 ---- */
  sudo(args) {
    if (args === 'battle') {
      tprint('Permission accordée. Adversaire chargé : <span class="t-vif">SEIZUMA</span>.');
      tprint('Erreur : impossible de se battre contre soi-même. Ou alors…', 't-dim');
      egg('sudobattle', 'sudo battle : les vrais savent');
    } else {
      tprint('sudo : il manque quelque chose après.', 't-dim');
    }
  },
  whoami() {
    tprint('Un humain qui fait des sons de machine,');
    tprint('sur une machine qui fait des sons d\u2019humain.');
    egg('whoami', 'question existentielle détectée');
  },
  seize() {
    kick();
    tprint('<span class="t-inv">16</span> SEIZuma. v1.6. Seize secrets. Tout est lié.');
    egg('seize', 'le mot de la fin');
  },
  '16'() { CMDS.seize(); },
};

termInput.addEventListener('keydown', e => {
  if (e.key !== 'Enter') return;
  const line = termInput.value.trim();
  termInput.value = '';
  if (!line) return;
  tprint('<span class="t-dim">seizuma@battle:~$</span> ' + escapeHtml(line));
  const [c, ...rest] = line.toLowerCase().split(/\s+/);
  if (CMDS[c]) CMDS[c](rest.join(' '));
  else tprint('commande inconnue : "' + escapeHtml(c) + '"', 't-dim');
});

})();
