const authRoot = "/api/auth";
const apiKeysRoot = "/api/keys";
const routesEndpoints = {
	auth: {
		root: authRoot,
		signup: `${authRoot}/signup`,
		signin: {
			root: "/signin",
			global: `${authRoot}/signin`,
		},
	},
	apiKeys: {
		root: apiKeysRoot,
		create: {
			root: "/create",
			global: `${apiKeysRoot}/create`,
		},
	},
};

export default routesEndpoints;
