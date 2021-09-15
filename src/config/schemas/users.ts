import { Type } from "@sinclair/typebox";

export const SignUpSchema = Type.Object(
	{
		email: Type.String({
			format: "email",
			errorMessage: "Please enter a valid email",
		}),
		password: Type.String({
			minLength: 6,
			errorMessage: {
				minLength: "Password should contain at least 6 characters",
				_: "Password is a combination of characters at least 6",
			},
		}),
		fullname: Type.Optional(
			Type.String({
				minLength: 2,
				errorMessage: {
					minLength: "Fullname field should contain at least 2 characters",
					_: "Please enter a valid fullname",
				},
			}),
		),
		bio: Type.Optional(
			Type.String({
				minLength: 10,
				maxLength: 150,
				errorMessage: {
					minLength: "Bio field should contain at least a0 characters",
					maxLength: "Bio field should not contain more than 150 characters",
					_: "Please enter a valid Bio",
				},
			}),
		),
	},
	{
		additionalProperties: false,
		errorMessage: {
			_: "Email and password fields are required",
			required: {
				email: "Email field is required",
				password: "Password field is required",
			},
		},
	},
);

export const SignUpResponse = Type.Object({
	code: Type.KeyOf(
		Type.Object({
			failed: Type.String({
				pattern: "failed",
			}),
			success: Type.String({
				pattern: "success",
			}),
		}),
	),
	errors: Type.Optional(Type.Record(Type.String(), Type.String())),
	message: Type.Optional(Type.String()),
});
