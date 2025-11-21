import { Seq } from "immutable";
import Entity from "../Entity";
import ModelVersion, {
	references
} from "../ModelVersion";
import Application from "../../application";
import { _objectify } from "../../fluxviz";
import Compartment from "./Compartment";
import Metabolite from "./Metabolite";
import UnitDefinition from "../unitDefinition";
import VolumeUnit from "./VolumeUnit";

export default class KineticModel extends ModelVersion {

	constructor(props) {
		super(props);
	}

	createDefaultCompartment() {
		const defaultCompartment = new Compartment({
			name: "default"
		});

		const defaultMetabolite = new Metabolite({
			species_id: "A",
			name: "A",
			compartment: defaultCompartment,
			unitDefinition: this.UnitDefinition[1]
		});

		this.Compartment = { ...this.Compartment, [defaultCompartment.id]: defaultCompartment };
		this.Metabolite = { ...this.Metabolite, [defaultMetabolite.id]: defaultMetabolite };
		this.VolumeUnit = {...this.VolumeUnit, 1: new VolumeUnit({id: 1, name: 'millilitre'})};
		
		this.self = this.self.set("VolumeUnit", Seq(this.VolumeUnit).map(e => e.self).toMap());
		this.self = this.self.set("Metabolite", Seq(this.Metabolite).map(e => e.self).toMap());
		this.self = this.self.set("Compartment", Seq(this.Compartment).map(e => e.self).toMap());  // fix for inability to persist changes to default compartment name
	}

	get modelType() {
		return "kinetic";
	}

	get compartments() {
		return Seq(this.Compartment);
	}

	get metabolites() {
		return Seq(this.Metabolite);
	}

	get reactions() {
		return Seq(this.Reaction);
	}

 // global parameters for the model
	get parameters() {
		return Seq(this.KParameter); 
	}


	fluxvizModel(compartments = true) {
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
					...(compartments ? { compartment: `${metabolite.compartmentId}` } : {})
				}))
				.toArray()
			:
			[]

		model.reactions = this.Reaction ?
			Seq(this.Reaction)
				.valueSeq()
				.map(reaction => {
					const metabolites = {}

					// if ( reaction.reactionMetabolites ) {
					// 	for ( const key in r.reactionMetabolites ) {
					// 		const eRM = this.ReactionMetabolite[key];
					// 		metabolites[eRM.metaboliteId] = eRM.coefficient;
					// 	}
					// }
					return {
						id: reaction.id,
						name: reaction.name,
						reactants: reaction.reactants,
						products: reaction.products,
						reversible: reaction.reversible
					}
				})
				.toArray()
			:
			[]

			model.parameters = this.KParameter ?
				Seq(this.Parameter)
					.valueSeq()
						.map(parameter => ({
							id: parameter.id,
							units: parameter.units,
							value: parameter.value
						}))
					.toArray()
			:
			[]

		return model;
	}

	get json() {
		const model = super.json;

		model.id = this.id;
		model.name = this.name;

		model.compartments = this.Compartment ?
			Seq(this.Compartment)
				.map(({ id, name }) => ({ id, name }))
				.toArray()
			:
			[];

		model.species = this.Metabolite ?
			Seq(this.Metabolite)
				.map(({ id, species_id, name, compartmentId, initial_concentration, unitDefinitionId }) => ({
					id, species_id, name, compartment: compartmentId && this.Compartment[compartmentId].name, initial_concentration, unit: unitDefinitionId && this.UnitDefinition[unitDefinitionId].name
				}))
				.toArray()
			:
			[];


		model.parameters = this.KParameter ?
			Seq(this.KParameter)
				.map(param => ({
						id: param.name,
						value: param.value,
						unit: param.unit && this.UnitDefinition[param.unit].name
				}))
				.toArray() : []


		model.reactions = this.Reaction ?
			Seq(this.Reaction)
				.map(({ id, reaction_id, name, reactants, products, kinetic_law }) => {
					const processedReactants = reactants.map(reactant => {
						if (this.Metabolite[reactant.id]) {
							const speciesId = this.Metabolite[reactant.id].species_id;
							const stoichiometry = reactant.stoichiometry;
							return { species_id: speciesId, stoichiometry: stoichiometry };
						} else {
							console.warn(`Metabolite for reactant ${reactant} not found.`);
							return null;
						}
					}).filter(item => item !== null);

					const processedProducts = products.map(product => {
						if (this.Metabolite[product.id]) {
							const speciesId = this.Metabolite[product.id].species_id;
							const stoichiometry = product.stoichiometry;
							return { species_id: speciesId, stoichiometry: stoichiometry };
						} else {
							return null;
						}
					}).filter(item => item !== null);

					// Return the mapped reaction object
					return {
						id,
						reaction_id,
						name,
						reactants: processedReactants,
						products: processedProducts,
						kinetic_law: kinetic_law && {
							formula: this.KineticLaw[kinetic_law && typeof kinetic_law === 'object' ? kinetic_law.id : kinetic_law].formula,
							parameters: Seq(this.KineticLaw[kinetic_law && typeof kinetic_law === 'object' ? kinetic_law.id : kinetic_law].parameters).map(param => ({
								id: param.name,
								value: param.value,
								unit: param.unit && this.UnitDefinition[param.unit].name
							})).toArray()
						}
					};
				})
				.toArray()
			:
			[];
		return model;
	}

	createDefaultUnitDefinitions() {
		this.UnitDefinition = {};
		this._UnitDefinition = {};

		const prefixes = ['', 'mili', 'micro', 'nano', 'pico', 'femto', 'atto', 'zepto'];
		const defaultUnitDefinitions = ['molar', 'molar per second'];

		const unitCombinations = defaultUnitDefinitions.flatMap(unit => prefixes.map(prefix => `${prefix}${unit}`));
		// Define new Unit definition as Kinetict Law Parameters:
		unitCombinations.push('second^-1');
		unitCombinations.push('dimensionless');
		unitCombinations.push('substance')
		unitCombinations.push('mmol/L')
		unitCombinations.push('millimolar per minute')
		unitCombinations.push('per minute')
		unitCombinations.push('millimoles per minute')

		Seq(unitCombinations).forEach((unitName, i) => {
			const unit = new UnitDefinition({ name: unitName });
			unit.self = unit.self.set("id", i + 1);
			const id = unit.self.get("id");

			this.UnitDefinition[id] = unit;
			this._UnitDefinition[id] = unit;
		})

		this.self = this.self.set("UnitDefinition", Seq(this.UnitDefinition).map(e => e.self).toMap());
	}

	create(self) {
		super.create(self);

		this.createDefaultUnitDefinitions();
		this.createDefaultCompartment();
	}

	build(g) {
		super.build(g);
		this.createDefaultUnitDefinitions();

		Seq(this.Page).forEach(p => {
			if (p.self.get('metaboliteId')) {
				this.Metabolite[p.self.get('metaboliteId')].pages = p;
			}
		});

		Seq(this.Metabolite).forEach(metabolite => {
			metabolite.compartment = this.Compartment[metabolite.compartmentId]
		});

	}
}

Entity.init({ KineticModel }, {
	...references
});
