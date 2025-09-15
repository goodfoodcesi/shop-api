import tracer from "dd-trace";

// Initialisation du tracer Datadog
tracer.init({
  // Paramétrage de l'agent Datadog
  hostname: 'datadog-agent',  // Nom de l'agent Datadog (doit être celui du service Docker si tu es sur Docker)
  env: 'production',          // Optionnel: tu peux spécifier un environnement ici (ex : 'production', 'dev', etc.)
  service: 'node-app',        // Nom de ton service dans Datadog
  logInjection: true,
  port: 8126          // Permet d'injecter des logs dans les traces (optionnel mais utile)
});

// Optionnel : pour activer le traçage des requêtes HTTP automatiquement
tracer.use('express', {
  service: 'node-api'         // Nom de ton service pour Express dans Datadog
});