import { User } from "@prisma/client";
import { FastifyPluginAsync } from "fastify";
import fastifyAuth from "fastify-auth";
import routesEndpoints from "../../config/routes/endpoints";
import { apiKeysCreateSchema } from "../../config/schemas/api-keys";
import {
	ResponseSchemaWithData,
	ResponseSchemaWithErrors,
	ResponseSchemaWithSuccessMessage,
} from "../../config/schemas/shared";
import ApiKey from "../../controllers/api-key";
import { errorHandler } from "../../tools/fastify";
import { checkUserRole } from "../../tools/fastify-decorators";
import { TApiKeyCreateRoute, TApiKeyGetRoute } from "../../types/api-keys";

declare module "fastify" {
	interface FastifyInstance {
		checkDeveloperPermission: (
			req: FastifyRequest,
			rep: FastifyReply,
		) => Promise<any>;
	}
}

const apiKeysRoutes: FastifyPluginAsync = async server => {
	server.register(fastifyAuth).after(() => {
		server.post<TApiKeyCreateRoute>(
			routesEndpoints.apiKeys.create.root,
			{
				schema: {
					body: apiKeysCreateSchema,
					response: {
						201: ResponseSchemaWithSuccessMessage,
						400: ResponseSchemaWithErrors,
					},
				},
				preHandler: server.auth([checkUserRole("DEVELOPER")]),
				errorHandler,
			},
			async (req, rep) => {
				const apiKey = new ApiKey(server.prisma);
				const { status, ...response } = await apiKey.createOneByUser(
					req.body,
					(<any>req.user).id,
				);

				rep.status(status).send(response);
			},
		);
		server.get<TApiKeyGetRoute>(
			routesEndpoints.apiKeys.list.root,
			{
				schema: {
					response: {
						200: ResponseSchemaWithData,
						400: ResponseSchemaWithErrors,
					},
				},
				preHandler: server.auth([checkUserRole("DEVELOPER")]),
				errorHandler,
			},
			async (req, rep) => {
				const apiKey = new ApiKey(server.prisma);
				const { status, ...response } = await apiKey.findAllByUser(
					(<Pick<User, "id" | "email">>req.user).id,
				);
				rep
					.status(status)
					.header("Content-Type", "application/json")
					.send(response);
			},
		);
	});
};

export default apiKeysRoutes;
