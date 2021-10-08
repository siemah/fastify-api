import { FastifyPluginAsync } from "fastify";
import fastifyAuth from "fastify-auth";
import routesEndpoints from "../../config/routes/endpoints";
import { apiKeysCreateSchema } from "../../config/schemas/api-keys";
import {
	ResponseSchemaWithErrors,
	ResponseSchemaWithSuccessMessage,
} from "../../config/schemas/shared";
import ApiKey from "../../controllers/api-key";
import { errorHandler } from "../../tools/fastify";
import { checkDeveloperPermission } from "../../tools/fastify-decorators";
import { TApiKeyCreateRoute } from "../../types/api-keys";

declare module "fastify" {
	interface FastifyInstance {
		checkDeveloperPermission: (
			req: FastifyRequest,
			rep: FastifyReply,
		) => Promise<any>;
	}
}

const apiKeysRoutes: FastifyPluginAsync = async server => {
	server
		.decorate("checkDeveloperPermission", checkDeveloperPermission)
		.register(fastifyAuth)
		.after(() => {
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
					preHandler: server.auth([server.checkDeveloperPermission]),
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
		});
};

export default apiKeysRoutes;
