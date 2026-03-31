#!/bin/bash
echo "Encerrando instâncias anteriores da aplicação..."
pkill -f "node src/api/index.js"
pkill -f "node src/agent/worker.js"
pkill -f "node src/background/scanner.js"
pkill -f "node src/background/notifications.js"
pkill -f "npm run dev"
sleep 2

echo "Iniciando a aplicação..."
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm use 20
npm run dev > app.log 2>&1 &
echo "Aplicação iniciada em background. Logs em app.log."
