# Architecture et Segmentation Réseau

Bienvenue dans la documentation de l'architecture de mon laboratoire de cyberdéfense. 

L'objectif de cette infrastructure est de **reproduire un réseau d'entreprise réaliste**. J'ai construit cet environnement sur un hyperviseur **Proxmox** (Type 1), avec un pare-feu **pfSense** agissant comme routeur et point de contrôle central.

---

## Philosophie de Sécurité : Zero Trust et Assume Breach

L'ensemble du réseau a été pensé selon le principe du **moindre privilège**. Plutôt que de faire confiance à l'ensemble du réseau local, j'ai segmenté les machines en fonction de leur niveau de criticité. 

* **Isolation par défaut :** Aucun réseau ne peut communiquer avec un autre sans règle explicite.
* **Exposition contrôlée :** L'accès depuis l'extérieur est entièrement fermé au niveau du pare-feu ; l'exposition des services se fait uniquement au travers de **tunnels sécurisés Cloudflare**.

---

## Plan d'adressage et VLANs

Le réseau est découpé en plusieurs zones logiques strictement isolées via des VLANs.

| Zone | Nom | Rôle & Composants | Politique de Sécurité |
| :--- | :--- | :--- | :--- |
| **VLAN 10** | **Management** | Interfaces Proxmox, pfSense, poste admin. | Accès sortant vers les autres zones pour maintenance ; aucun accès entrant autorisé. |
| **VLAN 20** | **Services & Détection** | Splunk Enterprise, AdGuard Home, serveurs d'infrastructure. | Seuls les flux Syslog et agents Forwarders sont autorisés en entrée. |
| **VLAN 30** | **Laboratoire** | Machines cibles Windows et Linux (vulnérables). | **Isolation totale**. Aucun accès vers les autres VLANs pour prévenir tout mouvement latéral. |

---

## Inspection des Flux

Au-delà du simple filtrage par adresses IP, l'ensemble des flux transitant entre ces zones est analysé par le moteur **Suricata**. 

* **Mode IPS :** Configuré en mode prévention active pour bloquer les signatures malveillantes connues.
* **Analyse Comportementale :** Détection des comportements anormaux avant même qu'ils n'atteignent leur cible.
* **Visibilité :** Chaque alerte est envoyée en temps réel vers le SIEM Splunk pour corrélation.