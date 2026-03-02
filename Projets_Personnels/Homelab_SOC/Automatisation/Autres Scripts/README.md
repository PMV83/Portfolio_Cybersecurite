# Splunk Universal Forwarder - Auto Installer (Debian/Ubuntu)

Ce script bash automatise le déploiement et la configuration de l'agent **Splunk Universal Forwarder** sur des systèmes basés sur Debian/Ubuntu.

Il est particulièrement utile dans les environnements virtualisés (comme les conteneurs Proxmox LXC) car il s'assure également de l'installation de `rsyslog` pour garantir la création des fichiers de logs standards.

---

## Fonctionnalités

- Installation automatique du package `.deb`.
- Déploiement silencieux (acceptation auto de la licence et définition du mot de passe).
- Génération automatique des fichiers de configuration `outputs.conf` et `inputs.conf`.
- Redirection par défaut des flux `auth.log` (sourcetype: `linux_secure`) et `syslog` (sourcetype: `syslog`).
- Activation du service au démarrage du système.

---

## Prérequis

1. Une machine cible sous Debian/Ubuntu.
2. Le package officiel d'installation `.deb` de l'agent (à télécharger sur le [site officiel de Splunk](https://www.splunk.com/)).
3. Un serveur Splunk de destination configuré pour recevoir des données sur le port d'écoute (par défaut `9997`).

---

## Utilisation

**Étape 1 :** Transférez le package `.deb` (ex: `splunkforwarder-9.x.x-linux-amd64.deb`) et le script `install_splunk_agent.sh` dans le même dossier sur la machine cible.

**Étape 2 :** Éditez le script pour y insérer vos paramètres de configuration.
```bash
nano install_splunk_agent.sh
```

Modifiez les variables situées en haut du fichier :

- `SPLUNK_SERVER` : L'adresse IP ou le nom d'hôte de votre serveur Splunk central.
- `SPLUNK_PORT` : Le port de réception (`9997` par défaut).
- `UF_PASS` : Le mot de passe administrateur souhaité pour l'agent local.

**Étape 3 :** Rendez le script exécutable.
```bash
chmod +x install_splunk_agent.sh
```

**Étape 4 :** Lancez le script avec les privilèges administrateur (`root`).
```bash
sudo ./install_splunk_agent.sh
```

---

## Vérification

Une fois le script terminé, vous pouvez vérifier la remontée des logs directement sur l'interface web de votre serveur Splunk via cette recherche SPL :
```spl
index=default (sourcetype="linux_secure" OR sourcetype="syslog") host="nom_de_la_machine"
```