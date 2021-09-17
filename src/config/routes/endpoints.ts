const authRoot = "/api/auth";
const routesEndpoints = {
	auth: {
		root: authRoot,
		signup: `${authRoot}/signup`,
		signin: {
			root: "/signin",
			global: `${authRoot}/signin`,
		},
	},
};

export default routesEndpoints;
