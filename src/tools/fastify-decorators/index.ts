import { FastifyReply, FastifyRequest } from "fastify";
import { User } from ".prisma/client";
import { fastifyJWTOptions } from "../../config/fastify/ecosystem";
import { TEditPostRoute } from "../../types/posts";
import HttpResponseError from "../error";
import { CheckPostOwnershipOptionsT } from "../../types/server";

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
		const { id: userId } = <Pick<User, "id">>req.user;

		try {
			const results = await options.prisma.post.findFirst({
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
