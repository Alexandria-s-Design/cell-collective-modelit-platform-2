import Immutable, { Seq } from "immutable";
import Entity, { Entities } from "./Entity";
import ModelEntity from "./modelEntity";

// patch - during staging deploy.
import Citation from './citation';
import Component from './Component';
import Condition from './Condition';
import ConditionSpecies from './ConditionSpecies';
import Content from './content';
import ContentReference from './contentReference';
import Document from './document';
import Dominance from './Dominance';
import Environment from './Environment';
import Experiment from './Experiment';
import ExperimentActivity from './ExperimentActivity';
import ExperimentMutation from './ExperimentMutation';
import Flow from './flow';
import FlowActivity from './FlowActivity';
import FlowMutation from './flowMutation';
import FlowRange from './flowRange';
import ImagePanel from './imagePanel';
import InitialState from './initialState';
import InitialStateComponent from './initialStateComponent';
import Interaction from './interaction';
import Layout from './layout';
import LayoutComponent from './layoutComponent';
import LearningActivity from './learningActivity';
import Link from './link';
import Model from './model';
import ModelReference from './modelReference';
import ModelVersionDef from './modelVersionDef';
import OutputRange from './outputRange';
import Page from './page';
import PageReference from './pageReference';
import Reference from './reference';
import Regulator from './Regulator';
import Section from './section';
import Sharing from './sharing';
import SimulationActivity from './simulationActivity';
import SimulationEnvironment from './simulationEnvironment';
import Species from "./Species";
import SubCondition from './SubCondition';
import SubConditionSpecies from './SubConditionSpecies';
import Survey from './survey';
import SurveyQuestion from './surveyQuestion';
import SurveyQuestionOption from './surveyQuestionOption';
import SurveyTableCell from './surveyTableCell';
import TextEditorPanel from './textEditorPanel';

import Annotation from "./metabolic/Annotation";
import Compartment from "./metabolic/Compartment";
import Gene from "./metabolic/Gene";
import ConditionGene from './metabolic/ConditionGene';
import SubConditionGene from './metabolic/SubConditionGene';
import Metabolite from "./metabolic/Metabolite";
import ObjectiveFunction from "./metabolic/ObjectiveFunction";
import ObjectiveReaction from "./metabolic/ObjectiveReaction";
import Reaction from "./metabolic/Reaction";
import ReactionMetabolite from "./metabolic/ReactionMetabolite";
import SubSystem from "./metabolic/SubSystem";
import KineticLaw from "../component/kinetic/Model/KineticLaw";

/*
-> Disabled to prevent conflicts among entities
*/

export default class ModelVersion extends ModelEntity {
	constructor(...args) {
		super(...args);
		this.complete = true;
	}

	create(self) {
		super.create(self);
		if (self.created) {
			const vdef = new ModelVersionDef({ created: self.created, updated: self.updated });
			vdef.self = vdef.self.set("id", this.id);
			const id = vdef.self.get("id");
			this.ModelVersionDef = { [id]: vdef };
			this._ModelVersionDef = { [id]: vdef };
			this.self = this.self.set("ModelVersionDef", Seq(this.ModelVersionDef).map(e => e.self).toMap());
		}
	}

	get isPersisted() {
		return super.isPersisted && !(this._pVersion < 0) && !(this._pVersion === undefined && this.PersistedVersion < 0);
	}

	buildRegulatorReferences() {
		Seq(this.Condition).forEach(e => (e.parent = this.Regulator[e.parentId]).conditions = e);
		if (this.modelType == "metabolic") {
			Seq(this.ConditionGene).forEach(e => {
				(e.parent = this.Condition[e.parentId]).genes = (e.species = e.gene = this.Gene[e.geneId]).conditions = e;
			})
		}
		Seq(this.ConditionSpecies).forEach(e =>
			(e.componentId && ((e.parent = this.Condition[e.parentId]).components = (e.species = e.component = this.Component[e.componentId]).conditions = e))
			| (e.root = e.parent.parent.parent)
		);
		Seq(this.SubCondition).forEach(e => (e.parent = this.Condition[e.parentId]).conditions = e);
		if (this.modelType == "metabolic") {
			Seq(this.SubConditionGene).forEach(e => {
				(e.parent = this.SubCondition[e.parentId]).genes = (e.species = e.gene = this.Gene[e.geneId]).conditions = e;
			})
		}
		Seq(this.SubConditionSpecies).forEach(e => ((e.parent = this.SubCondition[e.parentId]).components = (e.component = this.Component[e.componentId]).subConditions = e) | (e.root = e.parent.parent.parent.parent));
		Seq(this.Dominance).forEach(e => (e.positive = this.Regulator[e.positiveId]).dominants = (e.negative = this.Regulator[e.negativeId]).recessives = e);
	}

