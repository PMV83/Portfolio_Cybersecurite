# Portfolio Cybersécurité — Aurélien Logeais

Site personnel statique présentant mon profil, mes compétences et mes projets en **Blue Team / SOC**.  
Hébergé sur un **LXC Proxmox** via Docker, exposé publiquement avec **Cloudflare Tunnel** (aucun port entrant ouvert).

🌐 **[portfolio.pmvix.com](https://portfolio.pmvix.com)**

## Structure
```
MyWebSite/
├── index.html
├── docker-compose.yml           ← Stack Docker (nginx:alpine)
├── deploy/
│   └── setup-lxc.sh             ← Script d'installation LXC (une seule fois)
├── nginx/
│   └── default.conf             ← Config nginx
├── css/style.css
├── js/main.js
├── assets/
│   ├── photoprofil.jpg
│   └── CV_Aurelien_Logeais.pdf
└── data/
    ├── linkedin-posts.json
    └── posts-images/
```
`.github/workflows/deploy.yml` est à la racine du dépôt (pas dans ce dossier).

## Déploiement initial (une seule fois)

### 1. Créer le LXC sur Proxmox
Container Debian/Ubuntu, ressources minimales (1 CPU, 512 MB RAM suffisent).

### 2. Récupérer le token du runner GitHub
GitHub → dépôt → **Settings** → **Actions** → **Runners** → **New self-hosted runner**  
Copie le token affiché (valable 1h).

### 3. Lancer le script d'installation sur le LXC
```bash
# Copie le script sur le LXC
scp deploy/setup-lxc.sh root@<IP-LXC>:/root/

# Connecte-toi et lance-le
ssh root@<IP-LXC>
bash /root/setup-lxc.sh <RUNNER_TOKEN>
```

Le script installe Docker, clone le dépôt, lance le site sur `:8080`, et installe le runner comme service systemd.

### 4. Configurer Cloudflare Tunnel
Dans **Zero Trust** → **Tunnels** → ton tunnel → **Public Hostnames** → **Add** :

| Champ | Valeur |
|---|---|
| Subdomain | `portfolio` |
| Domain | `pmvix.com` |
| Type | `HTTP` |
| URL | `<IP-LXC>:8080` |

## CI/CD automatique

À chaque `git push` sur `main` modifiant des fichiers du site, GitHub déclenche `.github/workflows/deploy.yml` :
1. Le runner self-hosted sur le LXC reçoit le job
2. `git pull` → récupère les derniers fichiers
3. `docker compose up -d --force-recreate` → redémarre le container

**Résultat : push → site à jour en ~10 secondes, sans aucune action manuelle.**

## Contenu dynamique

| Section | Source |
|---|---|
| Derniers commits & stats repo | GitHub API publique (read-only, 60 req/h) |
| Publications LinkedIn | `data/linkedin-posts.json` — mis à jour manuellement |
| Photo de profil | `assets/photoprofil.jpg` |
| CV PDF | `assets/CV_Aurelien_Logeais.pdf` |
