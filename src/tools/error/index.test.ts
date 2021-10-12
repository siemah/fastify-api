import faker from "faker";
import HttpResponseError from ".";

describe("HttpResponseError", () => {
	test("should return a default error", () => {
		const msg = faker.random.words(5);
		let response;

		try {
			throw new Error(msg);
		} catch (error) {
			response = HttpResponseError.getResponse(error);
		}
		expect(response).toHaveProperty("code", "failed");
		expect(response).toHaveProperty("status", 400);
		expect(response).toHaveProperty("errors", {
			global: "Something went wrong, please try again.",
		});
	});

	test("should return a default error passed with error", () => {
		const msg = faker.random.words(5);
		const errorsList = {
			status: 500,
			code: "failed",
			errors: {
				global: msg,
			},
		};
		let response;

		try {
			throw new Error(msg);
		} catch (error) {
			response = HttpResponseError.getResponse(error, errorsList as any);
		}
		expect(response).toHaveProperty("code", errorsList.code);
		expect(response).toHaveProperty("status", errorsList.status);
		expect(response).toHaveProperty("errors", errorsList.errors);
	});

	test("should return errors from HttpResponseError instance", () => {
		const msg = faker.random.words(5);
		const errorsList = {
			status: 401,
			code: "unauthorized",
			errors: {
				global: msg,
			},
		};
		let response;
		const httpResponseError = new HttpResponseError(errorsList as any);

		try {
			throw httpResponseError;
		} catch (error) {
			response = HttpResponseError.getResponse(error);
		}
		expect(httpResponseError.getContentType()).toBe("json");
		expect(response).toHaveProperty("code", errorsList.code);
		expect(response).toHaveProperty("status", errorsList.status);
		expect(response).toHaveProperty("errors", errorsList.errors);
	});
});
