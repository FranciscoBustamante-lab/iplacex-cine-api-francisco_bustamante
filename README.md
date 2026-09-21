# API de cine IPLACEX

API REST Express para administración de películas favoritas de empleados de IPLACEX

## Preparación

1. Instala las dependencias con `npm install`.
2. Para ejecución local, copia `.env.example` a `.env` y configura MONGODB_URI con tus credenciales privadas.
3. Ejecuta `npm start`.

El servidor conecta a MongoDB antes de escuchar. Utiliza PORT y DB_NAME; la base predeterminada es cine-db. No publiques archivos .env.

## Configuración exigida para Render

- Tipo: Web Service.
- Ambiente: Node.
- Rama: rama principal del repositorio.
- Región: Frankfurt (EU Central).
- Instancia: gratuita, según la pauta.
- Build Command: `npm install`.
- Start Command: `node server.js`.
- Variables: MONGODB_URI y DB_NAME=cine-db. Render proporciona PORT.

Autoriza las IP de salida del servicio en MongoDB Atlas, Network Access. Usa la descripción `IP #1 API REST Express en Render`, incrementando el número para cada entrada.

## Pruebas

Importa cine-api.postman_collection.json en Postman y cambia baseUrl por la URL real de Render.

- GET / devuelve el saludo del servicio.
- GET /api/peliculas consulta películas.
- GET /api/actores consulta actores.

La colección incluye operaciones que crean y modifican datos de prueba.

`npm test` ejecuta las validaciones existentes. `npm run test:integration` requiere una instancia de MongoDB de pruebas. Las pruebas no se han ejecutado como parte de esta preparación.

## Entrega pendiente

Crear el repositorio público `iplacex-cine-api-nombre_alumno` con licencia Apache (package.json declara Apache-2.0; falta incorporar LICENSE). Configurar y verificar el despliegue real. Documentar los pasos con capturas de pantalla completa en la plantilla oficial, incluyendo URLs de GitHub y Render.
