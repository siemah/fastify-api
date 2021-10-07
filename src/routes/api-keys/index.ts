import { FastifyPluginAsync } from "fastify";
import routesEndpoints from "../../config/routes/endpoints";
import { apiKeysCreateSchema } from "../../config/schemas/api-keys";
import {
	ResponseSchemaWithErrors,
	ResponseSchemaWithSuccessMessage,
} from "../../config/schemas/shared";
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
			rep.send();
		},
	);
};

export default apiKeysRoutes;
