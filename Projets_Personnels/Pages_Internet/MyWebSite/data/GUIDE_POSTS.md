# 📝 Comment ajouter un post LinkedIn

## 1 — Ouvrir le fichier

Ouvre le fichier : `data/linkedin-posts.json`

---

## 2 — Copier le bloc template suivant

```json
{
  "id": 99,
  "date": "2026-03-20T09:00:00",
  "category": "Cybersécurité",
  "content": "Colle ici le texte exact de ton post LinkedIn.",
  "url": "https://www.linkedin.com/posts/TON-LIEN-ICI"
},
```

Colle-le **en haut de la liste** (juste après le `[` d'ouverture), et incrémente le `id`.

---

## 3 — Remplir les champs

| Champ      | Ce qu'il faut mettre |
|------------|---------------------|
| `id`       | Un numéro unique, plus grand que le précédent |
| `date`     | Date + heure de ton vrai post LinkedIn → format `"AAAA-MM-JJTHH:MM:SS"` |
| `category` | Voir liste ci-dessous |
| `content`  | Colle le texte intégral de ton post (sauts de ligne conservés) |
| `images`   | Tableau de chemins vers les photos — voir détail ci-dessous |
| `url`      | Lien vers ton post LinkedIn une fois publié (ou `""` si pas encore sorti) |

> 💡 **Post pas encore publié ?** Laisse `"url": ""` → le bouton LinkedIn n'apparaît simplement pas sur la carte.
> Une fois ton post en ligne, récupère l'URL depuis LinkedIn (3 petits points · "Copier le lien du post"),
> colle-le : `"url": "https://www.linkedin.com/posts/..."` — sauvegarde le JSON et rafraîchis le site.

### 🖼️ Ajouter des photos à un post

1. **Copie tes images** dans le dossier `data/posts-images/`
2. **Nomme-les** clairement, ex : `post-5-splunk-dashboard.jpg`
3. **Référence-les** dans le champ `images` :

```json
"images": ["data/posts-images/post-5-splunk-dashboard.jpg"]
```

Plusieurs photos :
```json
"images": [
  "data/posts-images/post-5-screenshot1.jpg",
  "data/posts-images/post-5-screenshot2.jpg",
  "data/posts-images/post-5-screenshot3.jpg"
]
```

Pas de photos :
```json
"images": []
```

**Mise en page automatique :**
- 1 image → affichée en pleine largeur (format 16/9)
- 2 images → côte à côte
- 3 images → 3 colonnes égales
- 4 images → grille 2×2
- 5+ images → grille 2×2 + badge "+N" sur la dernière case, toutes visibles en cliquant

En cliquant sur une image → lightbox avec navigation gauche/droite + touche Esc.

---

## 4 — Catégories disponibles

| Valeur exacte      | Couleur / icône |
|--------------------|-----------------|
| `"Cybersécurité"`  | Cyan (bouclier) |
| `"Certification"`  | Vert (certificat) |
| `"Homelab"`        | Jaune (serveur) |
| `"Alternance"`     | Bleu (mallette) |
| `"Formation"`      | Violet (diplôme) |
| `"SOC"`            | Rouge (œil) |

Pour ajouter une nouvelle catégorie, utilise n'importe quel texte → elle apparaîtra avec le style par défaut (cyan).

---

## 5 — Planifier un post (publication future)

Mets simplement une **date dans le futur** dans le champ `date`.
Le post sera :
- ✅ Visible dans **ta preview locale** avec un bandeau "Planifié"
- ❌ Invisible sur le site public jusqu'à cette date

Exemple pour un post prévu le 1er avril à 8h :
```json
"date": "2026-04-01T08:00:00"
```

---

## 6 — Règles JSON importantes

- Pas de virgule après le **dernier** élément de la liste
- Le fichier doit rester un tableau `[...]` valide
- Utilise un validateur : https://jsonlint.com/ en cas de doute

---

## 7 — Structure finale du fichier

```json
[
  {
    "id": 5,
    "date": "2026-04-01T08:00:00",
    "category": "SOC",
    "content": "Mon nouveau post...",
    "url": ""
  },
  {
    "id": 4,
    "date": "2026-03-10T09:00:00",
    "category": "Cybersécurité",
    "content": "Post précédent...",
    "url": "https://www.linkedin.com/posts/..."
  }
]
```

Les 3 posts les plus récents (date passée) apparaissent en haut.
Le reste va automatiquement dans l'**archive par catégorie** (repliable).
