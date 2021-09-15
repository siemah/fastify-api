import { FastifyReply, FastifyRequest, FastifyError } from "fastify";
import { HTTPResponse } from "../../types/server";

/**
 * Handle errors catch by fastify
 * @param error fastify error instance
 * @param request incoming request
 * @param reply response
 */
export const errorHandler = (
	error: FastifyError,
	request: FastifyRequest,
	reply: FastifyReply,
) => {
	const { validation } = error;
	const response: HTTPResponse = {
		code: "failed",
		errors: error,
	};

	if (validation !== undefined) {
		response.errors = {};
		validation.forEach(error => {
			const errorPath: string =
				error.dataPath.length !== 0
					? error.dataPath
					: error.params?.missingProperty ||
					  // @ts-expect-error this type not included in fastify
					  error.params.errors[0].params.missingProperty ||
					  // @ts-expect-error this type not included in fastify
					  error.params.errors[0].dataPath;
			const prop = errorPath === "" ? "global" : errorPath.replace(/[/.]/, "");

			response.errors = {
				...response.errors,
				[prop]: error.message,
			};
		});
	} else {
		response.errors = {
			global: error.message,
		};
	}

	reply.status(400).send(response);
};
