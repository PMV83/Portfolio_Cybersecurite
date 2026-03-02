# Déploiement DevSecOps Automatisé : Proxmox LXC + Docker + Splunk

Ce projet d'Infrastructure as Code (IaC) permet de déployer et de configurer de A à Z un conteneur LXC sécurisé sur un cluster Proxmox via Ansible.

En une seule commande, ce script :
- Crée la machine sur Proxmox.
- La sécurise et installe Docker.
- Déploie et configure un agent Splunk Universal Forwarder pour le SOC.

---

## Sommaire

1. [Architecture et Fonctionnement](#1-architecture-et-fonctionnement)
2. [Structure des fichiers](#2-structure-des-fichiers)
3. [Prérequis et Installation](#3-prérequis-et-installation)
4. [Configuration & Sécurité (Ansible Vault)](#4-configuration--sécurité-ansible-vault)
5. [Lancement du Déploiement](#5-lancement-du-déploiement)
6. [Tests de Validation](#6-tests-de-validation-post-déploiement)
7. [Explications Techniques et Pièges Proxmox](#7-explications-techniques-et-pièges-proxmox)

---

## 1. Architecture et Fonctionnement

Le déploiement se déroule en deux grandes phases (les "Plays") :

- **Phase 1 (Infrastructure)** : Ansible communique avec l'API de Proxmox depuis la machine locale (`localhost`) pour commander la création du conteneur LXC, configurer le réseau, injecter les clés SSH et activer les droits pour Docker.

- **Phase 2 (Configuration OS)** : Ansible se connecte en SSH à l'intérieur du nouveau conteneur pour y exécuter les commandes d'administration (mises à jour, durcissement SSH, création d'utilisateurs, installation de Splunk).

---

## 2. Structure des fichiers

| Fichier | Description |
|---|---|
| `deploy_proxmox.yml` | Le Playbook Ansible principal contenant toute la logique. |
| `config.yml` | Le fichier centralisant toutes vos variables (IPs, mots de passe). Il doit être chiffré. |
| `requirements.txt` | Dépendances Python (pour l'API Proxmox). |
| `requirements.yml` | Collections Ansible (pour les modules Proxmox). |

---

## 3. Prérequis et Installation

Toutes ces commandes sont à exécuter sur la **machine de contrôle** (le nœud depuis lequel vous lancez Ansible).

### A. Paquets systèmes de base
```bash
sudo apt update
sudo apt install ansible sshpass python3-pip -y
```

> **Note :** `sshpass` est indispensable pour le premier contact SSH avant la désactivation des mots de passe.

### B. Dépendances Ansible et Python

Pour que le module `community.general.proxmox` fonctionne, il a besoin de la librairie Python `proxmoxer`.
```bash
pip3 install -r requirements.txt
ansible-galaxy install -r requirements.yml
```

### C. Génération de la clé SSH

Ansible utilise une clé SSH pour administrer le nouveau serveur. Si vous n'en avez pas :
```bash
ssh-keygen -t ed25519 -N "" -f ~/.ssh/id_ed25519
```

---

## 4. Configuration & Sécurité (Ansible Vault)

Toutes les variables sont externalisées dans `config.yml`. Remplissez ce fichier avec vos IPs, noms de machines, et mots de passe.

### Protéger vos secrets avec Ansible Vault

> **Avertissement :** Il est **strictement déconseillé** de stocker le fichier `config.yml` en clair sur Git, car il contient le mot de passe root de Proxmox et vos configurations SOC.

**Chiffrer le fichier :**
```bash
ansible-vault encrypt config.yml
```
Ansible vous demandera de créer un mot de passe maître (Vault password).

**Modifier le fichier une fois chiffré :**
Vous ne pouvez plus utiliser `nano` ou `vim` directement. Utilisez :
```bash
ansible-vault edit config.yml
```

**Lire le fichier :**
```bash
ansible-vault view config.yml
```

---

## 5. Lancement du Déploiement

Une fois `config.yml` configuré et chiffré, lancez le déploiement. Il faut indiquer à Ansible de vous demander le mot de passe maître pour déchiffrer les variables à la volée :
```bash
ansible-playbook deploy_proxmox.yml --ask-vault-pass
```

### Astuce : L'automatisation totale

Pour ne pas avoir à taper le mot de passe maître à chaque fois (ex: utilisation dans un pipeline CI/CD) :
```bash
# Créez un fichier caché contenant votre mot de passe
echo "MonMotDePasseMaitre" > .vault_pass

# Restreignez les droits
chmod 600 .vault_pass

# Lancez Ansible ainsi
ansible-playbook deploy_proxmox.yml --vault-password-file .vault_pass
```

---

## 6. Tests de Validation Post-Déploiement

Une fois le script terminé (`0 Failed`), vérifiez que la machine respecte bien les standards de sécurité définis :

**Test de l'utilisateur et du mot de passe :**
```bash
ssh votre_nouvel_utilisateur@IP_DU_CONTENEUR
```
→ Doit réussir en demandant le mot de passe.

**Test des droits Sudo :**
Une fois connecté, tapez `sudo apt update`.
→ Doit s'exécuter sans erreur de permission.

**Test de l'intégration Docker :**
Tapez `docker ps`.
→ Doit afficher la liste des conteneurs vides, sans faire appel à `sudo`, prouvant que le groupe Docker et le "nesting" Proxmox fonctionnent.

**Test du durcissement SSH (Hardening) :**
Depuis votre machine de contrôle, essayez de vous connecter en Root en forçant la demande de mot de passe :
```bash
ssh -o PubkeyAuthentication=no root@IP_DU_CONTENEUR
```
→ La connexion **doit** être rejetée avec un `Permission denied`. L'utilisateur root ne peut se connecter que via la clé SSH d'Ansible.

---

## 7. Explications Techniques et Pièges Proxmox

Ce Playbook a été conçu pour contourner plusieurs limitations strictes de l'API Proxmox.

### Le piège du mot de passe LXC (`500 Internal Server Error`)

Il est impossible d'injecter un mot de passe initial ou une clé SSH dans un conteneur LXC en utilisant un simple Token API Proxmox. Proxmox exige les droits absolus sur le système de fichiers (`/etc/shadow`).

> **Solution :** C'est pour cela que le script s'authentifie obligatoirement avec le mot de passe réel du compte `root@pam` de Proxmox.

### Le piège de la taille du disque (`unable to parse volume ID '8G'`)

Dans l'interface web, Proxmox utilise des "G" (ex: `8G`). Via l'API pour les LXC, si vous envoyez `"8G"`, Proxmox croit que vous cherchez un chemin de fichier nommé `"8G"` et plante en erreur de permission.

> **Solution :** La variable `ct_disk_size` ne doit contenir que des **chiffres entiers** (ex: `8`).

### Docker dans un conteneur LXC

Par défaut, le noyau Linux empêche un conteneur de faire tourner d'autres conteneurs (Docker).

> **Solution :** La ligne `features: ["nesting=1", "keyctl=1"]` dans la phase de création est indispensable pour autoriser l'exécution de Docker.

### Installation de Splunk

Le paquet `.deb` officiel de Splunk n'initialise pas l'utilisateur système `splunk`.

> **Solution :** Le script crée explicitement l'utilisateur et le groupe `splunk`, puis s'approprie le dossier de manière récursive (`chown -R`) avant le démarrage du service pour éviter les crashs de permissions sur l'écriture des logs.