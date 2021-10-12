import { Static } from "@sinclair/typebox";
import {
	SignUpSchema,
	SignUpResponse,
	SignInSchema,
} from "../config/schemas/users";

type TSignUpS = Static<typeof SignUpSchema>;
type THttpResponse = Static<typeof SignUpResponse>;

type TSignInS = Static<typeof SignInSchema>;

export type TSignUpRoute = {
	Body: TSignUpS;
	Reply: THttpResponse;
};

export type TSignInRoute = {
	Body: TSignInS;
	Reply: THttpResponse;
};
