import { ObjectId } from 'mongodb';
import { parseId } from '../common/validate.js';
import { getDB } from '../common/db.js';
import { createActor } from './actor.js';
import { peliculaCollection } from '../pelicula/peliculaController.js';

// Constante global que define el nombre de la colección de actores
export const actorCollection = 'actores';

// El título se consulta al responder; no se duplica en el documento del actor.
function actoresConPelicula(filtro) {
  return [
    { $match: filtro },
    { $lookup: {
      from: peliculaCollection,
      let: { peliculaId: { $convert: { input: '$idPelicula', to: 'objectId', onError: null, onNull: null } } },
      pipeline: [
        { $match: { $expr: { $eq: ['$_id', '$$peliculaId'] } } },
        { $project: { nombre: 1 } },
      ],
      as: '_peliculaRelacionada',
    } },
    { $addFields: { nombrePelicula: { $ifNull: [{ $arrayElemAt: ['$_peliculaRelacionada.nombre', 0] }, null] } } },
    { $project: { _peliculaRelacionada: 0 } },
  ];
}


/**
 * Controlador REST para insertar un nuevo actor o actriz.
 * Valida la estructura mediante el schema Actor y verifica que la película
 * asignada exista dentro de la colección de películas (validando por nombre o por _id).
 * Retorna código HTTP 201 en caso de éxito.
 */
export const handleInsertActorRequest = async (req, res) => {
  try {
    const input = req.body;
    if (input?.nombrePelicula !== undefined && (typeof input.nombrePelicula !== 'string' || !input.nombrePelicula.trim())) {
      return res.status(400).json({ error: 'nombrePelicula debe ser un texto no vacío.' });
    }
    const actorData = createActor({ ...input, idPelicula: input?.nombrePelicula?.trim() || input?.idPelicula });
    const db = getDB();

    // Validar si la película existe en la colección de películas (por _id o por nombre)
    let peliculaQuery = {};
    const idPeliculaRaw = actorData.idPelicula;

    try {
      if (ObjectId.isValid(idPeliculaRaw) && String(new ObjectId(idPeliculaRaw)) === idPeliculaRaw) {
        peliculaQuery = { $or: [{ _id: new ObjectId(idPeliculaRaw) }, { nombre: idPeliculaRaw }] };
      } else {
        peliculaQuery = { nombre: idPeliculaRaw };
      }
    } catch {
      peliculaQuery = { nombre: idPeliculaRaw };
    }

    // Si viene nombrePelicula explícito en el body, también se puede usar para la búsqueda
    if (req.body.nombrePelicula) {
      peliculaQuery = { nombre: req.body.nombrePelicula.trim() };
    }

    return db.collection(peliculaCollection)
      .findOne(peliculaQuery)
      .then((peliculaEncontrada) => {
        if (!peliculaEncontrada) {
          return res.status(404).json({
            error: `La película "${req.body.nombrePelicula || actorData.idPelicula}" no existe en la colección de películas. Debe asignar una película existente.`,
          });
        }

        // Asignar el _id de la película encontrada a la propiedad idPelicula
        actorData.idPelicula = peliculaEncontrada._id.toString();

        // Insertar el actor en la colección de actores
        return db
          .collection(actorCollection)
          .insertOne(actorData)
          .then((result) => {
            return res.status(201).json({
              mensaje: 'Actor o actriz registrado exitosamente.',
              _id: result.insertedId,
              peliculaNombre: peliculaEncontrada.nombre,
              nombrePelicula: peliculaEncontrada.nombre,
              ...actorData,
            });
          });
      })
      .catch((error) => {
        console.error('[ActorController] Error al insertar actor:', error);
        return res.status(500).json({ error: 'Error interno del servidor al procesar el registro del actor.' });
      });
  } catch (validationError) {
    return res.status(400).json({ error: validationError.message });
  }
};

/**
 * Controlador REST para obtener todos los registros de actores.
 * Retorna un arreglo [ {}, {}, ... ] y código HTTP 200.
 */
export const handleGetActoresRequest = async (req, res) => {
  const db = getDB();

  return db.collection(actorCollection)
    .aggregate(actoresConPelicula({}))
    .toArray()
    .then((actores) => {
      return res.status(200).json(actores);
    })
    .catch((error) => {
      console.error('[ActorController] Error al obtener actores:', error);
      return res.status(500).json({ error: 'Error interno del servidor al consultar los actores.' });
    });
};

/**
 * Controlador REST para obtener un actor o actriz en base a su _id.
 * Implementa try-catch para validar ObjectId y promesas then/catch.
 * Retorna 400 si el Id está mal formado, 404 si no existe y 200 si se encuentra.
 */
export const handleGetActorByIdRequest = async (req, res) => {
  const { id } = req.params;
  let objectId;

  // Validación de transformación a ObjectId con try-catch
  try {
    objectId = parseId(id);
  } catch (err) {
    return res.status(400).json({ error: 'Id mal formado. Debe ser un ObjectId válido de 24 caracteres hexadecimales.' });
  }

  const db = getDB();

  return db.collection(actorCollection)
    .aggregate(actoresConPelicula({ _id: objectId }))
    .toArray()
    .then(([actor]) => {
      if (!actor) {
        return res.status(404).json({ error: 'Actor o actriz no encontrado con el ID especificado.' });
      }
      return res.status(200).json(actor);
    })
    .catch((error) => {
      console.error('[ActorController] Error al buscar actor por ID:', error);
      return res.status(500).json({ error: 'Error interno del servidor al buscar el actor.' });
    });
};

/**
 * Controlador REST para obtener todos los actores asignados a una película en base a su _id de película.
 * Retorna los actores asociados y código HTTP 200.
 */
export const handleGetActoresByPeliculaIdRequest = async (req, res) => {
  let idPelicula;
  try { idPelicula = parseId(req.params.idPelicula).toHexString(); }
  catch (error) { return res.status(400).json({ error: error.message }); }

  const db = getDB();

  return db.collection(actorCollection)
    .aggregate(actoresConPelicula({ idPelicula: String(idPelicula) }))
    .toArray()
    .then((actores) => {
      return res.status(200).json({
        idPelicula: String(idPelicula),
        totalActores: actores.length,
        actores: actores,
      });
    })
    .catch((error) => {
      console.error('[ActorController] Error al obtener actores de la película:', error);
      return res.status(500).json({ error: 'Error interno del servidor al consultar actores por película.' });
    });
};

// Alias para mantener compatibilidad con cualquier referencia de nombre de método
export const handleGetActoresByPeliculaRequest = handleGetActoresByPeliculaIdRequest;

export default {
  actorCollection,
  handleInsertActorRequest,
  handleGetActoresRequest,
  handleGetActorByIdRequest,
  handleGetActoresByPeliculaIdRequest,
  handleGetActoresByPeliculaRequest,
};
