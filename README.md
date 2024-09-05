<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>

# Orders Microservice

## Instalación y Ejecución (Modo Dev)

1. Clonar el repositorio..
2. Instalar dependencias `npm install`.
3. Crear un archivo `.env` basado en el `.env.template`.
4. Crear la db con `docker compose up -d`
5. Ejecutar migración de prisma: `npx prisma migrate dev`.
6. Levantar el servidor de NATS `docker run -d --name nats-server -p 4222:4222 -p 8222:8222 nats`
7. Ejecutar `npm run start:dev`.
