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
import usersRoutes from "../users";
import { OutgoingHttpHeaders } from "http2";

describe("API Keys routes", () => {
	let server: FastifyInstance;
	const { create, root: apiKeyRoot } = routesEndpoints.apiKeys;

	beforeAll(async () => {
		server = createFastifyServer();
		const routeOptions = {
			prefix: apiKeyRoot,
		};
		await server.register(fastifyJWT, fastifyJWTOptions.plugin);
		await server.register(
			fastifyCookie,
			fastifyCookieOptions.plugin as FastifyCookieOptions,
		);
		await server.register(usersRoutes, { prefix: routesEndpoints.auth.root });
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
			const userData = {
				email: faker.internet.email(),
				password: faker.internet.password(6),
				fullname: faker.name.findName(),
				bio: faker.lorem.words(6),
			};
			const userCreateData = {
				...userData,
				id: faker.datatype.number(),
				profile: {
					role: "DEVELOPER",
				},
			};
			let signInHeaders: OutgoingHttpHeaders;

			beforeAll(async () => {
				prismaMock.apiKeys.create.mockResolvedValue(apiKeyDataRow);
				prismaMock.user.findUnique.mockResolvedValue(userCreateData);
				server.prisma = prismaMock;
				// get user jwt token then use it in 2nd request(line 125) to get permission
				const { headers } = await server
					.inject()
					.post(routesEndpoints.auth.signin.global)
					.payload(userData);
				signInHeaders = {
					cookie: (<string[]>headers?.["set-cookie"])?.[1],
				};
			});
			test("should prohabit creating an API Key because user are not signed in", async () => {
				const { statusCode, body } = await server
					.inject()
					.post(create.global)
					.payload(apiKeyData);
				const responseBody = JSON.parse(body);

				expect(statusCode).toBe(401);
				expect(responseBody).toHaveProperty("code", "unauthorized");
				expect(responseBody).toHaveProperty("errors");
			});
			test("should create an api key and save it to the DB", async () => {
				const { statusCode, body } = await server
					.inject()
					.headers(signInHeaders)
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
					.headers(signInHeaders)
					.post(create.global)
					.payload(apiKeyData);
				const responseBody = JSON.parse(body);

				expect(statusCode).toBe(400);
				expect(responseBody).toHaveProperty("code", "failed");
				expect(responseBody).toHaveProperty("errors");
				expect(responseBody?.errors).toHaveProperty("global");
			});
			test("should prevent user from creating an API Key because of his role", async () => {
				prismaMock.user.findUnique.mockResolvedValue({
					...userCreateData,
					profile: {
						role: "AUTHOR",
					},
				});
				server.prisma = prismaMock;
				// get user jwt token an use it in 2nd request(line 167) to get permission
				const { headers } = await server
					.inject()
					.post(routesEndpoints.auth.signin.global)
					.payload(userData);
				signInHeaders = {
					cookie: (<string[]>headers?.["set-cookie"])?.[1],
				};
				const { statusCode, body } = await server
					.inject()
					.headers(signInHeaders)
					.post(create.global)
					.payload(apiKeyData);
				const responseBody = JSON.parse(body);

				expect(statusCode).toBe(401);
				expect(responseBody).toHaveProperty("code", "unauthorized");
				expect(responseBody).toHaveProperty("errors");
			});
		});
	});
});