	buildPageReferences() {
		Seq(this.Section).forEach(e => (e.parent = this.Page[e.parentId]).sections = e);
		Seq(this.Content).forEach(e => (e.parent = this.Section[e.parentId]).contents = e);
		Seq(this.ModelReference).forEach(e => (e.reference = this.Reference[e.referenceId]).models = e);
		Seq(this.PageReference).forEach(e => ((e.parent = this.Page[e.parentId]).references = e) | ((e.reference = this.Reference[e.referenceId]).pages = e));
		Seq(this.ContentReference).forEach(e => ((e.parent = this.Content[e.parentId]).references = e) | ((e.reference = this.Reference[e.referenceId]).contents = e));
		Seq(this.Citation).forEach(e => (e.parent = this.Reference[e.parentId]).citations = e);
	}

	build(g) {
		super.build(g);

		try {
			this.modelType === "pharmacokinetic" && Seq(this.Rate).forEach(e => {
				console.log(this.PKCompartment[e.toCompartmentId])
				if (this.PKCompartment[e.toCompartmentId] && this.PKCompartment[e.fromCompartmentId]) {
					e.fromCompartment = this.PKCompartment[e.fromCompartmentId]
					e.toCompartment = this.PKCompartment[e.toCompartmentId]
						// (e.source = e.parent = this.PKCompartment[e.fromCompartmentId]).upStreams = (e.species = e.target = e.compartment = this.Compartment[e.compartmentId]).downStreams = e;
				}
			});



			if (!this.Component) { return }
			Seq(g.MetadataDefinition).filter(e => e.prototype.type === "Attachment").forEach(e => Seq(this[e.className]).forEach(e => (e.value = this.Document[e.valueId]).bindings = e));

			this.modelType !== "metabolic" && Seq(this.Regulator).forEach(e => {
				if (this.Component[e.componentId] && this.Component[e.parentId]) {
					(e.source = e.parent = this.Component[e.parentId]).upStreams = (e.species = e.target = e.component = this.Component[e.componentId]).downStreams = e;
				}
			});


			this.buildRegulatorReferences();
			Seq(this.Interaction).forEach(e => (e.target = this.Component[e.targetId]).interactions = (e.source = this.Component[e.sourceId]).interactionTargets = e);
			Seq(this.InitialStateComponent).forEach(e => (e.parent = this.InitialState[e.parentId]).components = (e.component = this.Component[e.componentId]).initialStates = e);
			Seq(this.Page).forEach(e => this.Component[e.parentId] && ((e.parent = this.Component[e.parentId]).pages = e));
			this.buildPageReferences();
			Seq(this.Experiment).forEach(e => {
				e.initialStateId != null && this.InitialState[e.initialStateId] ? (e.initialState = this.InitialState[e.initialStateId]).experiments = e : e.initialState = null;
				e.flowId != null && this.Flow[e.flowId] ? (e.flow = this.Flow[e.flowId]).experiments = e : e.flow = null;
				e.environmentId != null && this.Environment[e.environmentId] ? (e.environment = this.Environment[e.environmentId]).experiments = e : e.environment = null;
			});
			Seq(this.ExperimentMutation).forEach(e =>
				((e.parent = this.Experiment[e.parentId]).mutations = e)
				| e.componentId && ((e.component = this.Component[e.componentId]).experimentMutations = e)
				| e.geneId && ((e.gene = this.Gene[e.geneId]).experimentMutations = e));
			Seq(this.ExperimentActivity).forEach(e =>
				((e.parent = this.Environment[e.parentId]).envExperimentActivities = e)
				| e.componentId && ((e.component = this.Component[e.componentId]).experimentActivities = e)
				| e.reactionId && ((e.reaction = this.Reaction[e.reactionId]).experimentActivities = e));
			Seq(this.SimulationActivity).forEach(e => ((e.parent = this.SimulationEnvironment[e.parentId]).envSimulationActivities = e) | ((e.component = this.Component[e.componentId]).simulationActivities = e));
			Seq(this.OutputRange).forEach(e => (e.parent = this.Experiment[e.parentId]).ranges = e);
			Seq(this.FlowRange).forEach(e => (e.parent = this.Flow[e.parentId]).ranges = e);
			Seq(this.FlowMutation).forEach(e => ((e.parent = this.FlowRange[e.parentId]).mutations = e)
				| ((e.component = this.Component[e.componentId]).flowMutations = e)
				| ((e.gene = this.Gene[e.geneId].fluxMutations = e)));
			Seq(this.FlowActivity).forEach(e => ((e.parent = this.FlowRange[e.parentId]).activities = e)
				| e.componentId && ((e.component = this.Component[e.componentId]).flowActivities = e)
				| e.reactionId && ((e.reaction = this.Reaction[e.reactionId].fluxActivities = e)));
			Seq(this.LayoutComponent).forEach(e => {
				if (!this.Component[e.componentId]) { return console.log("ComponentId not found: " + e.componentId); }
				return (e.parent = this.Layout[e.parentId]).components = (e.component = this.Component[e.componentId]).layouts = e
			});
			Seq(this.Sharing).forEach(e => e.user = g.User[e.userId]);
			Seq(this.ImagePanel).forEach(e => e.file = this.Document[e.fileId]);
			Seq(this.SurveyQuestion).forEach(e => (e.parent = this.Survey[e.parentId]).questions = e);
			Seq(this.SurveyQuestionOption).forEach(e => (e.parent = this.SurveyQuestion[e.parentId]).options = e);
			Seq(this.SurveyTableCell).forEach(e => (e.parent = this.SurveyQuestion[e.parentId]).tableCells = e);
			Seq(this.SurveyQuestionText).forEach(e => (e.parent = this.Survey[e.parentId]).questionsText = e);
			this.InitialState && this.initialStateId != null && this.InitialState[this.initialStateId] ? ((this.initialState = this.InitialState[this.initialStateId]).initialStateParents = this) : this.initialState = null;

			this.Layout && this.layoutId != null && this.Layout[this.layoutId] ? ((this.layout = this.Layout[this.layoutId]).layoutParents = this) : this.layout = null;

			this.buildErr = false;
		} catch (e) {
			console.error(e);

			this.buildErr = true;

			Seq(g.MetadataDefinition).filter(e => e.prototype.type === "Attachment").forEach(e => this[e.className] = {});
			Seq(Entities).forEach((_, k) => {
				if (this[k] instanceof Object && this[k] !== null) {
					this[k] = {};
				} else if (this[k]) {
					this[k] = null;
				}
			});
		}
	}

