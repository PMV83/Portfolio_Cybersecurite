# Portfolio Cybersécurité — Aurélien Logeais

Site personnel statique pour la recherche d'emploi en **Blue Team / SOC**.

## Structure
```
MyWebSite/
├── index.html              ← Page principale
├── css/
│   └── style.css           ← Thème dark cyberpunk
├── js/
│   └── main.js             ← UI + GitHub API (public, sans token)
├── assets/
│   ├── photoprofil.jpg     ← À ajouter manuellement
│   └── CV_Aurelien_Logeais.pdf  ← À ajouter manuellement
└── nginx/
    └── portfolio.conf      ← Config Nginx pour Proxmox
```

## Déploiement sur Proxmox

### 1. Copier les fichiers
```bash
# Depuis ta machine Windows :
scp -r "C:\Users\psgma\Documents\MyWebSite\*" user@proxmox-vm:/var/www/portfolio/
# (hors dossier nginx/)
```

### 2. Configurer Nginx
```bash
sudo cp nginx/portfolio.conf /etc/nginx/sites-available/portfolio
sudo ln -s /etc/nginx/sites-available/portfolio /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 3. Certificat TLS (Let's Encrypt)
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d portfolio.pmvix.com
```

### 4. Permissions
```bash
sudo chown -R www-data:www-data /var/www/portfolio
sudo chmod -R 755 /var/www/portfolio
```

## Fonctionnalités page d'accueil

| Feature | Statut |
|---|---|
| Profil / Bio | ✅ Statique |
| Photo de profil | ✅ Avec fallback si absente |
| Certifications | ✅ Statique |
| Compétences techniques | ✅ Statique |
| Infrastructure Homelab | ✅ Statique |
| Derniers commits GitHub | ✅ GitHub API publique (PMV83/Portfolio_Cybersecurite) |
| Stats repo GitHub | ✅ GitHub API publique |
| Publications LinkedIn | ⚠️ API LinkedIn non disponible sans OAuth — lien vers profil |
| Téléchargement CV PDF | ✅ (`assets/CV_Aurelien_Logeais.pdf`) |
| CV Interactif | ✅ Lien portfolio.pmvix.com |
| Liens de contact | ✅ Email, téléphone, LinkedIn, GitHub |

## Sections à venir (roadmap)

- `/about` — Parcours détaillé + frise chronologique
- `/projects` — Détail des projets académiques et homelab
- `/blog` — Articles techniques (articles markdown → HTML)
- `/contact` — Formulaire (nécessitera un mini back-end ou Formspree)

## Sécurité

- Zéro dépendance npm / build step (pas de supply chain risk)
- HTML/CSS/JS pur — surface d'attaque minimale
- GitHub API : requêtes read-only publiques, aucun token exposé
- Headers Nginx : HSTS, CSP, X-Frame-Options, nosniff
- Cloudflare Tunnel recommandé devant Nginx (déjà dans ton infra)
