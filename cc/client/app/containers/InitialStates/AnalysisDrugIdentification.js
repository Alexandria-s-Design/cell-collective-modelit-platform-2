import { Seq, Map } from "immutable";

export default (model) => (model.modelType == 'metabolic')
	&& Seq({
		drugList: {
			upload: null,
			data: null
		},
		upRegulated: {
			upload: null,
			data: null
		},
		downRegulated: {
			upload: null,
			data: null
		}
	}).map(val => new Map(val)).toMap();