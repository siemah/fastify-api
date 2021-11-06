import { User } from ".prisma/client";
import { FastifyPluginCallback } from "fastify";
import fastifyAuth from "fastify-auth";
import routesEndpoints from "../../config/routes/endpoints";
import {
	CreatePostBodySchema,
	EditPostParamsSchema,
	IdParamsSchema,
} from "../../config/schemas/posts";
import {
	ResponseSchemaWithData,
	ResponseSchemaWithErrors,
	ResponseSchemaWithSuccessMessage,
} from "../../config/schemas/shared";
import Post from "../../controllers/posts";
import { errorHandler } from "../../tools/fastify";
import {
	apiKeyValidation,
	checkPostOwnership,
	checkUserRole,
} from "../../tools/fastify-decorators";
import { extractUserFromJwt } from "../../tools/hooks/auth";
import { TCreatePostRoute, TEditPostRoute } from "../../types/posts";

const postsRoutes: FastifyPluginCallback = async server => {
	server.addHook("onRequest", extractUserFromJwt);
	server.register(fastifyAuth).after(() => {
		server.post<TCreatePostRoute>(
			routesEndpoints.posts.create.root,
			{
				onRequest: server.auth([checkUserRole("AUTHOR")]),
				schema: {
					body: CreatePostBodySchema,
					response: {
						"2xx": ResponseSchemaWithData,
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
		server.put<TEditPostRoute>(
			routesEndpoints.posts.edit.root,
			{
				onRequest: server.auth(
					[
						checkUserRole("AUTHOR"),
						checkPostOwnership({
							db: server.prisma,
							requestProp: "params",
						}),
					],
					{
						relation: "and",
					},
				),
				schema: {
					body: CreatePostBodySchema,
					response: {
						"2xx": ResponseSchemaWithSuccessMessage,
						"4xx": ResponseSchemaWithErrors,
					},
					params: EditPostParamsSchema,
				},
				errorHandler,
			},
			async (req, rep) => {
				const post = new Post(server.prisma);
				const { status, ...response } = await post.editOneById(
					req.body,
					req.params.id,
				);

				rep.status(status).send(response);
			},
		);
		server.delete<Pick<TEditPostRoute, "Params">>(
			routesEndpoints.posts.delete.root,
			{
				onRequest: server.auth(
					[
						checkUserRole("AUTHOR"),
						checkPostOwnership({
							db: server.prisma,
							requestProp: "params",
						}),
					],
					{
						relation: "and",
					},
				),
				schema: {
					response: {
						"2xx": ResponseSchemaWithSuccessMessage,
						"4xx": ResponseSchemaWithErrors,
					},
					params: EditPostParamsSchema,
				},
				errorHandler,
			},
			async (req, rep) => {
				const post = new Post(server.prisma);
				const { status, ...response } = await post.removeOneById(req.params.id);

				rep.status(status).send(response);
			},
		);
		server.get<Pick<TEditPostRoute, "Params">>(
			routesEndpoints.posts.list.one,
			{
				onRequest: server.auth([
					apiKeyValidation({
						db: server.prisma,
					}),
					checkPostOwnership({
						db: server.prisma,
						requestProp: "params",
					}),
				]),
				schema: {
					params: IdParamsSchema,
					response: {
						"2xx": ResponseSchemaWithData,
						"4xx": ResponseSchemaWithErrors,
					},
				},
				errorHandler,
			},
			async (req, rep) => {
				const post = new Post(server.prisma);
				const { status, ...response } = await post.getOneById(req.params.id);

				rep.status(status).send(response);
			},
		);
	});
};

export default postsRoutes;
