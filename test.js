import assert from 'node:assert/strict';
import { createPelicula } from './src/pelicula/película.js';
import { createActor } from './src/actor/actor.js';
import { parseId } from './src/common/validate.js';
const movie = { nombre: 'Prueba', generos: ['Drama'], anioEstreno: 2024 };
const actor = { idPelicula: 'Prueba', nombre: 'Actor', edad: 30, estaRetirado: false, premios: [] };
assert.equal(createPelicula(movie).anioEstreno, 2024);
assert.equal(createActor(actor).estaRetirado, false);
for (const value of ['30abc', '30', 30.5, -1, null, 2147483648]) {
  assert.throws(() => createActor({ ...actor, edad: value }));
  assert.throws(() => createPelicula({ ...movie, anioEstreno: value }));
}
for (const value of ['false', 0, null, undefined]) assert.throws(() => createActor({ ...actor, estaRetirado: value }));
for (const value of ['', ' ', null, { $ne: null }]) assert.throws(() => createPelicula({ ...movie, nombre: value }));
assert.throws(() => createPelicula({}, { partial: true }));
assert.deepEqual(createPelicula({ nombre: ' Nuevo ' }, { partial: true }), { nombre: 'Nuevo' });
assert.throws(() => parseId(undefined));
assert.throws(() => parseId('incorrecto'));
assert.equal(parseId('ABCDEF012345678901234567').toHexString(), 'abcdef012345678901234567');
console.log('Validaciones correctas: tipos, enteros BSON, nombres, actualizaciones e identificadores.');
