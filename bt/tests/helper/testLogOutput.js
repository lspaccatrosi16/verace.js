const testLog = (teststring, log) => {
	const logOutput = log().dumpBuffer.split("\n");

	if (logOutput.some((v) => v.includes(teststring))) {
		return true;
	} else return false;
};

export { testLog };
