import { PrismaClient } from ".prisma/client";
import { HTTPResponse } from "../../types/server";

export default class UserProfile {
	protected prisma: PrismaClient;

	constructor(prisma: PrismaClient) {
		this.prisma = prisma;
	}

	/**
	 * Create new user by saving data to user and profile tables
	 * @param data user details
	 * @returns response schema
	 */
	async createUser(data: any): Promise<HTTPResponse<any> & { status: number }> {
		let response: HTTPResponse<any>;
		let status = 201;

		try {
			const userData = await this.prisma.user.create({
				data: {
					email: data.email,
					fullname: data.fullname,
					password: data.password,
					profile: {
						create: {
							bio: data.bio,
						},
					},
				},
				include: {
					profile: true,
				},
			});
			response = {
				code: "success",
				message: "You have registred with success",
				data: userData,
			};
		} catch (error) {
			status = 400;
			response = {
				code: "failed",
				errors: {
					global: "Please check if your are not registred before then try!",
				},
			};
		}

		return {
			status,
			...response,
		};
	}
}
