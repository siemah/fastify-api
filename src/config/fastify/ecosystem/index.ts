import { CookieSerializeOptions } from "fastify-cookie";
import { FastifyJWTOptions } from "fastify-jwt";
import { SignOptions, VerifyOptions } from "jsonwebtoken";

const week = 1000 * 3600 * 24 * 7;

const cookie: CookieSerializeOptions = {
	maxAge: Math.round((Date.now() + week) / 1000),
	httpOnly: true,
	sameSite: true,
	secure: process.env.NODE_ENV === "production",
	signed: true,
};
export const fastifyCookieOptions = {
	names: {
		auth: "__auth",
	},
	plugin: {
		secret: "cookie-secret",
		parseOptions: {},
	},
	cookie,
};

const jwtSign: SignOptions = {
	expiresIn: week / 1000,
	algorithm: "HS256",
};
const jwtVerify: VerifyOptions = {
	algorithms: ["HS256"],
	ignoreExpiration: false,
};
const jwtPlugin: FastifyJWTOptions = {
	secret: process.env.JWT_SECRET || "jwt-secret",
	cookie: {
		cookieName: fastifyCookieOptions.names.auth,
		signed: true,
	},
};
export const fastifyJWTOptions = {
	plugin: jwtPlugin,
	jwt: {
		sign: jwtSign,
		verify: jwtVerify,
	},
};
