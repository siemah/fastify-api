import { FastifyInstance } from "fastify";
import fastifyCookie, { FastifyCookieOptions } from "fastify-cookie";
import fastifyJWT from "fastify-jwt";
import apiKeysRoutes from ".";
import { fastifyCookieOptions, fastifyJWTOptions } from "../../config/fastify/ecosystem";
import routesEndpoints from "../../config/routes/endpoints";
import { createFastifyServer } from "../../tools/testing";

describe('API Keys routes', () => {
	let server: FastifyInstance;
	const { create, root: apiKeyRoot } = routesEndpoints.apiKeys;

	beforeAll(async () => {
		server = createFastifyServer();
		const routeOptions = {
			prefix: apiKeyRoot
		}
		await server.register(
			fastifyCookie,
			fastifyCookieOptions.plugin as FastifyCookieOptions,
		);
		await server.register(fastifyJWT, fastifyJWTOptions.plugin);
		await server.register(apiKeysRoutes, routeOptions);
	});

	afterAll(async () => {
		await server.close();
	});

	describe('Create an API Key', () => {

		describe('Data validation', () => {

			test("should return global error of empty payload", async () => {
				const { statusCode, body, headers } = await server
					.inject()
					.post(create.global);
				const responseBody = JSON.parse(body);

				expect(statusCode).toBe(400);
				expect(headers).toHaveProperty(
					"content-type",
					"application/json; charset=utf-8",
				);
				expect(responseBody).toHaveProperty("errors");
				expect(responseBody?.errors).toHaveProperty("global");
			});

			test("should receive errors list", async () => {
				const { statusCode, body, headers } = await server
					.inject()
					.post(create.global)
					.payload({});
				const responseBody = JSON.parse(body);

				expect(statusCode).toBe(400);
				expect(headers).toHaveProperty(
					"content-type",
					"application/json; charset=utf-8",
				);
				expect(responseBody).toHaveProperty("errors");
				expect(responseBody?.errors).toHaveProperty("title");
				expect(responseBody?.errors).toHaveProperty("description");
				expect(responseBody?.errors).toHaveProperty("domain");
			});

		});

	});


});
