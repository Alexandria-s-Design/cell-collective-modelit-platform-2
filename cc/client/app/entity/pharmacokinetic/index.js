import { Seq } from "immutable";

import Entity from "../Entity";
import ModelVersion, {
	references
} from "../ModelVersion";
import { _objectify } from "../../fluxviz";
import PKCompartment from "./Compartment";


export default class PharmacokineticModel extends ModelVersion {

	get modelType ( ) {
		return "pharmacokinetic";
	}

	get compartments() {
		return Seq(this.PKCompartment);
	}

	get metabolites() {
		return Seq(this.Metabolite);
	}

	get reactions() {
		return Seq(this.Reaction);
	}


	fluxvizModel(compartments=true) {
		const model = {};
		model.modelType = this.modelType;

		if (compartments) {
			model.compartments = this.Compartment ? 
				_objectify(
					Seq(this.Compartment)
						.valueSeq()
						.toArray(),
					compartment => ({ [`${compartment.id}`]: compartment.name })
				)
				:
				{}
		}

		model.metabolites = this.Metabolite ?
			Seq(this.Metabolite)
				.valueSeq()
				.map(metabolite => ({
					id: metabolite.id,
					name: metabolite.name,
					...( compartments ? { compartment: `${metabolite.compartmentId}` } : { } )
				}))
				.toArray()
			:
			[]

		model.reactions	= this.Reaction ?
			Seq(this.Reaction)
				.valueSeq()
				.map(reaction => {
					const metabolites	= {}

					// if ( reaction.reactionMetabolites ) {
					// 	for ( const key in r.reactionMetabolites ) {
					// 		const eRM = this.ReactionMetabolite[key];
					// 		metabolites[eRM.metaboliteId] = eRM.coefficient;
					// 	}
					// }
					console.log(reaction.reactants);
					return {
						id: reaction.id,
						name: reaction.name,
						reactants: reaction.reactants,
						products: reaction.products,
					}
				})
				.toArray()
			:
			[]
		return model;
	}

	get json ( ) {
		const model = super.json;
		
		model.id = this.id;
		model.name = this.name;

		model.compartments 	= this.PKCompartment ?
			Seq(this.PKCompartment)
				.map(({ id, name, type, cmp, extType }) => ({ id, name, type, cmp, extType }))
				.toArray()
			:
			[];
		
		model.rates = this.Rate ?
			Seq(this.Rate)
				.map(({ id, name, fromCompartmentId, toCompartmentId }) => ({ id, name, fromCompartmentId, toCompartmentId }))
				.toArray()
			:
			[];
		
		
		model.parameters = this.Parameter ?
			Seq(this.Parameter)
				.map(({ id, name, type, value, value_type, rateId, compartmentId }) => ({ id, name, type, value, value_type, rateId, compartmentId}))
				.toArray()
			:
			[];
		
		model.dosings = this.DosingRegimen ?
			Seq(this.DosingRegimen)
				.map(({ id, type, route, amount, duration, interval, parameterId }) => ({ id, type, route, amount, duration, interval, parameterId }))
				.toArray()
			:
			[];
		

		model.variabilities = this.ParameterVariability ?
			Seq(this.ParameterVariability)
				.map(({ id, type, distributionId, parameterId }) => ({ id, type, distributionId, parameterId }))
				.toArray()
			:
			[];
		
		model.covariates = this.ParameterCovariate ?
			Seq(this.ParameterCovariate)
				.map(({ id, type, functionId, parameterId }) => ({ id, type, functionId, parameterId }))
				.toArray()
			:
			[];
		
		
		model.populations = this.Population ?
			Seq(this.Population)
				.map(({ id, name, type, distributionId }) => ({ id, name, type, distributionId }))
				.toArray()
			:
			[];
		
		model.distributions = this.Distribution ?
			Seq(this.Distribution)
				.map(({ id, name, type, parameters }) => ({ id, name, type, parameters }))
				.toArray()
			:
			[];
		
		model.functions = this.Function ?
			Seq(this.Function)
				.map(({ id, name, type, parameters }) => ({ id, name, type, parameters }))
				.toArray()
			:
			[];
		
		return model;
	}
	
	build (g) {
		super.build(g);
		Seq(this.Population).forEach(population => {
			population.distribution = this.Distribution[population.distributionId]
		});
		Seq(this.ParameterVariability).forEach(variablity => {
			variablity.distribution = this.Distribution[variablity.distributionId]
			variablity.parameter = this.Parameter[variablity.parameterId]
		});
		Seq(this.ParameterCovariate).forEach(covariate => {
			covariate.function = this.Function[covariate.functionId]
			covariate.parameter = this.Parameter[covariate.parameterId]
		});
		// Seq(this.Metabolite).forEach(metabolite => {
		// 	metabolite.compartment = this.PKCompartment[metabolite.compartmentId]
		// });
	}
}

Entity.init({ PharmacokineticModel }, {
	...references
});