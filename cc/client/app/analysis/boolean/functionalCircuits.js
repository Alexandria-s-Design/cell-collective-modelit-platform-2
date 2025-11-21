import ccbooleananalysis from "ccbooleananalysis";

self.addEventListener("message", function(e) {
	const equations = JSON.parse(e.data).eqn;
	const cycles = ccbooleananalysis.functionalCircuits(equations);
	self.postMessage(JSON.stringify(cycles));
});
