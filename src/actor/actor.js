import { ObjectId } from 'mongodb';
import { validate } from '../common/validate.js';
export const Actor = { _id: ObjectId, idPelicula: String, nombre: String, edad: Number, estaRetirado: Boolean, premios: Array };
export function createActor(data) { return validate(Actor, data); }
export default Actor;
