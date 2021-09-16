import { FastifyPluginAsync } from "fastify";
import { TSignUpRoute } from "../../types/users";
import { HTTPResponse } from "../../types/server";
import { errorHandler } from "../../tools/fastify";
import { SignUpSchema, SignUpResponse } from "../../config/schemas/users";
import UserProfile from "../../controllers/users";

const usersRoutes: FastifyPluginAsync = async server => {
	server.post<TSignUpRoute>(
		"/signup",
		{
			schema: {
				body: SignUpSchema,
				response: {
					400: SignUpResponse,
					201: SignUpResponse,
				},
			},
			errorHandler,
		},
		async function (req, rep) {
			let response: HTTPResponse<any>;
			let status;

			try {
				const userProfile = new UserProfile(server.prisma);
				const { status: createStatus, ...createResponse } =
					await userProfile.createUser(req.body);
				response = createResponse;
				status = createStatus;
			} catch (error) {
				status = 400;
				response = {
					code: "failed",
				};
			}

			rep.status(status).send(response);
		},
	);
};

export default usersRoutes;
