import ccbooleananalysis from "ccbooleananalysis";

self.addEventListener("message", function(e) {
	const equations = JSON.parse(e.data).eqn;
	const loops = ccbooleananalysis.feedbackLoops(equations);
	self.postMessage(JSON.stringify(loops));
});
