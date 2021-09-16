import createFastifyServer from "fastify";
import fastifyFactoryOptions from "./config/fastify";
import routesEndpoints from "./config/routes/endpoints";
import prisma from "./plugins/prisma";

import usersRoutes from "./routes/users";

const app = createFastifyServer(fastifyFactoryOptions);

app.register(prisma);
app.register(usersRoutes, { prefix: routesEndpoints.auth.root });

export default app;
