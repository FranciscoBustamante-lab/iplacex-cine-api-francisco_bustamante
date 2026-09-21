import express from 'express';
import {
  handleInsertActorRequest,
  handleGetActoresRequest,
  handleGetActorByIdRequest,
  handleGetActoresByPeliculaIdRequest,
} from './actorController.js';

// Instancia de express.Router() con nombre ActorRoutes
export const ActorRoutes = express.Router();

// POST: Agregar un nuevo actor o actriz
ActorRoutes.post('/actor', handleInsertActorRequest);

// GET: Obtener todos los actores
ActorRoutes.get('/actores', handleGetActoresRequest);

// GET: Obtener actor por ID
ActorRoutes.get('/actor/:id', handleGetActorByIdRequest);

// GET: Obtener actores de una película específica
ActorRoutes.get('/actor/pelicula/:idPelicula', handleGetActoresByPeliculaIdRequest);
// La pauta repite el patrón /actor/:parametro. Se usa la ruta explícita anterior para evitar ambigüedad.

// Exportar también como actorRoutes para flexibilidad
export const actorRoutes = ActorRoutes;

export default ActorRoutes;
