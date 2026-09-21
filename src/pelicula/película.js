import { ObjectId } from 'mongodb';
import { validate } from '../common/validate.js';
export const Pelicula = { _id: ObjectId, nombre: String, géneros: Array, anioEstreno: Number };
export function createPelicula(data, options) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return validate(Pelicula, data, options);
  return validate(Pelicula, { ...data, géneros: data.géneros ?? data.generos }, options);
}
export default Pelicula;