	get selected() {
		return this.top.selected === this;
	}

	get accessId() {
		return this.top.id;
	}

	get versionDef() {
		return Seq(this.ModelVersionDef).first();
	}

	get sub() {
		return undefined;
	}

	get publisher() {
		let e;
		return this.author || ((e = this.user) ? ((e.firstName || "") + " " + (e.lastName || "")).trim() || e.email : "");
	}

	get version() {
		return this.currentVersion;
	}

	get nodes() {
		if (this.modelType === "pharmacokinetic") return Seq(this.PKCompartment);
		return Seq(this.Component);
	}


	get originId() {
		return this._originId !== undefined ? this._originId : this.self.get("originId");
	}

	set originId(v) {
		this._originId = v;
	}

	get edges() {
		if (this.modelType === "pharmacokinetic") {
			// {  arrow from -4 to -5 and -4 to -7 {from: componentId, to: parentId}
			// 	'-5': {
			//	   '-4':	{source: '-4', target: Component {'-5'}, type: true },
			// 	},
			// 	'-7': {
			//	   '-4':	{source: '-4', target: Component {'-5'}, type: true },
			// 	}
			// }
			const edgeMap = {};
			const addEdge = (t, s) => {
				if (!t) return;
				if (!s) return;
				let m = {}
				if(t.id in edgeMap) {
				  	m = edgeMap[t.id];
				} 
				m[s.id] = {source: s.id, target: t, type:true }
				edgeMap[t.id] = m;
			}
			Seq(this.Rate).forEach(e => addEdge(e.toCompartment, e.fromCompartment));
			return Seq(edgeMap).map(e => Seq(e).valueSeq()).valueSeq().flatten(true);
		}

		const map = Seq(this.Component).filter(e => e.upStreams).map(() => ({})).toObject();
		const add = (s, t, type) => {
			if (!t || t.isExternal == undefined) { return };
			const m = map[t.id];
			const e = m[s];
			e ? e.type !== type && (e.type = 2) : (m[s] = { source: s, target: t, type: type});
		};
		Seq(this.Regulator).filter(e => e.type).forEach(e => add(e.componentId, e.parent, true));
		Seq(this.Regulator).filterNot(e => e.type).forEach(e => add(e.componentId, e.parent, false));

		Seq(this.ConditionSpecies).forEach((e) => add(e.componentId, e.root, 2));
		Seq(this.SubConditionSpecies).forEach(e => add(e.componentId, e.root, 2));
		return Seq(map).map(e => Seq(e).valueSeq()).valueSeq().flatten(true);

	}

