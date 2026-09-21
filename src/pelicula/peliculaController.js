import { parseId } from '../common/validate.js';
import { getDB } from '../common/db.js';
import { createPelicula } from './película.js';

// Constante global que define el nombre de la colección de películas
export const peliculaCollection = 'peliculas';

/**
 * Controlador REST para insertar una nueva película.
 * Valida los datos usando el schema Pelicula y retorna código HTTP 201 en caso de éxito.
 * Ejecuta promesas then y catch para capturar el resultado y excepciones.
 */
export const handleInsertPeliculaRequest = async (req, res) => {
  try {
    const nuevaPelicula = createPelicula(req.body);
    const db = getDB();

    return db.collection(peliculaCollection)
      .insertOne(nuevaPelicula)
      .then((result) => {
        return res.status(201).json({
          mensaje: 'Película creada exitosamente.',
          _id: result.insertedId,
          ...nuevaPelicula,
        });
      })
      .catch((error) => {
        console.error('[PeliculaController] Error al insertar película:', error);
        return res.status(500).json({ error: 'Error interno del servidor al guardar la película.' });
      });
  } catch (validationError) {
    return res.status(400).json({ error: validationError.message });
  }
};

/**
 * Controlador REST para obtener todas las películas registradas.
 * Retorna un arreglo de películas [ {}, {}, ... ] y código HTTP 200.
 */
export const handleGetPeliculasRequest = async (req, res) => {
  const db = getDB();

  return db.collection(peliculaCollection)
    .find({})
    .toArray()
    .then((peliculas) => {
      return res.status(200).json(peliculas);
    })
    .catch((error) => {
      console.error('[PeliculaController] Error al obtener películas:', error);
      return res.status(500).json({ error: 'Error interno del servidor al consultar las películas.' });
    });
};

/**
 * Controlador REST para obtener una película en base a su _id.
 * Implementa try-catch para validar ObjectId y promesas then/catch para la consulta.
 * Retorna código HTTP 400 si el ID está mal formado, 404 si no se encuentra y 200 si se obtiene.
 */
export const handleGetPeliculaByIdRequest = async (req, res) => {
  const { id } = req.params;
  let objectId;

  // Validación de transformación a ObjectId con try-catch
  try {
    objectId = parseId(id);
  } catch (err) {
    return res.status(400).json({ error: 'Id mal formado. Debe ser un ObjectId válido de 24 caracteres hexadecimales.' });
  }

  const db = getDB();

  return db.collection(peliculaCollection)
    .findOne({ _id: objectId })
    .then((pelicula) => {
      if (!pelicula) {
        return res.status(404).json({ error: 'Película no encontrada con el ID especificado.' });
      }
      return res.status(200).json(pelicula);
    })
    .catch((error) => {
      console.error('[PeliculaController] Error al buscar película por ID:', error);
      return res.status(500).json({ error: 'Error interno del servidor al buscar la película.' });
    });
};

/**
 * Controlador REST para actualizar una película en base a su _id.
 * Utiliza el operador $set de MongoDB.
 * Retorna código HTTP 400 si el ID está mal formado, 404 si no existe y 200 si se actualiza.
 */
export const handleUpdatePeliculaByIdRequest = async (req, res) => {
  const { id } = req.params;
  let objectId;

  // Validación de transformación a ObjectId con try-catch
  try {
    objectId = parseId(id);
  } catch (err) {
    return res.status(400).json({ error: 'Id mal formado. Debe ser un ObjectId válido de 24 caracteres hexadecimales.' });
  }

  let updateData;
  try { updateData = createPelicula(req.body, { partial: true }); }
  catch (error) { return res.status(400).json({ error: error.message }); }

  const db = getDB();

  return db.collection(peliculaCollection)
    .updateOne({ _id: objectId }, { $set: updateData })
    .then((result) => {
      if (result.matchedCount === 0) {
        return res.status(404).json({ error: 'Película no encontrada para actualizar.' });
      }
      return res.status(200).json({
        mensaje: 'Película actualizada exitosamente.',
        _id: id,
        camposActualizados: updateData,
      });
    })
    .catch((error) => {
      console.error('[PeliculaController] Error al actualizar película:', error);
      return res.status(500).json({ error: 'Error interno del servidor al actualizar la película.' });
    });
};

/**
 * Controlador REST para eliminar una película en base a su _id.
 * Retorna código HTTP 400 si el ID está mal formado, 404 si no existe y 200 si se elimina.
 */
export const handleDeletePeliculaByIdRequest = async (req, res) => {
  const { id } = req.params;
  let objectId;

  // Validación de transformación a ObjectId con try-catch
  try {
    objectId = parseId(id);
  } catch (err) {
    return res.status(400).json({ error: 'Id mal formado. Debe ser un ObjectId válido de 24 caracteres hexadecimales.' });
  }

  const db = getDB();

  return db.collection(peliculaCollection)
    .deleteOne({ _id: objectId })
    .then((result) => {
      if (result.deletedCount === 0) {
        return res.status(404).json({ error: 'Película no encontrada para eliminar.' });
      }
      return res.status(200).json({
        mensaje: 'Película eliminada exitosamente.',
        _id: id,
      });
    })
    .catch((error) => {
      console.error('[PeliculaController] Error al eliminar película:', error);
      return res.status(500).json({ error: 'Error interno del servidor al eliminar la película.' });
    });
};

export default {
  peliculaCollection,
  handleInsertPeliculaRequest,
  handleGetPeliculasRequest,
  handleGetPeliculaByIdRequest,
  handleUpdatePeliculaByIdRequest,
  handleDeletePeliculaByIdRequest,
};
