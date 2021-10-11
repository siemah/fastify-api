import { Static } from "@sinclair/typebox";
import { CreatePostBodySchema } from "../config/schemas/posts";
import { ResponseSchema } from "../config/schemas/shared";

type TCreatePostBodyS = Static<typeof CreatePostBodySchema>;
type TCreatePostResponseS = Static<typeof ResponseSchema>;

export type TCreatePostRoute = {
	Body: TCreatePostBodyS;
	Reply: TCreatePostResponseS;
};