	expressions(f) {
		const internal = Seq(this.Component).filterNot(e => e.isExternal);
		const map = internal.map(e => e.expression(f.bind(null, e)).replace(/i\[/g, "c[")).toObject();
		const exp = (i, o, d) => {
			let result = new Immutable.OrderedMap();

			while (o.size) {
				o = o.map(e => e.filterNot(e => i.has(e)).cacheResult()).cacheResult();
				let s = o.filterNot(e => e.size).cacheResult();

				if (s.size) {
					o = o.filter(e => e.size).cacheResult();
					i = i.concat(s).toMap();
					result = result.concat(s.map((_, k) => map[k]));
				}
				else if (d) {
					s = o.map((e, k) => ({ v: e, k: (e = {}, e[k] = true, exp(i.concat(e).toMap(), o)).size })).cacheResult();
					const max = s.maxBy(e => e.k).k;
					s = s.filter(e => e.k === max).take(1).toMap();
					result = result.concat(s.map((v, e) => (e = map[e], v.v.forEach(k => e = e.replace(new RegExp("c\\[" + k + "]", "g"), "i[" + k + "]")), e)));
					o = o.filterNot((_, k) => s.has(k)).cacheResult();
					i = i.concat(s).toMap();
				}
				else break;
			}
			return result;
		};
		return exp(Seq(this.Component).filter(e => e.isExternal).toMap(), internal.map((p, e) => ((e = Seq(p.inputs).keySeq(), p = p.interactions) ? e.filterNot(k => p[k]) : e).cacheResult()).cacheResult(), true);
	}

	get json() {
		const model = {};

		model.description = this.description;
		model.modelType = this.modelType;
		model.tags = this.tags;

		return model;
	}
}


Seq(["permissions", "user", "userId", "type", "isPublic"]).forEach((k) => {
	Object.defineProperty(ModelVersion.prototype, k, { get: function () { return this.parent[k]; } });
});


export const references = {
	//TODO: move these props from the parent model
	created: null,
	updated: null,
	hash: null,
	description: null,
	name: { maxLength: 100 },
	tags: { maxLength: 255 },
	score: null,
	cited: null,
	rating: null,
	ratingNum: null,
	author: { maxLength: 70 },
	isPaid: null,
	initialStateId: { ref: "initialStateParents" },
	layoutId: { ref: "layoutParents" },
	currentVersion: null,
	coverImage: null
}

Entity.init({ ModelVersion }, references);