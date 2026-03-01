# Prévention Réseau et Filtrage Actif

Bienvenue dans la section dédiée à la sécurité périmétrique et à la prévention réseau de mon laboratoire.

Avoir une bonne visibilité sur les attaques est essentiel, mais pouvoir les bloquer avant qu'elles n'atteignent les serveurs critiques est la véritable mission de la Blue Team. Ce dossier documente l'approche théorique et technique de ma défense en profondeur.

---

## Filtrage Applicatif Cloudflare WAF

Pour les services exposés publiquement via le tunnel Zero Trust, la sécurité commence bien avant le réseau local.

- **Filtrage Géographique :** Blocage automatique du trafic provenant de pays ou de continents jugés à risque.
- **WAF Actif :** Détection et blocage des attaques web courantes comme les injections SQL ou les failles XSS directement sur le réseau de distribution Cloudflare.

---

## Pare-feu et Cloisonnement pfSense

La ligne de défense locale repose sur des règles de filtrage strictes au niveau du pare-feu central pfSense.

- **Isolation par défaut :** Tout trafic entre les différents réseaux virtuels est bloqué par défaut.
- **Règles granulaires :** Seuls les flux strictement nécessaires au fonctionnement des services sont autorisés.
- **Blocage DoH :** Les flux DNS over HTTPS sont bloqués sur le pare-feu pour empêcher les malwares de masquer leurs requêtes vers l'extérieur.

---

## Filtrage DNS et Sinkhole AdGuard

La résolution de noms de domaine est souvent la toute première étape d'une compromission. Un serveur AdGuard a été intégré pour neutraliser les menaces à la source.

- **Trou noir DNS :** Les requêtes vers des domaines connus pour héberger des malwares ou des serveurs de commande et contrôle sont instantanément bloquées.
- **Inspection forcée :** Grâce au blocage DoH opéré par pfSense en amont, toutes les machines du réseau sont contraintes d'utiliser cette résolution DNS locale sécurisée sans aucune possibilité de contournement.

---

## Détection et Prévention avec Suricata

Pour aller plus loin que le filtrage par adresses IP ou par noms de domaine, le trafic est analysé en profondeur par le moteur Suricata qui assure un double rôle.

- **Mode IDS :** Le système écoute et analyse le trafic en continu pour lever des alertes sur les comportements suspects et les remonter au SOC.
- **Mode IPS :** En complément de la détection, le moteur est configuré pour couper immédiatement les connexions correspondant à des signatures malveillantes avec un niveau de certitude absolu.

> **Note de développement :** L'export complet des règles de détection personnalisées sera prochainement ajouté dans ce répertoire.