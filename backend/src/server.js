import 'dotenv/config';
import './models/index.js';
import app from './app.js';
import { connectDatabase } from './config/database.js';
import { getJwtSecret } from './config/auth.js';

const PORT = Number(process.env.PORT) || 5000;

async function start() {
  getJwtSecret();
  await connectDatabase();

  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
