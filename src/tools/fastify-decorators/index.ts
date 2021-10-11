import { FastifyRequest } from "fastify";
import { fastifyJWTOptions } from "../../config/fastify/ecosystem";
import HttpResponseError from "../error";

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
