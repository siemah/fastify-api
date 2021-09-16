import { FastifyInstance } from "fastify";
import routesEndpoints from "../../config/routes/endpoints";
import usersRoutes from ".";
import { createFastifyServer } from "../../tools/testing";

describe("Users routes:", () => {
	let server: FastifyInstance;
	const { signup, root: authRootEndpoint } = routesEndpoints.auth;

	beforeAll(() => {
		server = createFastifyServer();
		server.register(usersRoutes, { prefix: authRootEndpoint });
	});

	afterAll(async () => {
		await server.close();
	});

	describe("/signup errors responses", () => {
		test("should return global error of empty payload", async () => {
			const { statusCode, body, headers } = await server.inject().post(signup);
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
});
