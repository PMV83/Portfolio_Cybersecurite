#!/bin/bash

SPLUNK_SERVER="IP_DE_VOTRE_SERVEUR_SPLUNK"
SPLUNK_PORT="9997"
UF_PASS="VOTRE_MOT_DE_PASSE_SECURISE"

echo "======================================================"
echo "  Déploiement Automatique Splunk Universal Forwarder  "
echo "======================================================"

# Vérification des privilèges administrateur
if [ "$EUID" -ne 0 ]; then
  echo "[!] Erreur : Ce script doit être exécuté en tant que root (sudo)."
  exit 1
fi

# Recherche du package d'installation Splunk dans le répertoire courant
DEB_FILE=$(ls splunkforwarder-*.deb 2>/dev/null | head -n 1)
if [ -z "$DEB_FILE" ]; then
  echo "[!] Erreur : Aucun package splunkforwarder-*.deb trouvé dans ce répertoire."
  exit 1
fi

# Installation de rsyslog pour garantir la génération des logs systèmes (ex: Proxmox LXC)
echo "[*] Installation et activation de rsyslog..."
apt-get update -qq
apt-get install rsyslog -y -qq
systemctl enable rsyslog > /dev/null 2>&1
systemctl start rsyslog

# Installation de l'agent Splunk
echo "[*] Installation du package $DEB_FILE..."
dpkg -i "$DEB_FILE" > /dev/null

# Démarrage initial, acceptation de la licence et configuration du mot de passe
echo "[*] Démarrage de l'agent..."
/opt/splunkforwarder/bin/splunk start --accept-license --answer-yes --no-prompt --seed-passwd "$UF_PASS" > /dev/null

# Configuration du serveur de destination (outputs.conf)
echo "[*] Configuration du routage vers $SPLUNK_SERVER:$SPLUNK_PORT..."
cat <<EOF > /opt/splunkforwarder/etc/system/local/outputs.conf
[tcpout]
defaultGroup = default-autolb-group

[tcpout:default-autolb-group]
server = $SPLUNK_SERVER:$SPLUNK_PORT
EOF

# Configuration des journaux à surveiller (inputs.conf)
echo "[*] Configuration de la surveillance locale (auth.log et syslog)..."
cat <<EOF > /opt/splunkforwarder/etc/system/local/inputs.conf
[monitor:///var/log/auth.log]
disabled = false
sourcetype = linux_secure
index = default

[monitor:///var/log/syslog]
disabled = false
sourcetype = syslog
index = default
EOF

# Configuration du démarrage automatique au lancement de la machine
echo "[*] Activation du démarrage automatique (boot-start)..."
/opt/splunkforwarder/bin/splunk enable boot-start -user splunk > /dev/null

# Redémarrage pour appliquer les configurations réseau
echo "[*] Redémarrage du service Splunk..."
/opt/splunkforwarder/bin/splunk restart > /dev/null

echo "======================================================"
echo "[+] Installation terminée avec succès."
echo "======================================================"