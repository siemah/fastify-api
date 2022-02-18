import { Static } from "@sinclair/typebox";
import { ResponseSchema } from "../config/schemas/shared";
import { SignUpSchema, SignInSchema } from "../config/schemas/users";

type TSignUpS = Static<typeof SignUpSchema>;
type THttpResponse = Static<typeof ResponseSchema>;

type TSignInS = Static<typeof SignInSchema>;

export type TSignUpRoute = {
	Body: TSignUpS;
	Reply: THttpResponse;
};

export type TSignInRoute = {
	Body: TSignInS;
	Reply: THttpResponse;
};
