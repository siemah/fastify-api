const week = 1000 * 3600 * 24 * 7;

export const fastifyCookieOptions = {
	names: {
		auth: "__auth",
	},
	plugin: {
		secret: "cookie-secret",
		parseOptions: {},
	},
	cookie: {
		expire: new Date(Date.now() + week),
		httpOnly: true,
		sameSite: true,
		secure: process.env.NODE_ENV === "production",
	},
};

export const fastifyJWTOptions = {
	plugin: {
		secret: "jwt-secret",
	},
};
