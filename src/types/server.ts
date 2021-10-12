import { PrismaClient } from ".prisma/client";

interface HTTPResponseWithErrors {
	code: "failed" | "unauthorized";
	errors?: any;
}
interface HTTPResponseWithData<T = Record<string, any>> {
	code: "success";
	message?: string;
	data?: T;
}

export type HTTPResponse<T = void> = T extends void
	? HTTPResponseWithErrors
	: HTTPResponseWithData<T>;

export interface CheckPostOwnershipOptionsT {
	prisma: PrismaClient;
	requestProp: "params";
}
