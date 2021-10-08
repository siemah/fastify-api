import { PrismaClient, User } from ".prisma/client";
import { HTTPResponse } from "../../types/server";

type HTTPResponseU = (HTTPResponse | HTTPResponse<Record<string, any>>) & {
	status: number;
};
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
	async createUser(data: any): Promise<HTTPResponseU> {
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

	/**
	 * Retrieve user details by his email/id
	 * @param data object with email/id of user
	 * @returns http response schema of fetched user
	 */
	async getSignInDetails(data: Partial<User>): Promise<HTTPResponseU> {
		let response: HTTPResponse<any>;
		let status = 200;

		try {
			const userData = await this.prisma.user.findUnique({
				where: data,
				select: {
					id: true,
					password: true,
					profile: {
						select: {
							role: true,
						},
					},
				},
			});

			response = {
				code: "success",
				data: userData,
			};
		} catch (error) {
			status = 400;
			response = {
				code: "failed",
				errors: {
					global: "Please try again!",
				},
			};
		}

		return {
			status,
			...response,
		};
	}
}
