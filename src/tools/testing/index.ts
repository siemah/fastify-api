import createServer, { FastifyInstance } from "fastify";
import fastifyFactoryOptions from "../../config/fastify";

export const createFastifyServer = () => {
	const server: FastifyInstance = createServer(fastifyFactoryOptions);

	return server;
};
