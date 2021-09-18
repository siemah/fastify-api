import { FastifyInstance } from "fastify";
import fastifyCookie, { FastifyCookieOptions } from "fastify-cookie";
import faker from "faker";
import fastifyJWT from "fastify-jwt";
import routesEndpoints from "../../config/routes/endpoints";
import usersRoutes from ".";
import { createFastifyServer } from "../../tools/testing";
import { prismaMock } from "../../tools/testing/prisma/singleton";
import {
	fastifyCookieOptions,
	fastifyJWTOptions,
} from "../../config/fastify/ecosystem";

describe("Users routes:", () => {
	let server: FastifyInstance;
	const { signup, signin, root: authRootEndpoint } = routesEndpoints.auth;
	const userData = {
		email: faker.internet.email(),
		password: faker.internet.password(6),
		fullname: faker.name.findName(),
		bio: faker.lorem.words(6),
	};
	const userCreateData = {
		...userData,
		id: faker.datatype.number(),
	};

	beforeAll(async () => {
		server = createFastifyServer();
		await server.register(
			fastifyCookie,
			fastifyCookieOptions.plugin as FastifyCookieOptions,
		);
		await server.register(fastifyJWT, fastifyJWTOptions.plugin);
		await server.register(usersRoutes, { prefix: authRootEndpoint });
	});

	afterAll(async () => {
		await server.close();
	});

	describe("handle /signup requests", () => {
		describe("Validation", () => {
			test("should return global error of empty payload", async () => {
				const { statusCode, body, headers } = await server
					.inject()
					.post(signup);
				const responseBody = JSON.parse(body);

				expect(statusCode).toBe(400);
				expect(headers).toHaveProperty(
					"content-type",
					"application/json; charset=utf-8",
				);
				expect(responseBody).toHaveProperty("errors");
				expect(responseBody?.errors).toHaveProperty("global");
			});

			test("should return list of errors", async () => {
				const { statusCode, body } = await server
					.inject()
					.post(signup)
					.payload({});
				const responseBody = JSON.parse(body);
				expect(statusCode).toBe(400);
				expect(responseBody).toHaveProperty("errors");
				expect(responseBody?.errors).toHaveProperty("email");
				expect(responseBody?.errors).toHaveProperty("password");
			});
		});

		describe("Database", () => {
			beforeAll(() => {
				prismaMock.user.create.mockResolvedValue(userCreateData);
				server.prisma = prismaMock;
			});

			test("should signup with success", async () => {
				const { statusCode, body } = await server
					.inject()
					.post(signup)
					.payload(userData);
				const responseBody = JSON.parse(body);

				expect(statusCode).toBe(201);
				expect(responseBody).toHaveProperty("code", "success");
				expect(responseBody).toHaveProperty("message");
			});

			test("should failed to signup", async () => {
				prismaMock.user.create.mockRejectedValue(userCreateData);
				server.prisma = prismaMock;
				const { statusCode, body } = await server
					.inject()
					.post(signup)
					.payload(userData);
				const responseBody = JSON.parse(body);

				expect(statusCode).toBe(400);
				expect(responseBody).toHaveProperty("code", "failed");
				expect(responseBody).toHaveProperty("errors");
				expect(responseBody?.errors).toHaveProperty("global");
			});
		});
	});

	describe("handle /signin requests", () => {
		describe("Validation", () => {
			test("should return global error of empty payload", async () => {
				const { statusCode, body, headers } = await server
					.inject()
					.post(signin.global);
				const responseBody = JSON.parse(body);

				expect(statusCode).toBe(400);
				expect(headers).toHaveProperty(
					"content-type",
					"application/json; charset=utf-8",
				);
				expect(responseBody).toHaveProperty("errors");
				expect(responseBody?.errors).toHaveProperty("global");
			});

			test("should send an errors", async () => {
				const { statusCode, body, headers } = await server
					.inject()
					.post(signin.global)
					.payload({});
				const responseBody = JSON.parse(body);

				expect(statusCode).toBe(400);
				expect(headers).toHaveProperty(
					"content-type",
					"application/json; charset=utf-8",
				);
				expect(responseBody).toHaveProperty("errors");
				expect(responseBody?.errors).toHaveProperty("email");
				expect(responseBody?.errors).toHaveProperty("password");
			});
		});

		describe("Database", () => {
			test("should failed to signin because of email/password", async () => {
				prismaMock.user.findUnique.mockResolvedValue(null);
				server.prisma = prismaMock;
				const { statusCode, body } = await server
					.inject()
					.post(signin.global)
					.payload(userData);
				let responseBody = JSON.parse(body);

				expect(statusCode).toBe(400);
				expect(responseBody).toHaveProperty("code", "failed");
				expect(responseBody).toHaveProperty("errors", {
					global: "Your credentials are not correct",
				});

				prismaMock.user.findUnique.mockResolvedValue({
					email: userData.email,
					password: faker.internet.password(7),
				});
				server.prisma = prismaMock;
				const { body: body2 } = await server
					.inject()
					.post(signin.global)
					.payload(userData);
				responseBody = JSON.parse(body2);
				expect(responseBody).toHaveProperty("code", "failed");
				expect(responseBody).toHaveProperty("errors", {
					global: "Your credentials are not correct",
				});
			});

			test("should DB failure", async () => {
				const errorsResopnse = {
					code: "failed",
					errors: {
						global: "Please try again!",
					},
				};
				prismaMock.user.findUnique.mockRejectedValue(errorsResopnse);
				server.prisma = prismaMock;
				const { statusCode, body } = await server
					.inject()
					.post(signin.global)
					.payload(userData);
				const responseBody = JSON.parse(body);

				expect(statusCode).toBe(400);
				expect(responseBody).toHaveProperty("code", "failed");
				expect(responseBody).toHaveProperty("errors", errorsResopnse.errors);
			});

			test("should signin with success", async () => {
				prismaMock.user.findUnique.mockResolvedValue(userData);
				server.prisma = prismaMock;
				const { statusCode, body, headers } = await server
					.inject()
					.post(signin.global)
					.payload(userData);
				const responseBody = JSON.parse(body);

				expect(statusCode).toBe(200);
				expect(responseBody).toHaveProperty("code", "success");
				expect(headers["set-cookie"]?.[0]).toContain(
					`${fastifyCookieOptions.names.auth}=`,
				);
			});

			test("should prevent signedin user to reach \"/signin\" or \"/signup\"", async () => {
				prismaMock.user.findUnique.mockResolvedValue(userCreateData);
				server.prisma = prismaMock;
				// this get user jwt token an use it in 2nd request(line 199)
				const { headers } = await server
					.inject()
					.post(signin.global)
					.payload(userData);

				const { statusCode, body } = await server
					.inject({
						headers: {
							cookie: headers["set-cookie"]?.[1],
						},
					})
					.post(signin.global)
					.payload(userData);
				const responseBody = JSON.parse(body);

				expect(statusCode).toBe(403);
				expect(responseBody).toHaveProperty("code", "failed");
				expect(responseBody).toHaveProperty("errors", {
					global: "You're already signed in",
				});
			});
		});
	});
});
