# seizuma.com

Site vitrine de **Seizuma** — beatboxer français.
Site 100 % statique : HTML + CSS + JS vanilla. Aucun build, aucune dépendance,
aucun framework. Servi par un conteneur nginx derrière Nginx Proxy Manager.

## Architecture

```
seizuma.com/
├── public/                 ← SEUL dossier exposé au web
│   ├── index.html          page principale
│   ├── 404.html            page d'erreur (contient le 17e secret)
│   ├── css/
│   │   └── style.css       esthétique « waveform éditorial »
│   └── js/
│       └── main.js         sons WebAudio, 16 secrets, terminal caché
├── docker-compose.yml      conteneur nginx:alpine, réseau NPM
├── nginx.conf              config du conteneur (cache, gzip, 404)
├── deploy.sh               mise à jour depuis GitHub
├── .gitignore
└── README.md
```

Tout ce qui est hors de `public/` est invisible depuis le web : la config et
le dossier `.git` ne sont jamais montés dans le conteneur.

### Chaîne de service

```
Visiteur → :443 → Nginx Proxy Manager → seizuma-web:80 → /public
              (SSL, routage domaine)      (fichiers statiques)
```

Deux nginx, deux rôles distincts : NPM gère le TLS et le routage des domaines,
le conteneur `seizuma-web` lit les fichiers sur disque. Ils ne font pas doublon.

---

## Déploiement

### 1. DNS (OVH)

Supprimer les enregistrements de parking OVH et pointer vers le VPS :

| Sous-domaine | Type | Cible |
|---|---|---|
| `@` | A | `IP_DU_VPS` |
| `www` | A | `IP_DU_VPS` |

À supprimer : les A vers `213.186.33.5` et `37.59.96.45`, les TXT
`"1|www.seizuma.com"` et `"3|welcome"`, le CNAME `ftp`.
À conserver : les `NS`, les `MX` et le `SPF` (messagerie OVH).

Vérifier avant d'aller plus loin :

```bash
dig +short seizuma.com A
dig +short www.seizuma.com A
```

Les deux doivent renvoyer **uniquement** l'IP du VPS. Ne pas demander de
certificat SSL tant que ce n'est pas le cas (Let's Encrypt limite à
5 échecs par heure).

### 2. Conteneur (sur le VPS)

```bash
git clone git@github.com:USER/seizuma.com.git /opt/seizuma
cd /opt/seizuma

docker network ls              # relever le nom du réseau de NPM
nano docker-compose.yml        # corriger la ligne "name:" en conséquence

chmod +x deploy.sh
docker compose up -d
docker ps | grep seizuma-web   # doit afficher "Up"
```

Test avant même de toucher à NPM :

```bash
docker exec seizuma-web wget -qO- http://localhost/ | head -5
```

Le conteneur ne publie aucun port : il n'est joignable que par NPM via le
réseau Docker interne.

### 3. Proxy Host (NPM)

**Details**
- Domain Names : `seizuma.com`, `www.seizuma.com`
- Scheme : `http`
- Forward Hostname / IP : `seizuma-web` *(le nom du conteneur, pas une IP)*
- Forward Port : `80`
- Block Common Exploits : ✅

**SSL** *(uniquement une fois le DNS propagé)*
- Request a new SSL Certificate
- Force SSL ✅ · HTTP/2 ✅ · HSTS ✅

### 4. Mises à jour

```bash
/opt/seizuma/deploy.sh
```

Le script fait un `git reset --hard` sur la branche courante puis recharge
nginx. Il écrase toute modification faite directement sur le VPS — c'est
volontaire : le serveur reflète exactement le repo.

---

## ⚠ Repo public ou privé ?

Tout le site est côté client : **si le repo est public, les 16 secrets sont
lisibles dans `public/js/main.js`** et dans ce README.

- **Repo privé** → le plus simple.
- **Repo public assumé** → lire le code source devient une façon légitime de
  trouver les secrets (c'est une tradition du genre). Dans ce cas, **supprime
  la section ci-dessous avant de pousser**.

## Les 16 secrets (solution)

Aucun n'est signalé sur la page. Le compteur `◆ x/16` du header reste masqué
jusqu'à la première découverte. Progression stockée en `localStorage`
(clé `szm_secrets`).

| #  | Déclencheur |
|----|-------------|
| 01 | Cliquer la grande waveform |
| 02 | Taper `B`, `T` et `K` (kick, hi-hat, snare) |
| 03 | Taper `seiz` |
| 04 | Code Konami (↑↑↓↓←→←→BA) |
| 05 | Cliquer le `©` du footer |
| 06 | Cliquer 16 fois le logo `SZM` |
| 07 | Cliquer `TR·01` → `TR·04` dans l'ordre |
| 08 | Cliquer le `∞` (durée de TR·03) |
| 09 | Cliquer la durée `0:16` (TR·04) |
| 10 | Ouvrir `seizuma.com/#seize` |
| 11 | Cliquer `face A` dans le footer → thème inversé |
| 12 | Double-cliquer le titre `SEIZUMA` |
| 13 | Taper `sudo` → ouvre le terminal SEIZUMA//OS |
| 14 | Terminal : `sudo battle` |
| 15 | Terminal : `whoami` |
| 16 | Terminal : `seize` (ou `16`) |
| 17 | *(hors compteur)* Sur la page 404 : cliquer 4 fois `—:—` |

Trouver les 16 déclenche un final « SEIZE / SEIZE ».

**Terminal caché** : accessible uniquement en tapant `sudo` hors d'un champ de
saisie. Aucun bouton ni lien ne l'ouvre — impossible d'y tomber par hasard.
Un indice discret est laissé dans la console développeur. Fermeture : `Échap`,
`exit`, ou le bouton `[ESC]`.

Les secrets 08 et 09 reposent sur la colonne « durée », masquée sous 720 px.
Pour les rendre trouvables sur mobile, réafficher `.duree` en petit plutôt que
`display:none` dans `style.css`.

---

## TODO contenu

Chercher `TODO` dans `public/index.html` :

- [ ] Liens vidéos des battles (TR·01)
- [ ] Wildcards réelles : titres, années, liens (TR·02)
- [ ] Handle Instagram (TR·02 **et** commande `wildcards` dans `main.js`)
- [ ] Email de booking (TR·04)
- [ ] Favicon + image Open Graph (`og:image`)

## Notes techniques

- **Cache** : `index.html` en `no-cache`, CSS/JS à 1 h. Passer à 30 j quand le
  site sera stable, avec cache-busting (`style.css?v=2`).
- **Sons** : entièrement synthétisés en WebAudio, aucun fichier audio à héberger.
  Le contexte audio ne démarre qu'après une interaction (contrainte navigateur).
- **Accessibilité** : `prefers-reduced-motion` respecté, focus visibles,
  waveform en `aria-hidden` (purement décorative).
