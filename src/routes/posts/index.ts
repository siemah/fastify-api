import { User } from ".prisma/client";
import { FastifyPluginCallback } from "fastify";
import fastifyAuth from "fastify-auth";
import routesEndpoints from "../../config/routes/endpoints";
import { CreatePostBodySchema } from "../../config/schemas/posts";
import {
	ResponseSchemaWithErrors,
	ResponseSchemaWithSuccessMessage,
} from "../../config/schemas/shared";
import Post from "../../controllers/posts";
import { errorHandler } from "../../tools/fastify";
import { checkUserRole } from "../../tools/fastify-decorators";
import { TCreatePostRoute } from "../../types/posts";

const postsRoutes: FastifyPluginCallback = async server => {
	server.register(fastifyAuth).after(() => {
		server.post<TCreatePostRoute>(
			routesEndpoints.posts.create.root,
			{
				onRequest: server.auth([checkUserRole("AUTHOR")]),
				schema: {
					body: CreatePostBodySchema,
					response: {
						"2xx": ResponseSchemaWithSuccessMessage,
						"4xx": ResponseSchemaWithErrors,
					},
				},
				errorHandler,
			},
			async (req, rep) => {
				const post = new Post(server.prisma);
				const { status, ...response } = await post.createOneByUser(
					req.body,
					(<Pick<User, "id">>req.user).id,
				);

				rep.status(status).send(response);
			},
		);
	});
};

export default postsRoutes;
