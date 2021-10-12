import { FastifyPluginAsync } from "fastify";
import fastifyAuth from "fastify-auth";
import { TSignInRoute, TSignUpRoute } from "../../types/users";
import { HTTPResponse } from "../../types/server";
import { errorHandler } from "../../tools/fastify";
import { SignUpSchema, SignInSchema } from "../../config/schemas/users";
import UserProfile from "../../controllers/users";
import routesEndpoints from "../../config/routes/endpoints";
import {
	fastifyCookieOptions,
	fastifyJWTOptions,
} from "../../config/fastify/ecosystem";
import {
	ResponseSchemaWithErrors,
	ResponseSchemaWithSuccessMessage,
} from "../../config/schemas/shared";
import { checkSignInState } from "../../tools/hooks/auth";

const usersRoutes: FastifyPluginAsync = async server => {
	server.register(fastifyAuth).after(() => {
		server.post<TSignUpRoute>(
			"/signup",
			{
				onRequest: server.auth([checkSignInState]),
				schema: {
					body: SignUpSchema,
					response: {
						"4xx": ResponseSchemaWithErrors,
						201: ResponseSchemaWithSuccessMessage,
					},
				},
				errorHandler,
			},
			async function (req, rep) {
				const userProfile = new UserProfile(server.prisma);
				const { status, ...response } = await userProfile.createUser(req.body);

				rep.status(status).send(response);
			},
		);
		server.post<TSignInRoute>(
			routesEndpoints.auth.signin.root,
			{
				onRequest: server.auth([checkSignInState]),
				schema: {
					body: SignInSchema,
					response: {
						"4xx": ResponseSchemaWithErrors,
						201: ResponseSchemaWithSuccessMessage,
					},
				},
				errorHandler,
			},
			async (req, rep) => {
				let response: HTTPResponse<void | Record<string, any>>;
				let status;
				let jwtToken;

				const userProfile = new UserProfile(server.prisma);
				const res = await userProfile.getSignInDetails({
					email: req.body.email,
				});

				if (res?.code === "success" && res?.data !== null) {
					if (req.body.password === res.data?.password) {
						status = 200;
						response = {
							code: "success",
							message: "Signin with success",
						};
						jwtToken = await rep.jwtSign(
							{
								id: res.data?.id,
								role: res.data?.profile?.role,
							},
							fastifyJWTOptions.jwt.sign,
						);
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
				} else {
					status = 400;
					response = {
						code: "failed",
						errors: res.errors,
					};
				}

				rep.status(status).send(response);
			},
		);
	});
	server.get(routesEndpoints.auth.signout.root, (req, rep) => {
		const { cookie, names } = fastifyCookieOptions;

		rep.clearCookie(names.auth, cookie);
		rep.status(200).send();
	});
};

export default usersRoutes;
