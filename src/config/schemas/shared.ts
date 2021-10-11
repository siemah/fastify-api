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
		}),
	),
	errors: Type.Optional(Type.Record(Type.String(), Type.String())),
	message: Type.Optional(Type.String()),
});
