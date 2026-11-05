import { createApp } from './app.js';
import { env } from './config/env.js';

const app = createApp();

const server = app.listen(env.PORT, () => {
  console.log(`🚀 Explore Dhandusar API running on http://localhost:${env.PORT}`);
  console.log(`📡 Environment: ${env.NODE_ENV}`);
  console.log(`🩺 Health check: http://localhost:${env.PORT}/api/health`);
});

// Graceful Shutdown
function handleShutdown(signal: string) {
  console.log(`\n🛑 Received ${signal}. Gracefully shutting down server...`);
  server.close(() => {
    console.log('✅ HTTP server closed.');
    process.exit(0);
  });

  // Force close after 10s timeout
  setTimeout(() => {
    console.error('⚠️ Forcing server shutdown after timeout.');
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));

