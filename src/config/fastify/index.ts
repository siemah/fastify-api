import { FastifyServerOptions } from "fastify";

const fastifyFactoryOptions: FastifyServerOptions = {
	ajv: {
		customOptions: {
			allErrors: true,
			jsonPointers: true,
		},
		plugins: [require("ajv-errors")],
	},
};

if (process.env.NODE_ENV === "development") {
	fastifyFactoryOptions.logger = {
		level: "info",
	};
}

export default fastifyFactoryOptions;
