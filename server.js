import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { pathToFileURL } from 'node:url';
import { connectDB, closeDB } from './src/common/db.js';
import { peliculaRoutes } from './src/pelicula/routes.js';
import { ActorRoutes } from './src/actor/routes.js';
dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.get('/', (req, res) => res.status(200).send('Bienvenido al cine Iplacex'));
// Express 4 no reenvía automáticamente rechazos de controladores async.
for (const router of [peliculaRoutes, ActorRoutes]) {
  for (const layer of router.stack) {
    for (const handler of layer.route?.stack || []) {
      const original = handler.handle;
      handler.handle = (req, res, next) => Promise.resolve().then(() => original(req, res, next)).catch(next);
    }
  }
  app.use('/api', router);
}
app.use((req, res) => res.status(404).json({ error: 'Ruta no encontrada en la API de Cine Iplacex.' }));
app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);
  const status = error.status >= 400 && error.status < 500 ? error.status : 500;
  res.status(status).json({ error: status === 400 ? 'JSON o solicitud mal formada.' : status === 500 ? 'Error interno del servidor.' : 'Solicitud rechazada.' });
});
export async function startServer(port = Number(process.env.PORT || 4000)) {
  try {
    if (!Number.isInteger(port) || port < 0 || port > 65535) throw new Error('PORT debe ser un puerto válido.');
    await connectDB();
    const server = await new Promise((resolve, reject) => {
      const instance = app.listen(port);
      instance.once('error', reject);
      instance.once('listening', () => { instance.removeListener('error', reject); resolve(instance); });
    });
    console.log('[Express] Servidor disponible en http://localhost:' + server.address().port);
    return server;
  } catch (error) {
    await closeDB();
    console.error('[Inicio] ' + (error.code === 'EADDRINUSE' ? 'Puerto ocupado. Cierra la otra instancia o configura PORT=4000 o PORT=3000.' : error.message));
    throw error;
  }
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  startServer().then(server => {
    const stop = () => server.close(async () => { await closeDB(); process.exit(0); });
    process.once('SIGINT', stop);
    process.once('SIGTERM', stop);
  }).catch(() => { process.exitCode = 1; });
}
export default app;
