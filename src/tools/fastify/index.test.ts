import { FastifyError } from "fastify";
import faker from "faker";
import { errorHandler } from ".";

describe("Fastiy tools", () => {
	describe("errorHandler", () => {
		const status = jest.fn((a: number) => reply);
		const send = jest.fn((a: any) => a);
		const reply: any = {
			status,
			send,
		};
		const error: FastifyError = {
			validation: [
				{
					dataPath: faker.random.word(),
					keyword: faker.random.word(),
					message: faker.random.words(5),
					schemaPath: faker.random.word(),
					params: {},
				},
			],
		};

		test("should catch error from \"dataPath\"", () => {
			errorHandler(error, undefined as any, reply);
			expect(status).toHaveBeenCalled();
			expect(send).toHaveBeenCalledWith({
				code: "failed",
				errors: {
					[error.validation[0].dataPath]: error.validation[0].message,
				},
			});
		});

		test("should catch error from \"missingProperty\"", () => {
			const missingProperty = faker.random.word();
			error.validation[0].dataPath = "";
			error.validation[0].params = {
				missingProperty,
			};

			errorHandler(error, undefined as any, reply);
			expect(status).toHaveBeenCalled();
			expect(send).toHaveBeenCalledWith({
				code: "failed",
				errors: {
					[missingProperty]: error.validation[0].message,
				},
			});
		});

		test("should catch error from \"missingProperty\"", () => {
			const missingProperty = faker.random.word();
			error.validation[0].dataPath = "";
			error.validation[0].params = {
				missingProperty,
			};

			errorHandler(error, undefined as any, reply);
			expect(status).toHaveBeenCalledWith(400);
			expect(send).toHaveBeenCalledWith({
				code: "failed",
				errors: {
					[missingProperty]: error.validation[0].message,
				},
			});

			error.validation[0].params = {
				missingProperty: "",
				params: {
					missingProperty,
				},
			};
			expect(send).toHaveBeenCalledWith({
				code: "failed",
				errors: {
					[missingProperty]: error.validation[0].message,
				},
			});
		});

		test("should catch error from \"missingProperty\"", () => {
			const dataPath = faker.random.word();
			error.validation[0].dataPath = "";
			error.validation[0].params = {
				errors: [
					{
						dataPath,
					},
				],
			};

			errorHandler(error, undefined as any, reply);
			expect(status).toHaveBeenCalledWith(400);
			expect(send).toHaveBeenCalledWith({
				code: "failed",
				errors: {
					[dataPath]: error.validation[0].message,
				},
			});
		});

		test("should catch any other errors except of validation errors", () => {
			const dataPath = faker.random.word();
			error.validation = undefined;

			errorHandler(error, undefined as any, reply);
			expect(status).toHaveBeenCalledWith(400);
			expect(send).toHaveBeenCalledWith({
				code: "failed",
				errors: {
					global: error.message,
				},
			});
		});
	});
});
