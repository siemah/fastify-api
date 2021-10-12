import { User } from ".prisma/client";
import { FastifyReply, FastifyRequest } from "fastify";
import {
	fastifyCookieOptions,
	fastifyJWTOptions,
} from "../../../config/fastify/ecosystem";

/**
 * Check if user has signed in
 * @param req fastify request
 * @param rep fastify reply
 */
export async function checkSignInState(
	req: FastifyRequest,
	rep: FastifyReply,
): Promise<void> {
	try {
		const user = await req.jwtVerify<Pick<User, "id">>(
			fastifyJWTOptions.jwt.verify,
		);

		if (user !== null && user?.id) {
			return rep.status(403).send({
				code: "failed",
				errors: {
					global: "You're already signed in",
				},
			});
		}
	} catch (error) {
		rep.clearCookie(fastifyCookieOptions.names.auth);
	}
}
