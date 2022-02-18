import { Static } from "@sinclair/typebox";
import { apiKeysCreateSchema } from "../config/schemas/api-keys";
import { ResponseSchema } from "../config/schemas/shared";

type TApiKeyCreateS = Static<typeof apiKeysCreateSchema>;
type TApiKeyCreateResponseS = Static<typeof ResponseSchema>;

export type TApiKeyCreateRoute = {
	Body: TApiKeyCreateS;
	Reply: TApiKeyCreateResponseS;
};

export type TApiKeyGetRoute = {
	Reply: TApiKeyCreateResponseS;
};
