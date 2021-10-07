import { Type } from "@sinclair/typebox";

export const apiKeysCreateSchema = Type.Object(
	{
		title: Type.String({
			minLength: 3,
			maxLength: 100,
			errorMessage: {
				minLength: 'Title should contain 3 characters or more',
				maxLength: 'Title should not contain more that 100 characters',
				_: "Title is a combination of characters from 3 to 100"
			}
		}),
		description: Type.String({
			minLength: 10,
			maxLength: 256,
			errorMessage: {
				minLength: 'Description should contain 10 characters or more',
				maxLength: 'Description should not contain more that 256 characters',
				_: "Description is a combination of characters from 10 to 256"
			}
		}),
		domain: Type.String({
			format: 'hostname',
			errorMessage: "Please enter a valid domain"
		})
	},
	{
		additionalProperties: false,
		errorMessage: {
			_: "Please enter all required details",
			required: {
				title: "Title field is required",
				description: "Title field is required",
				domain: 'Domain field is required'
			}
		}
	}
);