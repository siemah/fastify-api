import { FastifyInstance } from "fastify";
import fastifyCookie, { FastifyCookieOptions } from "fastify-cookie";
import fastifyJWT from "fastify-jwt";
import faker from "faker";
import apiKeysRoutes from ".";
import {
	fastifyCookieOptions,
	fastifyJWTOptions,
} from "../../config/fastify/ecosystem";
import routesEndpoints from "../../config/routes/endpoints";
import { createFastifyServer } from "../../tools/testing";
import { prismaMock } from "../../tools/testing/prisma/singleton";

describe("API Keys routes", () => {
	let server: FastifyInstance;
	const { create, root: apiKeyRoot } = routesEndpoints.apiKeys;

	beforeAll(async () => {
		server = createFastifyServer();
		const routeOptions = {
			prefix: apiKeyRoot,
		};
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

	describe("Create an API Key", () => {
		describe("Data validation", () => {
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
		describe("Database", () => {
			const apiKeyData = {
				title: faker.lorem.words(2),
				description: faker.lorem.words(5),
				domain: faker.internet.domainName(),
			};
			const apiKeyDataRow = {
				...apiKeyData,
				id: faker.datatype.number(),
			};

			beforeAll(() => {
				prismaMock.apiKeys.create.mockResolvedValue(apiKeyDataRow);
				server.prisma = prismaMock;
			});
			test("should create an api key and save it to the DB", async () => {
				const { statusCode, body } = await server
					.inject()
					.post(create.global)
					.payload(apiKeyData);
				const responseBody = JSON.parse(body);

				expect(statusCode).toBe(201);
				expect(responseBody).toHaveProperty("code", "success");
				expect(responseBody).toHaveProperty("message");
			});

			test("should respond with errors in case the process of creating an api key failed", async () => {
				prismaMock.apiKeys.create.mockRejectedValue(apiKeyData);
				server.prisma = prismaMock;
				const { statusCode, body } = await server
					.inject()
					.post(create.global)
					.payload(apiKeyData);
				const responseBody = JSON.parse(body);

				expect(statusCode).toBe(400);
				expect(responseBody).toHaveProperty("code", "failed");
				expect(responseBody).toHaveProperty("errors");
				expect(responseBody?.errors).toHaveProperty("global");
			});
		});
	});
});
