import app from "./app";

const PORT = process.env.PORT || 4321;

app.listen(PORT, (error, address) => {
	if (error) {
		app.log.error(error);
		process.exit(1);
	}
	app.log.info(`server runing at ${address}`);
});
