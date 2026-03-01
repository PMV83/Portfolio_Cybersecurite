# Architecture Zero Trust Proxmox et Cloudflare

Bienvenue dans la documentation officielle de l'architecture de mon laboratoire de cyberdéfense.

L'objectif de cette infrastructure est de reproduire un réseau d'entreprise hautement sécurisé. L'ensemble repose sur un serveur physique Proxmox avec un pare-feu pfSense agissant comme routeur et point de contrôle central.

---

## Philosophie de Sécurité et Cloudflare

L'exposition directe sur Internet est inexistante. L'intégralité du trafic entrant passe par des tunnels Cloudflare. Cela permet de bénéficier d'un pare-feu applicatif WAF en amont et de masquer la véritable adresse IP publique.

Au sein du réseau local, la règle d'isolation par défaut est stricte. Les communications directes entre les différents sous-réseaux privés RFC1918 sont bloquées au niveau du pare-feu.

---

## Plan d'adressage et Segmentation

Le réseau est découpé en quatre zones logiques distinctes pour garantir un cloisonnement optimal.

### 1. Zone Admin et Infra

- **Réseau :** `vmbr1` — `10.0.10.0/24` — Interface `vtnet1`
- **Rôle :** Héberger la colonne vertébrale de l'infrastructure et la supervision.
- **Composants :** Interface de management Proxmox, serveur SOC Wazuh, serveur AdGuard DNS et point d'accès VPN.

### 2. Trusted Services

- **Réseau :** Bridge Services — `10.0.20.0/24` — Interface `vtnet4`
- **Rôle :** Héberger les applications internes de confiance.
- **Composants :** Gestionnaire de mots de passe Vaultwarden et portail d'accueil Homepage.

### 3. DMZ Exposed

- **Réseau :** Bridge DMZ — `10.0.30.0/24` — Interface `vtnet3`
- **Rôle :** Isoler les services destinés à être accessibles depuis Internet via les tunnels Cloudflare.
- **Composants :** Serveur Média, serveur Minecraft et autres sites web hébergés.

### 4. Lab Untrusted

- **Réseau :** `vmbr2` — `10.0.40.0/24` — Interface `vtnet2`
- **Rôle :** Fournir un environnement bac à sable pour les expérimentations dangereuses.
- **Composants :** Machines virtuelles scolaires et environnements de test Sandbox.