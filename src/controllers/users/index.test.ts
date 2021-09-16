import faker from "faker";
import UserProfile from ".";
import { prismaMock } from "../../tools/testing/prisma/singleton";

describe("UserProfile", () => {
	const userData = {
		email: faker.internet.email(),
		password: faker.internet.password(6),
		fullname: faker.name.findName(),
		bio: faker.lorem.words(6),
	};
	const userCreateData = {
		...userData,
		id: faker.datatype.number(),
	};

	describe("createUser", () => {
		const userP = new UserProfile(prismaMock);
		const failedReponse = {
			code: "failed",
			errors: {
				global: "Please check if your are not registred before then try!",
			},
		};

		test("should create a new user", async () => {
			prismaMock.user.create.mockResolvedValue(userCreateData);
			const res = await userP.createUser(userData);

			expect(res).toHaveProperty("status", 201);
			expect(res).toHaveProperty("code", "success");
			expect(res).toHaveProperty("message", "You have registred with success");
			expect(res).toHaveProperty("data", userCreateData);
		});

		test("should not create new user if the email already have been used", async () => {
			prismaMock.user.create.mockResolvedValue(userCreateData);
			const res1 = await userP.createUser(userData);
			prismaMock.user.create.mockRejectedValue(failedReponse);
			const res2 = await userP.createUser(userData);

			expect(res1).toHaveProperty("status", 201);
			expect(res1).toHaveProperty("code", "success");
			expect(res2).toHaveProperty("status", 400);
			expect(res2).toHaveProperty("code", "failed");
			expect(res2).toHaveProperty("errors", failedReponse.errors);
		});
	});
});
