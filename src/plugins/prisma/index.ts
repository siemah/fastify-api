import { PrismaClient } from "@prisma/client";
import { FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";

declare module "fastify" {
	interface FastifyInstance {
		prisma: PrismaClient;
	}
}

const prismaPlugin: FastifyPluginAsync = async server => {
	const prisma = new PrismaClient();

	try {
		await prisma.$connect();
		server.decorate("prisma", prisma);
		server.addHook("onClose", async () => {
			await prisma.$disconnect();
		});
	} catch (error) {
		server.log.error(error);
	}
};

export default fp(prismaPlugin);
