import { FastifyPluginAsync } from "fastify";
import { TSignUpRoute } from "../../types/users";
import { HTTPResponse } from "../../types/server";
import { errorHandler } from "../../tools/fastify";
import { SignUpSchema, SignUpResponse } from "../../config/schemas/users";

const usersRoutes: FastifyPluginAsync = async server => {
	server.post<TSignUpRoute>(
		"/signup",
		{
			schema: {
				body: SignUpSchema,
				response: {
					400: SignUpResponse,
				},
			},
			errorHandler,
		},
		async function (req, rep) {
			const { body: data } = req;
			let response: HTTPResponse<any>;
			let status = 201;

			try {
				await server.prisma.user.create({
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
				};
			} catch (error) {
				status = 400;
				response = {
					code: "failed",
					errors: {
						global:
							"Something went wrong, please try again check if your are not registred before!",
					},
				};
			}

			rep.status(status).send(response);
		},
	);
};

export default usersRoutes;
