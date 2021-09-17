import { FastifyPluginAsync } from "fastify";
import { TSignInRoute, TSignUpRoute } from "../../types/users";
import { HTTPResponse } from "../../types/server";
import { errorHandler } from "../../tools/fastify";
import {
	SignUpSchema,
	SignUpResponse,
	SignInSchema,
} from "../../config/schemas/users";
import UserProfile from "../../controllers/users";
import routesEndpoints from "../../config/routes/endpoints";
import { fastifyCookieOptions } from "../../config/fastify/ecosystem";

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
	server.post<TSignInRoute>(
		routesEndpoints.auth.signin.root,
		{
			schema: {
				body: SignInSchema,
				response: {
					400: SignUpResponse,
					201: SignUpResponse,
				},
			},
			errorHandler,
		},
		async (req, rep) => {
			let response: HTTPResponse<void | Record<string, any>>;
			let status;
			let jwtToken;

			try {
				const userProfile = new UserProfile(server.prisma);
				const res = await userProfile.getUser({ email: req.body.email });

				if (res?.code === "success" && res?.data !== null) {
					if (req.body.password === res.data?.password) {
						status = 200;
						response = {
							code: "success",
							message: "Signin with success",
						};
						jwtToken = server.jwt.sign(res.data as Record<string, any>);
						rep.setCookie(
							fastifyCookieOptions.names.auth,
							jwtToken,
							fastifyCookieOptions.cookie,
						);
					} else {
						status = 400;
						response = {
							code: "failed",
							errors: {
								global: "Your credentials are not correct",
							},
						};
					}
				} else if (res?.code === "success") {
					status = 400;
					response = {
						code: "failed",
						errors: {
							global: "Your credentials are not correct",
						},
					};
					status = 400;
				} else {
					status = 400;
					response = {
						code: "failed",
						errors: res.errors,
					};
				}
			} catch (error) {
				status = 400;
				response = {
					code: "failed",
					errors: {
						global: "Something went wrong!",
					},
				};
			}

			rep.status(status).send(response);
		},
	);
};

export default usersRoutes;
