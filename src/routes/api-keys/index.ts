import { FastifyPluginAsync } from "fastify";
import routesEndpoints from "../../config/routes/endpoints";
import { apiKeysCreateSchema } from "../../config/schemas/api-keys";
import {
	ResponseSchemaWithErrors,
	ResponseSchemaWithSuccessMessage,
} from "../../config/schemas/shared";
import ApiKey from "../../controllers/api-key";
import { errorHandler } from "../../tools/fastify";
import { TApiKeyCreateRoute } from "../../types/api-keys";

const apiKeysRoutes: FastifyPluginAsync = async server => {
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
			errorHandler,
		},
		async (req, rep) => {
			const apiKey = new ApiKey(server.prisma);
			const { status, ...response } = await apiKey.createOneByUser(
				req.body,
				12,
			);

			rep.status(status).send(response);
		},
	);
};

export default apiKeysRoutes;
