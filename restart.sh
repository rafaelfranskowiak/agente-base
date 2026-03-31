#!/bin/bash
echo "Reiniciando a aplicação..."
pkill -f "node src/api/index.js"
pkill -f "node src/agent/worker.js"
pkill -f "node src/background/scanner.js"
pkill -f "node src/background/notifications.js"
sleep 2
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm use 20
npm run dev &
echo "Aplicação reiniciada em background."
