import { PrismaClient, Post as PostType } from ".prisma/client";
import HttpResponseError from "../../tools/error";
import { HTTPResponseI } from "../../types/shared";

class Post {
	protected prisma: PrismaClient;

	constructor(prisma: PrismaClient) {
		this.prisma = prisma;
	}

	/**
	 * Create new post(article) by author(user)
	 * @param post new article details such as title, content...
	 * @param userId author id whome created this new post
	 * @returns response contain http status and success/error messages
	 */
	async createOneByUser(
		post: Pick<PostType, "title" | "published" | "content">,
		userId: number,
	): Promise<HTTPResponseI> {
		let response: HTTPResponseI;

		try {
			const result = await this.prisma.post.create({
				data: {
					title: post.title,
					content: post.content,
					published: post.published,
					author: {
						connect: {
							id: userId,
						},
					},
				},
			});
			if (!!result.id === true) {
				response = {
					code: "success",
					status: 201,
					data: result,
					message: `New post "${post.title}" was created successfully`,
				};
			} else {
				throw new Error("failed");
			}
		} catch (error) {
			response = {
				status: 400,
				code: "failed",
				errors: {
					global: "Something went wrong, please try again",
				},
			};
		}

		return response;
	}

	/**
	 * Edit post by author
	 * @param post article details to update
	 * @param id author id
	 * @returns response contain http status and success/error messages
	 */
	async editOneById(
		post: Pick<PostType, "title" | "published" | "content">,
		id: number,
	): Promise<HTTPResponseI> {
		let response: HTTPResponseI;

		try {
			await this.prisma.post.update({
				data: {
					title: post.title,
					content: post.content,
					published: post.published,
				},
				where: {
					id,
				},
				select: {
					id: true,
				},
			});
			response = {
				code: "success",
				status: 200,
				message: `Post "${post.title}" updated successfully`,
			};
		} catch (error) {
			response = {
				status: 400,
				code: "failed",
				errors: {
					global: "Something went wrong, please try again",
				},
			};
		}

		return response;
	}

	/**
	 * Delete an article by id an
	 * @param id article id
	 * @param authorId article author(owner)
	 * @returns response containing status,code and success/error messages
	 */
	async removeOneById(id: number): Promise<HTTPResponseI> {
		let response: HTTPResponseI;

		try {
			const results = await this.prisma.post.delete({
				where: {
					id,
				},
			});
			if (!!results.id === true) {
				response = {
					status: 200,
					code: "success",
					message: `"${results.title}" deleted successfully`,
				};
			} else {
				throw new HttpResponseError({
					status: 401,
					code: "unauthorized",
					errors: {
						global: "You're not authorized to delete this resource",
					},
				});
			}
		} catch (error) {
			response = HttpResponseError.getResponse(error);
		}

		return response;
	}
}

export default Post;
