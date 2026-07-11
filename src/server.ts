import fastify from "fastify";
import cors from "@fastify/cors";
import swagger from "@fastify/swagger";
import swaggerUI from "@fastify/swagger-ui";
import scalarApiReference from "@scalar/fastify-api-reference";

const port = Number(process.env.PORT) || 3333;
const isProduction = process.env.NODE_ENV === "production";

const server = fastify({
  logger: {
    level: process.env.LOG_LEVEL ?? "info",
    transport: isProduction
      ? undefined
      : {
          target: "pino-pretty",
          options: {
            translateTime: "HH:MM:ss Z",
            ignore: "pid,hostname",
          },
        },
  },
});

server.register(cors, {
  origin: "*",
});

server.register(swagger, {
  openapi: {
    openapi: "3.0.0",
    info: {
      title: "Formula 1 API",
      description: "API com dados de equipes e pilotos da Formula 1",
      version: "1.0.0",
    },
    servers: [{ url: `http://localhost:${port}` }],
    tags: [
      { name: "teams", description: "Endpoints de equipes" },
      { name: "drivers", description: "Endpoints de pilotos" },
    ],
  },
});

// Swagger UI: http://localhost:3333/docs
server.register(swaggerUI, {
  routePrefix: "/docs",
});

// Scalar UI: http://localhost:3333/reference
server.register(scalarApiReference, {
  routePrefix: "/reference",
});

const teams = [
  { id: 1, name: "McLaren", base: "Woking, United Kingdom" },
  { id: 2, name: "Mercedes", base: "Brackley, United Kingdom" },
  { id: 3, name: "Red Bull Racing", base: "Milton Keynes, United Kingdom" },
  { id: 4, name: "Ferrari", base: "Maranello, Italy" },
  { id: 5, name: "Alpine", base: "Enstone, United Kingdom" },
  { id: 6, name: "Aston Martin", base: "Silverstone, United Kingdom" },
  { id: 7, name: "Alfa Romeo Racing", base: "Hinwil, Switzerland" },
  { id: 8, name: "AlphaTauri", base: "Faenza, Italy" },
  { id: 9, name: "Williams", base: "Grove, United Kingdom" },
  { id: 10, name: "Haas", base: "Kannapolis, United States" },
  { id: 11, name: "Uralkali Haas F1 Team", base: "Banbury, United Kingdom" },
  { id: 12, name: "Scuderia Toro Rosso", base: "Faenza, Italy" },
];

const drivers = [
  { id: 1, name: "Max Verstappen", team: "Red Bull Racing" },
  { id: 2, name: "Lewis Hamilton", team: "Ferrari" },
  { id: 2, name: "Lando Norris", team: "McLaren" },
];

const teamSchema = {
  type: "object",
  properties: {
    id: { type: "number" },
    name: { type: "string" },
    base: { type: "string" },
  },
};

const driverSchema = {
  type: "object",
  properties: {
    id: { type: "number" },
    name: { type: "string" },
    team: { type: "string" },
  },
};

server.get(
  "/teams",
  {
    schema: {
      tags: ["teams"],
      summary: "Lista todas as equipes",
      response: {
        200: {
          type: "object",
          properties: { teams: { type: "array", items: teamSchema } },
        },
      },
    },
  },
  async (request, response) => {
    response.type("application/json").code(200);
    return { teams };
  }
);

server.get(
  "/drivers",
  {
    schema: {
      tags: ["drivers"],
      summary: "Lista todos os pilotos",
      response: {
        200: {
          type: "object",
          properties: { drivers: { type: "array", items: driverSchema } },
        },
      },
    },
  },
  async (request, response) => {
    response.type("application/json").code(200);
    return { drivers };
  }
);

interface DriverParams {
  id: string;
}

server.get<{ Params: DriverParams }>(
  "/drivers/:id",
  {
    schema: {
      tags: ["drivers"],
      summary: "Busca um piloto pelo id",
      params: {
        type: "object",
        properties: { id: { type: "string" } },
      },
      response: {
        200: {
          type: "object",
          properties: { driver: driverSchema },
        },
        404: {
          type: "object",
          properties: { message: { type: "string" } },
        },
      },
    },
  },
  async (request, response) => {
    const id = parseInt(request.params.id);
    const driver = drivers.find((d) => d.id === id);

    if (!driver) {
      response.type("application/json").code(404);
      return { message: "Driver Not Found" };
    } else {
      response.type("application/json").code(200);
      return { driver };
    }
  }
);

server.listen({ port }, () => {
  server.log.info(`Docs (Swagger UI) available at /docs`);
  server.log.info(`Docs (Scalar) available at /reference`);
});
