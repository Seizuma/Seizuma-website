# seizuma.com

Site vitrine de Seizuma — beatboxer français.
Site 100 % statique : HTML + CSS + JS vanilla, aucun build, aucune dépendance.

```
seizuma.com/
├── index.html
├── css/style.css
└── js/main.js
```

## ⚠ Avant de pousser sur GitHub

Tout le site est côté client : **si le repo est public, les 16 secrets sont
lisibles dans `js/main.js`** (et dans ce README). Deux options :

1. **Repo privé** — le plus simple.
2. **Repo public assumé** — lire le code source devient une façon légitime de
   trouver les secrets (c'est une tradition du genre). Dans ce cas, supprime
   la liste ci-dessous de ce README avant de pousser.

## Les 16 secrets (solution — à ne pas divulguer)

Aucun n'est signalé sur la page. Le compteur `◆ x/16` n'apparaît dans le
header qu'à partir du premier secret trouvé. La progression est sauvegardée
en `localStorage` (clé `szm_secrets`).

| #  | Secret | Déclencheur |
|----|--------|-------------|
| 01 | La waveform est vivante | Cliquer la grande waveform (joue un kick) |
| 02 | Le kit complet | Taper `B` (kick), `T` (hi-hat) et `K` (snare) |
| 03 | Seize | Taper `seiz` au clavier |
| 04 | Shoutout | Code Konami (↑↑↓↓←→←→BA) |
| 05 | Le © | Cliquer le © du footer |
| 06 | Seize clics | Cliquer 16 fois le logo `SZM` |
| 07 | Les pistes dans l'ordre | Cliquer `TR·01` → `TR·04` dans l'ordre |
| 08 | L'infini | Cliquer le `∞` (durée de TR·03) |
| 09 | 0:16 | Cliquer la durée `0:16` (TR·04) |
| 10 | Entre les lignes | Ouvrir `seizuma.com/#seize` |
| 11 | Face B | Cliquer `face A` dans le footer (le thème s'inverse) |
| 12 | Deux faces | Double-cliquer le titre `SEIZUMA` |
| 13 | SEIZUMA//OS | Taper `sudo` n'importe où → ouvre le terminal caché |
| 14 | sudo battle | Dans le terminal : `sudo battle` |
| 15 | whoami | Dans le terminal : `whoami` |
| 16 | Le mot de la fin | Dans le terminal : `seize` (ou `16`) |

Trouver les 16 déclenche un final « SEIZE / SEIZE ».

**Accès au terminal** : uniquement en tapant `sudo` (hors champ de saisie).
Aucun bouton ni lien ne l'ouvre — impossible de tomber dessus par hasard.
Un indice discret est affiché dans la console développeur pour les curieux.
Fermeture : `Échap`, `exit` ou le bouton `[ESC]`.

Note : les secrets 08 et 09 reposent sur la colonne « durée », masquée sur
mobile (< 720 px). Si tu veux qu'ils soient trouvables sur téléphone,
réaffiche `.duree` en petit plutôt que `display:none`.

## TODO contenu (cherche `TODO` dans `index.html`)

- [ ] Liens vidéos des battles (TR·01)
- [ ] Vraies wildcards : titres, années, liens (TR·02)
- [ ] Handle Instagram réel (TR·02 + commande `wildcards` dans `js/main.js`)
- [ ] Email de booking réel (TR·04)
- [ ] Favicon + image Open Graph (`og:image`)

## Déploiement sur le VPS (nginx)

Le site étant statique, il cohabite sans problème avec beatboxgames.com et
beatboxpredictions.com : un simple `server` block de plus.

```bash
# Sur le VPS
sudo mkdir -p /var/www/seizuma.com
# puis déployer, par ex. :
git clone <ton-repo> /var/www/seizuma.com
# ou depuis ta machine : rsync -avz --delete ./ user@vps:/var/www/seizuma.com/
```

`/etc/nginx/sites-available/seizuma.com` :

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name seizuma.com www.seizuma.com;

    root /var/www/seizuma.com;
    index index.html;

    location / {
        try_files $uri $uri/ =404;
    }

    # cache long pour les assets, court pour le HTML
    location ~* \.(css|js)$ {
        expires 7d;
        add_header Cache-Control "public";
    }
    location = /index.html {
        add_header Cache-Control "no-cache";
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/seizuma.com /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# HTTPS (si certbot est déjà installé pour tes autres sites)
sudo certbot --nginx -d seizuma.com -d www.seizuma.com
```

N'oublie pas de pointer les DNS de seizuma.com (A / AAAA) vers l'IP du VPS
avant de lancer certbot.

## Mises à jour

```bash
cd /var/www/seizuma.com && git pull
```

Aucun redémarrage nécessaire, nginx sert les nouveaux fichiers directement.
