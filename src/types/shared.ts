import { HTTPResponse } from "./server";

export type HTTPResponseI = (
	| HTTPResponse
	| HTTPResponse<Record<string, any>>
) & {
	status: number;
};
