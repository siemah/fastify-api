import { Static } from "@sinclair/typebox";
import { SignUpSchema, SignUpResponse } from "../config/schemas/users";

type TSignUpS = Static<typeof SignUpSchema>;
type TSignUpR = Static<typeof SignUpResponse>;

export type TSignUpRoute = {
	Body: TSignUpS;
	Reply: TSignUpR;
};
