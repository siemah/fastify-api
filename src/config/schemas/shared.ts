import { Type } from "@sinclair/typebox";

export const ResponseSchemaWithErrors = Type.Object({
	code: Type.KeyOf(
		Type.Object({
			failed: Type.String({
				pattern: "failed",
			}),
			success: Type.String({
				pattern: "success",
			}),
			not_found: Type.String({
				pattern: "not_found",
			}),
		}),
	),
	errors: Type.Optional(Type.Record(Type.String(), Type.String())),
	message: Type.Optional(Type.String()),
});

export const ResponseSchemaWithData = Type.Object({
	code: Type.KeyOf(
		Type.Object({
			failed: Type.String({
				pattern: "failed",
			}),
			success: Type.String({
				pattern: "success",
			}),
			unauthorized: Type.String({
				pattern: "unauthorized",
			}),
			not_found: Type.String({
				pattern: "not_found",
			}),
		}),
	),
	data: Type.Optional(Type.Record(Type.String(), Type.Any())),
	message: Type.Optional(Type.String()),
});

export const ResponseSchemaWithSuccessMessage = Type.Object({
	code: Type.KeyOf(
		Type.Object({
			failed: Type.String({
				pattern: "failed",
			}),
			success: Type.String({
				pattern: "success",
			}),
			not_found: Type.String({
				pattern: "not_found",
			}),
		}),
	),
	message: Type.Optional(Type.String()),
});

export const ResponseSchema = Type.Object({
	code: Type.KeyOf(
		Type.Object({
			failed: Type.String({
				pattern: "failed",
			}),
			success: Type.String({
				pattern: "success",
			}),
			unauthorized: Type.String({
				pattern: "unauthorized",
			}),
			not_found: Type.String({
				pattern: "not_found",
			}),
		}),
	),
	errors: Type.Optional(Type.Record(Type.String(), Type.String())),
	message: Type.Optional(Type.String()),
});
