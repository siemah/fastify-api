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
		signout: {
			root: "/signout",
			global: `${authRoot}/signout`,
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
