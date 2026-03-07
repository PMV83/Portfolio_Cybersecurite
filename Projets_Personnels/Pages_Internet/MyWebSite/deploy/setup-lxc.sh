#!/bin/bash
# ================================================================
# Setup LXC — Portfolio Cybersécurité
# À lancer une seule fois sur le container LXC fraîchement créé
# Usage : bash setup-lxc.sh <GITHUB_RUNNER_TOKEN>
# Le token se récupère dans : GitHub repo → Settings → Actions
#                             → Runners → New self-hosted runner
# ================================================================
set -euo pipefail

REPO_URL="https://github.com/PMV83/Portfolio_Cybersecurite.git"
SITE_DIR="/opt/portfolio"
RUNNER_DIR="/opt/actions-runner"
RUNNER_VERSION="2.323.0"
GITHUB_REPO="PMV83/Portfolio_Cybersecurite"

if [ -z "${1:-}" ]; then
  echo "Usage: bash setup-lxc.sh <GITHUB_RUNNER_TOKEN>"
  exit 1
fi

RUNNER_TOKEN="$1"

echo "==> [1/5] Mise à jour système + Docker"
apt-get update -qq
apt-get install -y -qq git curl ca-certificates gnupg

# Docker via le repo officiel
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/debian/gpg \
  | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg

echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
https://download.docker.com/linux/debian $(. /etc/os-release && echo "$VERSION_CODENAME") stable" \
  > /etc/apt/sources.list.d/docker.list

apt-get update -qq
apt-get install -y -qq docker-ce docker-ce-cli containerd.io docker-compose-plugin
systemctl enable --now docker

echo "==> [2/5] Clone du dépôt"
mkdir -p "$SITE_DIR"
git clone "$REPO_URL" "$SITE_DIR"

echo "==> [3/5] Lancement du site"
COMPOSE_FILE="$SITE_DIR/Projets_Personnels/Pages_Internet/MyWebSite/docker-compose.yml"
docker compose -f "$COMPOSE_FILE" up -d
echo "    Site accessible sur le port 8080"

echo "==> [4/5] Installation du runner GitHub Actions"
mkdir -p "$RUNNER_DIR"
cd "$RUNNER_DIR"

curl -fsSLO "https://github.com/actions/runner/releases/download/v${RUNNER_VERSION}/actions-runner-linux-x64-${RUNNER_VERSION}.tar.gz"
tar xzf "actions-runner-linux-x64-${RUNNER_VERSION}.tar.gz"
rm  "actions-runner-linux-x64-${RUNNER_VERSION}.tar.gz"

./config.sh \
  --url "https://github.com/${GITHUB_REPO}" \
  --token "$RUNNER_TOKEN" \
  --name "lxc-portfolio" \
  --labels "self-hosted,portfolio" \
  --unattended \
  --replace

echo "==> [5/5] Service systemd du runner"
./svc.sh install root
./svc.sh start

echo ""
echo "✅  Setup terminé."
echo "    Site      : http://$(hostname -I | awk '{print $1}'):8080"
echo "    Runner    : actif (vérifie dans GitHub → Settings → Actions → Runners)"
echo ""
echo "    Configure ensuite Cloudflare Tunnel :"
echo "    hostname portfolio.pmvix.com → HTTP → $(hostname -I | awk '{print $1}'):8080"
