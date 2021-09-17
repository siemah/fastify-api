import {
	FastifyReply,
	FastifyRequest,
	FastifyError,
	ValidationResult,
} from "fastify";
import { HTTPResponse } from "../../types/server";

/**
 * Get error message and the field(prop) caused it from fastify validation
 * @param error list of errors returned by fastify due to request validation
 * @returns error message with its field name
 */
const getErrorMessageFromFastifyValidation = (error: ValidationResult) => {
	let errorPath, prop;

	try {
		if (error.dataPath !== "") {
			errorPath = error.dataPath;
		} else if (error.params?.missingProperty) {
			errorPath = error.params?.missingProperty;
			// @ts-expect-error this type not included in fastify
		} else if (error.params.errors[0].dataPath) {
			// @ts-expect-error this type not included in fastify
			errorPath = error.params.errors[0].dataPath;
			// @ts-expect-error this type not included in fastify
		} else if (error.params.errors[0].params?.missingProperty) {
			// @ts-expect-error this type not included in fastify
			errorPath = error.params.errors[0].params.missingProperty;
			// @ts-expect-error this type not included in fastify
		} else {
			errorPath = "";
		}

		prop = errorPath === "" ? "global" : errorPath.replace(/[/.]/, "");
	} catch (e) {
		prop = "global";
		error.message = "Sorry about this, please try again";
	}

	return {
		[prop]: error.message,
	};
};

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
): void => {
	const { validation } = error;
	const response: HTTPResponse = {
		code: "failed",
		errors: error,
	};

	if (validation !== undefined) {
		response.errors = {};
		validation.forEach(error => {
			const errorMessage = getErrorMessageFromFastifyValidation(error);
			response.errors = {
				...response.errors,
				...errorMessage,
			};
		});
	} else {
		response.errors = {
			global: error.message,
		};
	}

	reply.status(400).send(response);
};
