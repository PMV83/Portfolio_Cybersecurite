# Portfolio Cybersécurité — Aurélien Logeais

Site personnel statique présentant mon profil, mes compétences et mes projets en **Blue Team / SOC**. Hébergé sur **Cloudflare Pages**.

🌐 **[portfolio.pmvix.com](https://portfolio.pmvix.com)**

## Structure
```
MyWebSite/
├── index.html                   ← Page principale
├── css/
│   └── style.css                ← Thème dark cyberpunk
├── js/
│   └── main.js                  ← UI + GitHub API (public, sans token)
├── assets/
│   ├── photoprofil.jpg          ← Photo de profil
│   └── CV_Aurelien_Logeais.pdf  ← CV téléchargeable
└── data/
    ├── linkedin-posts.json      ← Posts LinkedIn (mis à jour manuellement)
    └── posts-images/            ← Images associées aux posts
```

## Déploiement (Cloudflare Pages)

1. Push le contenu de `MyWebSite/` sur un dépôt GitHub
2. Dans le dashboard Cloudflare → **Workers & Pages** → **Create** → **Pages** → connecte le dépôt
3. Paramètres de build :
   - Framework preset : `None`
   - Build command : *(vide)*
   - Build output directory : chemin vers `MyWebSite/` (ou `.` si le dépôt ne contient que ce dossier)
4. Chaque `git push` redéploie automatiquement
5. Pour le domaine custom : **Custom domains** → `portfolio.pmvix.com` → Cloudflare gère le SSL

## Contenu dynamique

| Section | Source |
|---|---|
| Derniers commits & stats repo | GitHub API publique (read-only, 60 req/h) |
| Publications LinkedIn | `data/linkedin-posts.json` — mis à jour manuellement |
| Photo de profil | `assets/photoprofil.jpg` |
| CV PDF | `assets/CV_Aurelien_Logeais.pdf` |
