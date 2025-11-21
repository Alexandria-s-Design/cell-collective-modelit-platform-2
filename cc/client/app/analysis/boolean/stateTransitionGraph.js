import ccbooleananalysis from "ccbooleananalysis";

self.addEventListener("message", function(e) {
	const equations = JSON.parse(e.data).eqn;
	const transitionGraph = ccbooleananalysis.stateTransitionGraph(equations);
	self.postMessage(JSON.stringify(transitionGraph));
});
