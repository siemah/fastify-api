import { Static } from "@sinclair/typebox";
import {
	CreatePostBodySchema,
	EditPostParamsSchema,
} from "../config/schemas/posts";
import { ResponseSchema } from "../config/schemas/shared";

type TCreatePostBodyS = Static<typeof CreatePostBodySchema>;
type TCreatePostResponseS = Static<typeof ResponseSchema>;
type TEditPostParams = Static<typeof EditPostParamsSchema>;

export type TCreatePostRoute = {
	Body: TCreatePostBodyS;
	Reply: TCreatePostResponseS;
};

export type TEditPostRoute = TCreatePostRoute & {
	Params: TEditPostParams;
};
