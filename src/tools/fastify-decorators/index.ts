import { FastifyRequest } from "fastify";
import { PrismaClient, User } from ".prisma/client";
import { fastifyJWTOptions } from "../../config/fastify/ecosystem";
import { TEditPostRoute } from "../../types/posts";
import HttpResponseError from "../error";
import {
	ApiKeyValidationOptions,
	CheckPostOwnershipOptionsT,
} from "../../types/server";

/**
 * Check if the user signed in with "developer" role
 * @param req Fastify request instance
 */
export function checkUserRole(role: "DEVELOPER" | "AUTHOR") {
	return async function (req: FastifyRequest): Promise<any> {
		try {
			const user = await req.jwtVerify<{
				id: number;
				role: "DEVELOPER" | "AUTHOR";
			}>(fastifyJWTOptions.jwt.verify);

			if (user === null || !user.id || user.role !== role) {
				throw new HttpResponseError({
					code: "unauthorized",
					status: 401,
					errors: {
						global: "You're not authorized to reach this resource",
					},
				});
			}
		} catch (error) {
			throw HttpResponseError.getResponse(error, {
				code: "unauthorized",
				status: 401,
				errors: {
					global: "Please signin first then try again",
				},
			});
		}
	};
}

/**
 * Check the ownership of the current post passed via req.params.id
 * @param options contain connexion to DB
 */
export function checkPostOwnership<R = any>(
	options: CheckPostOwnershipOptionsT,
) {
	return async (
		req: FastifyRequest<
			R extends Pick<TEditPostRoute, "Params">
				? Pick<TEditPostRoute, "Params">
				: any
		>,
	): Promise<void> => {
		try {
			const { id: userId } = <Pick<User, "id">>req.user;
			const results = await options.db.post.findFirst({
				where: {
					authorId: userId,
					id: Number(req?.[options.requestProp].id),
				},
				select: {
					id: true,
				},
			});

			if (!!results?.id !== true) {
				throw new HttpResponseError({
					code: "unauthorized",
					status: 401,
					errors: {
						global: "You're not authorized to reach this resource",
					},
				});
			}
		} catch (error) {
			console.log("checkownership", error);
			throw HttpResponseError.getResponse(error, {
				code: "unauthorized",
				status: 401,
				errors: {
					global: "Please signin first then try again",
				},
			});
		}
	};
}

/**
 * Validate user API Key
 * @param db instance and header name of the api key
 * @returns hook used with fastify-auth
 */
export function apiKeyValidation({
	db,
	headerName = "x-api-key",
}: ApiKeyValidationOptions) {
	return async function (req: FastifyRequest): Promise<void> {
		try {
			const apiKey = String(req.headers[headerName]);
			const result = await db.apiKeys.findUnique({
				where: {
					key: apiKey,
				},
				select: {
					domain: true,
				},
			});
			if (result === null) {
				throw new Error("unauthorized");
			}
		} catch (error) {
			throw HttpResponseError.getResponse(error, {
				code: "unauthorized",
				status: 401,
				errors: {
					global: "You're not authorized to reach this resource",
				},
			});
		}
	};
}
