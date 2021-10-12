import crypto from "crypto";
import { PrismaClient, ApiKeys } from ".prisma/client";
import { HTTPResponseI } from "../../types/shared";
import ENV_VARS from "../../config/constants/env";

export default class ApiKey {
	protected prisma: PrismaClient;

	constructor(prisma: PrismaClient) {
		this.prisma = prisma;
	}

	/**
	 * Create an API Key
	 * @param data detail about the requested API key like title description...
	 * @param userId user id
	 */
	async createOneByUser(
		data: Pick<ApiKeys, "title" | "domain" | "description">,
		userId: number,
	): Promise<HTTPResponseI> {
		let response: HTTPResponseI;

		try {
			const key = this.createAPIKey(`${Date.now()}-${userId}`);
			await this.prisma.apiKeys.create({
				data: {
					title: data.title,
					description: data.description,
					domain: data.domain,
					key,
					user: {
						connect: {
							id: userId,
						},
					},
				},
			});
			response = {
				code: "success",
				status: 201,
				message: "Your are created an API Key with success",
				data: {
					key,
				},
			};
		} catch (error) {
			response = {
				code: "failed",
				status: 400,
				errors: {
					global: "something went wrong, please try again",
				},
			};
		}

		return response;
	}

	/**
	 * Create an api key
	 * @param data the data to be hashed
	 * @returns the hashed value
	 */
	protected createAPIKey(data: string, secret?: string): string {
		const apiKey = crypto
			.createHmac("sha256", secret || ENV_VARS.apiKeyHmacSecret)
			.update(data)
			.digest("base64");

		return `PA_${apiKey}`;
	}
}
