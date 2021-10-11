import { Type } from "@sinclair/typebox";

export const CreatePostBodySchema = Type.Object(
	{
		title: Type.String({
			maxLength: 255,
			minLength: 3,
			errorMessage: {
				maxLength: "Title field must not contain more than 255 characters",
				minLength: "Title field must contain at least 3 characters",
			},
		}),
		content: Type.String({
			maxLength: 255,
			minLength: 50,
			errorMessage: {
				maxLength: "Content field must not contain more than 255 characters",
				minLength: "Content field must contain at least 50 characters",
			},
		}),
		published: Type.Boolean({
			errorMessage:
				"Please select the state of published field to one of true/false",
		}),
	},
	{
		additionalProperties: false,
		errorMessage: {
			_: "Please enter all required details",
			required: {
				title: "Title field is required",
				content: "Title field is required",
				published: "Title field is required",
			},
		},
	},
);
