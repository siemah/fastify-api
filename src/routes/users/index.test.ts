import { FastifyInstance } from "fastify";
import faker from "faker";
import routesEndpoints from "../../config/routes/endpoints";
import usersRoutes from ".";
import { createFastifyServer } from "../../tools/testing";
import { prismaMock } from "../../tools/testing/prisma/singleton";

describe("Users routes:", () => {
	let server: FastifyInstance;
	const { signup, root: authRootEndpoint } = routesEndpoints.auth;
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
});
