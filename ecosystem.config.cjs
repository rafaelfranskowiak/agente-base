module.exports = {
  apps: [
    {
      name: "api",
      script: "./src/api/index.js",
      watch: true
    },
    {
      name: "worker",
      script: "./src/agent/worker.js",
      watch: true
    },
    {
      name: "scanner",
      script: "./src/background/scanner.js",
      watch: true
    },
    {
      name: "notifications",
      script: "./src/background/notifications.js",
      watch: true
    }
  ]
};

