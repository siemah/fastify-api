import createFastifyServer from "fastify";
import fastifyCookie from "fastify-cookie";
import fastifyJWT from "fastify-jwt";

import fastifyFactoryOptions from "./config/fastify";
import {
	fastifyCookieOptions,
	fastifyJWTOptions,
} from "./config/fastify/ecosystem";
import routesEndpoints from "./config/routes/endpoints";
import prisma from "./plugins/prisma";
import apiKeysRoutes from "./routes/api-keys";
import postsRoutes from "./routes/posts";
import usersRoutes from "./routes/users";

const app = createFastifyServer(fastifyFactoryOptions);

app.register(fastifyCookie, fastifyCookieOptions.plugin);
app.register(fastifyJWT, fastifyJWTOptions.plugin);
app.register(prisma);
app.register(usersRoutes, { prefix: routesEndpoints.auth.root });
app.register(apiKeysRoutes, { prefix: routesEndpoints.apiKeys.root });
app.register(postsRoutes, { prefix: routesEndpoints.posts.root });

export default app;
