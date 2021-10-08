import { HTTPResponse } from "../../types/server";

type ContentTypeTypes = "json" | "text";
type HTTPErrorResponseT = HTTPResponse<void> & { status: number };

/**
 * Custom error based on native Error to
 * handle http response
 */
export default class HttpResponseError extends Error {
	public name: string;
	protected error: HTTPErrorResponseT;
	protected contentType: ContentTypeTypes = "json";

	constructor(
		errorDetails: HTTPErrorResponseT,
		contentType: ContentTypeTypes = "json",
	) {
		super(errorDetails.code);
		this.name = "HttpResponseError";
		this.error = errorDetails;
		this.contentType = contentType;
	}

	/**
	 * Get the errors to send
	 * @returns errors
	 */
	getErrors() {
		return this.error.errors;
	}

	/**
	 * Return the status code of the response
	 * @returns number 1xx - 5xx
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status
	 */
	getStatus() {
		return this.error.status;
	}

	/**
	 * Get the code of the response
	 * @returns status code like "failed" or "success"
	 */
	getCode() {
		return this.error.code;
	}

	/**
	 * Retrieve the content type of the response
	 * @returns "json" | "text"
	 */
	getContentType() {
		return this.contentType;
	}

	/**
	 * Construct a response based on thrown error
	 * @param error thrown error
	 * @returns {HTTPResponse}
	 */
	static getResponse(
		error: Error | HttpResponseError,
		defaultResponse?: HTTPErrorResponseT,
	): HTTPErrorResponseT {
		const response: HTTPResponse & { status: number } = {
			code: defaultResponse?.code || "failed",
			status: defaultResponse?.status || 400,
		};

		if (error instanceof HttpResponseError) {
			response.status = error.getStatus();
			response.code = error.getCode();
			response.errors = error.getErrors();
		} else {
			response.errors = {
				global:
					defaultResponse?.errors?.global ||
					"Something went wrong, please try again.",
			};
		}

		return response;
	}
}
