import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
// Siempre se usa una base temporal independiente, incluso al probar otra URI.
process.env.MONGODB_URI = process.env.TEST_MONGODB_URI || 'mongodb://127.0.0.1:27017';
process.env.DB_NAME = 'test_' + randomUUID().replaceAll('-', '');
const { startServer } = await import('./server.js');
const { getDB, closeDB } = await import('./src/common/db.js');
let server;
let checks = 0;
try {
  server = await startServer(0);
  const base = 'http://127.0.0.1:' + server.address().port;
  const call = async (method, path, expected, body) => {
    const response = await fetch(base + path, { method, headers: { 'Content-Type': 'application/json' }, body: body === undefined ? undefined : JSON.stringify(body) });
    const text = await response.text();
    assert.equal(response.status, expected, method + ' ' + path + ': ' + text);
    checks++;
    return response.headers.get('content-type')?.includes('application/json') ? JSON.parse(text) : text;
  };
  assert.equal(await call('GET', '/', 200), 'Bienvenido al cine Iplacex');
  const film = { nombre: 'Integracion', generos: ['Drama'], anioEstreno: 2024 };
  const movie = await call('POST', '/api/pelicula', 201, film);
  assert.equal((await call('GET', '/api/peliculas', 200)).length, 1);
  assert.equal((await call('GET', '/api/pelicula/' + movie._id, 200)).nombre, film.nombre);
  await call('GET', '/api/pel%C3%ADcula/' + movie._id, 200);
  const actor = await call('POST', '/api/actor', 201, { nombrePelicula: film.nombre, nombre: 'Actor', edad: 30, estaRetirado: false, premios: [] });
  assert.equal(actor.idPelicula, movie._id);
  await call('GET', '/api/actor/' + actor._id, 200);
  assert.equal((await call('GET', '/api/actores', 200)).length, 1);
  assert.equal((await call('GET', '/api/actor/pelicula/' + movie._id, 200)).totalActores, 1);
  await call('POST', '/api/actor', 404, { ...actor, nombrePelicula: 'No existe', idPelicula: 'No existe' });
  await call('POST', '/api/actor', 400, { ...actor, nombrePelicula: { $ne: null } });
  await call('POST', '/api/actor', 400, { ...actor, estaRetirado: 'false' });
  await call('POST', '/api/pelicula', 400, { ...film, anioEstreno: '2024abc' });
  await call('PUT', '/api/pelicula/' + movie._id, 400, {});
  await call('PUT', '/api/pelicula/' + movie._id, 200, { nombre: 'Actualizada' });
  assert.equal((await call('GET', '/api/pelicula/' + movie._id, 200)).nombre, 'Actualizada');
  for (const method of ['GET', 'PUT', 'DELETE']) await call(method, '/api/pelicula/invalido', 400, method === 'PUT' ? film : undefined);
  await call('GET', '/api/actor/invalido', 400);
  await call('GET', '/api/actor/pelicula/invalido', 400);
  for (const method of ['GET', 'PUT', 'DELETE']) await call(method, '/api/pelicula/000000000000000000000000', 404, method === 'PUT' ? film : undefined);
  await call('GET', '/api/actor/000000000000000000000000', 404);
  await call('GET', '/ruta-inexistente', 404);
  await call('DELETE', '/api/pelicula/' + movie._id, 200);
  await call('GET', '/api/pelicula/' + movie._id, 404);
  const malformed = await fetch(base + '/api/pelicula', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{' });
  assert.equal(malformed.status, 400); checks++;
  // Verifica que las edades se persistan como BSON int, no texto.
  const types = await getDB().collection('actores').aggregate([{ $project: { type: { $type: '$edad' } } }]).toArray();
  assert.equal(types[0].type, 'int');
  console.log(checks + ' solicitudes HTTP verificadas; persistencia y tipo BSON correctos.');
} finally {
  if (server) {
    await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
    await getDB().dropDatabase();
  }
  await closeDB();
}
