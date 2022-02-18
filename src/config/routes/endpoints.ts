const authRoot = "/api/auth";
const apiKeysRoot = "/api/keys";
const postsRoot = "/api/posts";
const routesEndpoints = {
	auth: {
		root: authRoot,
		signup: `${authRoot}/signup`,
		signin: {
			root: "/signin",
			global: `${authRoot}/signin`,
		},
		signout: {
			root: "/signout",
			global: `${authRoot}/signout`,
		},
		check: {
			root: "/check",
		},
	},
	apiKeys: {
		root: apiKeysRoot,
		create: {
			root: "/create",
			global: `${apiKeysRoot}/create`,
		},
		list: {
			root: "/list",
			global: `${apiKeysRoot}/list`,
		},
	},
	posts: {
		root: postsRoot,
		create: {
			root: "/create",
			global: `${postsRoot}/create`,
		},
		edit: {
			root: "/:id/edit",
		},
		delete: {
			root: "/:id/delete",
		},
		list: {
			one: "/:id",
		},
	},
};

export default routesEndpoints;
