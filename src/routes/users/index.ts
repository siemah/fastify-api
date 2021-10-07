import { FastifyPluginAsync } from "fastify";
import { TSignInRoute, TSignUpRoute } from "../../types/users";
import { HTTPResponse } from "../../types/server";
import { errorHandler } from "../../tools/fastify";
import {
	SignUpSchema,
	SignInSchema,
} from "../../config/schemas/users";
import UserProfile from "../../controllers/users";
import routesEndpoints from "../../config/routes/endpoints";
import {
	fastifyCookieOptions,
	fastifyJWTOptions,
} from "../../config/fastify/ecosystem";
import { User } from ".prisma/client";
import { ResponseSchemaWithErrors, ResponseSchemaWithSuccessMessage } from "../../config/schemas/shared";

const usersRoutes: FastifyPluginAsync = async server => {
	server.addHook("onRequest", async function (req, rep) {
		try {
			const user = await req.jwtVerify<Pick<User, "id">>(
				fastifyJWTOptions.jwt.verify,
			);

			if (user !== null && user?.id) {
				rep.status(403).send({
					code: "failed",
					errors: {
						global: "You're already signed in",
					},
				});
			}
		} catch (error) {
			rep.clearCookie(fastifyCookieOptions.names.auth);
		}
	});
	server.post<TSignUpRoute>(
		"/signup",
		{
			schema: {
				body: SignUpSchema,
				response: {
					400: ResponseSchemaWithErrors,
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
			schema: {
				body: SignInSchema,
				response: {
					400: ResponseSchemaWithErrors,
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
			const res = await userProfile.getUser({ email: req.body.email });

			if (res?.code === "success" && res?.data !== null) {
				if (req.body.password === res.data?.password) {
					status = 200;
					response = {
						code: "success",
						message: "Signin with success",
					};
					jwtToken = await rep.jwtSign(
						{ id: res.data?.id },
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
};

export default usersRoutes;
