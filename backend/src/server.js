import http from 'http';
import app from './app.js';
import {connectDB} from './confij/db.js';
import { env } from './config/env.js';

const start = async () => {
  await connectDB();
  const server = http.createServer(app);
  server.listen(env.port, () => {
    console.log(`Server running on port ${env.port}`);
  });
};

start();