import express from 'express';
import {
  handleInsertPeliculaRequest,
  handleGetPeliculasRequest,
  handleGetPeliculaByIdRequest,
  handleUpdatePeliculaByIdRequest,
  handleDeletePeliculaByIdRequest,
} from './peliculaController.js';

// Instancia de express.Router() con nombre peliculaRoutes
export const peliculaRoutes = express.Router();

// POST: Agregar una nueva película
peliculaRoutes.post('/pelicula', handleInsertPeliculaRequest);

// GET: Obtener todas las películas
peliculaRoutes.get('/peliculas', handleGetPeliculasRequest);

// GET: Obtener película por ID (soporta /pelicula/:id y /película/:id)
peliculaRoutes.get('/pelicula/:id', handleGetPeliculaByIdRequest);
peliculaRoutes.get(['/película/:id', '/pel%C3%ADcula/:id'], handleGetPeliculaByIdRequest);

// PUT: Actualizar película por ID (soporta /pelicula/:id y /película/:id)
peliculaRoutes.put('/pelicula/:id', handleUpdatePeliculaByIdRequest);
peliculaRoutes.put(['/película/:id', '/pel%C3%ADcula/:id'], handleUpdatePeliculaByIdRequest);

// DELETE: Eliminar película por ID (soporta /pelicula/:id y /película/:id)
peliculaRoutes.delete('/pelicula/:id', handleDeletePeliculaByIdRequest);
peliculaRoutes.delete(['/película/:id', '/pel%C3%ADcula/:id'], handleDeletePeliculaByIdRequest);

export default peliculaRoutes;

