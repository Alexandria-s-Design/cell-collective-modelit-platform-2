import Immutable, { Seq } from "immutable";
import Utils from "./utils";
import {convertFromRaw, convertToRaw, EditorState} from "draft-js";

import store from "store";

const TEACHING = "teaching";
const LEARNING = "learning";
const RESEARCH = "research";

function getCurrentSubdomain() {
	const e = window.location.hostname;
	let subdomain;

	if (e.startsWith("learn-")) {
		subdomain = "learn";
	} else if (e.startsWith("teach-")) {
		subdomain = "teach";
	} else {
		subdomain = e.split(".")[0].toLowerCase();
		if (subdomain.indexOf('-') > 0) {
			subdomain = subdomain.split("-")[1];
		}
	}
	return subdomain
}
export default class Application {
	static convert(u, p, t, i, v, s) {
		return Seq(v).mapEntries(([k, v]) => {
			let e;
			return [k = p[t].from[k] || k, (e = Application.values[t]) && (e = e[k]) && (e = e.from) ? (typeof(e) == "function" ? e(v, u, i, s) : e[v]) : v];
		}).concat({ id: i }).toMap();
	}
	static cmpVersion(s) {
		return (a,b) => {
			const ai = parseInt(a.id);
			const bi = parseInt(b.id);

			if(s && a.selected !== b.selected) return a.selected ? -1 : 1;
			if(a.creationDate < b.creationDate) return 1;
			if(a.creationDate > b.creationDate) return -1;
			if(ai < bi) return 1;
			if(ai > bi) return -1;

            return 0;
        };
    }
    static defIndex(e) {
        const set = Seq(e).map(e => e.index).toSet();
        return Immutable.Range(1, Infinity).find(e => !set.has(e));
    }
    static defName(e, n) {
        const set = Seq(e).map(e => e.name).filterNot(e => e && e.indexOf(n)).toSet();
        return Immutable.Range(1, Infinity).map(e => n + e).find(e => !set.has(e));
    }
    static defNameCopy(e, n) {
        const i = (n = n.name).lastIndexOf(" (");
        i > 0 && (n = n.substring(0, i));
        const set = Seq(e).map(e => e.name).filterNot(e => e.indexOf(n)).toSet();
        return Immutable.Range(1, Infinity).map(e => n + " (" + e + ")").find(e => !set.has(e));
    }
    static defNameExt(e, n, exp, { propertyName = "name" } = { }) {
        const A = 'A'.charCodeAt(0);
        const range = 'Z'.charCodeAt(0) - A + 1;
        const set = Seq(e).map(e => e[propertyName]).filter(e => exp.test(e)).toSet();
        return Immutable.Range(0, Infinity).map(e => {
            const i = Math.floor(e / range);
            return n + String.fromCharCode(A + e % range) + (i ? i : '');
        }).find(e => !set.has(e));
    }
    static url(e) {
        return Application.api + "/_api/model/download?token=" + e.token;
    }
}

Application.host = (function() {
	const e = window.location;
	return e.protocol + "//" + e.hostname + e.pathname;
})();

Application.domain = (function() {
	const domain   = store.get("application_domain");
	const hostname = store.get("application_hostname");

	if ( import.meta.env.MODE !== "production" && domain && hostname === window.location.hostname) {
		return domain;
	}

	const map = {
		learn: LEARNING,
		teach: TEACHING
	};

	let subdomain = getCurrentSubdomain();
	const result = map[subdomain] || LEARNING;

	store.set("application_domain", result);

	return result;
})();


Application.getSubdomain = () => {
	let subdomain = '';
	switch (Application.domain) {
		case LEARNING: subdomain = 'learn'; break;
		case TEACHING: subdomain = 'teach'; break;
		case RESEARCH: subdomain = 'research'; break;
	}
	return subdomain;
}

//create Application.isResearch, .... Application.isLearning and Application.isTeaching etc...
Seq(Application.domains).forEach((k,v)=> {
	Application[`${k}${Utils.capitalize(k)}`] = Application.domain === v;
});
Application.isEducation = Application.domain === TEACHING || Application.domain === LEARNING;
Application.isLearning = Application.domain === LEARNING;
Application.isResearch = Application.domain === RESEARCH;
Application.isTeach = Application.domain === TEACHING;

Application.domainRaw = (function() {
	let e = window.location.hostname;
	if(/itest/g.test(e)){
		e = "itest";
	}else if(/test/g.test(e)){
		e = "test";
	}else{
		e = "";
	}
	return e+Application.domain;
})();

Application.language     =
	store.get("user_language")
	|| (navigator.languages && navigator.languages[0])
	|| navigator.language
	|| navigator.userLanguage;
Application.languageCode = Application.language.toLowerCase().split(/[_-]+/)[0];


Application.domains = Utils.map({
	RESEARCH,
	TEACH: TEACHING,
	LEARN: LEARNING
});

Application.modelTypes = {
	research: null,
	learning: null
};

Application.catalogCategories = Seq({
	// Research Categories
	// ==> DISABLED: ModelIt
	// "translate:ModelDashBoard.Research.LabelPublishedModels": "published",
	// "translate:ModelDashBoard.Research.LabelMyModels": "my",
	// "translate:ModelDashBoard.Research.LabelSharedWithMe": "shared",
	// "translate:ModelDashBoard.Research.LabelRecentlyPublished": {"category": "published", "orderBy":"recent"},
	// "translate:ModelDashBoard.Research.LabelMostPopular": {"category": "published", "orderBy":"popular"},
	// "translate:ModelDashBoard.Research.LabelRecommendedToYou": {"category": "published", "orderBy":"recommended"},

	//Teaching categories
	"translate:ModelDashBoardLearningLabelPublicModules":"published",
	"translate:ModelDashBoardLearningMyModules": "my",
	"translate:ModelDashBoardLearningSharedWithMe": "shared",

	//Learning categories
	"translate:ModelDashBoard.Learning.LabelPublicModules": "published",
	// "translate:ModelDashBoard.Learning.LabelMyLearning":"my"

	// "My Learning": "workspace",
	// "My Teaching": "workspace",
	// "Shared With Me": "shared",
	// "Shared with Me": "shared",
	// "My Models": "my",
	// "My Modules": "my",

	// // Learning Categories
	// "Public Modules": "published"
}).map(Utils.ext.bind(null, "category")).toObject();

Application.reversedCategories = (function(platform, category){
	if (platform == "research") {
		return Application.researchCatalogCategoriesReversed[category];
	} else if (platform == "learning") {
		return Application.learningCatalogCategoriesReversed[category];
	} else {
		return Application.teachingCatalogCategoriesReversed[category];
	}
})

Application.researchCatalogCategoriesReversed = Seq([
	// Research Categories
	{ key: "published", value: "translate:ModelDashBoard.Research.LabelPublishedModels" },
	{ key: "my", value: "translate:ModelDashBoard.Research.LabelMyModels" },
	{ key: "shared", value: "translate:ModelDashBoard.Research.LabelSharedWithMe" },
	{ key: JSON.stringify({ category: "published", orderBy: "recent" }), value: "translate:ModelDashBoard.Research.LabelRecentlyPublished" },
	{ key: JSON.stringify({ category: "published", orderBy: "popular" }), value: "translate:ModelDashBoard.Research.LabelMostPopular" },
	{ key: JSON.stringify({ category: "published", orderBy: "recommended" }), value: "translate:ModelDashBoard.Research.LabelRecommendedToYou" },
]).map(entry => ({ [entry.key]: entry.value })).reduce((acc, obj) => ({ ...acc, ...obj }), {});

Application.teachingCatalogCategoriesReversed = Seq([
	//Teaching categories
	{ key: "published", value: "translate:ModelDashBoardLearningLabelPublicModules" },
	{ key: "my", value: "translate:ModelDashBoardLearningMyModules" },
	{ key: "shared", value: "translate:ModelDashBoardLearningSharedWithMe" },
]).map(entry => ({ [entry.key]: entry.value })).reduce((acc, obj) => ({ ...acc, ...obj }), {});

Application.learningCatalogCategoriesReversed = Seq([
	//Learning categories
	{ key: "published", value: "translate:ModelDashBoard.Learning.LabelPublicModules" },
	{ key: "my", value: "translate:ModelDashBoard.Learning.LabelMyLearning" }
]).map(entry => ({ [entry.key]: entry.value })).reduce((acc, obj) => ({ ...acc, ...obj }), {});

Application.surveyEntities = ['Survey', 'SurveyQuestion', 'SurveyQuestionOption', 'SurveyTableCell','SurveyQuestionText'];

Application.entities = Seq({
    Component: "speciesMap",
    Regulator: "regulatorMap",
    Condition: "conditionMap",
    ConditionSpecies: "conditionSpeciesMap",
		ConditionGene: "conditionGeneMap",
    SubCondition: "subConditionMap",
    SubConditionSpecies: "subConditionSpeciesMap",
		SubConditionGene: "subConditionGeneMap",
    Dominance: "dominanceMap",
    Interaction: "componentPairMap",
    InitialState: "initialStateMap",
    InitialStateComponent: "initialStateSpeciesMap",
    Flow: "courseMap",
    FlowRange: "courseRangeMap",
    FlowMutation: "courseMutationMap",
    FlowActivity: "courseActivityMap",
    Experiment: "experimentMap",
    ExperimentMutation: null,
    ExperimentActivity: "analysisActivityMap",
    Environment: "analysisEnvironmentMap",
    SimulationEnvironment: "realtimeEnvironmentMap",
    SimulationActivity: "realtimeActivityMap",
    OutputRange: "calcIntervalMap",
		ModelVersion: {isSelf: true},
    Model: {isSelf: true},
    ModelVersionDef: { source: "modelVersionMap", isListed: true },
    Page: "pageMap",
    Section: "sectionMap",
    Content: "contentMap",
    Reference: { source: "referenceMap", isShared: true },
    ModelReference: "modelReferenceMap",
    PageReference: "pageReferenceMap",
    ContentReference: "contentReferenceMap",
    Citation: "modelReferenceTypesMap",
    Sharing: { source: "shareMap", isPrivate: true },
    Link: { source: "linkMap", isPrivate: true },
    Document: { source: "uploadMap", isShared: true, isPublic: true },
    Layout: "layoutMap",
    LayoutComponent: "layoutNodeMap",
    LearningActivity: {source: "learningActivityMap", global: true},
    LearningActivityGroup: {source: "learningActivityGroupMap", global: true},
    TextEditorPanel: {source: "textEditorMap", bin: 'content', addVersionCopied: false},
    ImagePanel: {source: "imageMap", bin: 'content', addVersionCopied: false},
    Survey: {source: "surveyMap", bin: 'survey', addVersionCopied: false},
    SurveyQuestion: {source: "surveyQuestionMap", bin: 'survey', addVersionCopied: false},
    SurveyQuestionOption: {source: "surveyQuestionOptionMap", bin: 'survey', addVersionCopied: false},
		SurveyTableCell : {source : "surveyTableCellMap", bin : "survey", addVersionCopied: false},
		SurveyQuestionText: {source : "surveyQuestionTextMap", bin : "survey", addVersionCopied: false},
		UnitDefinition: {source: "unitDefinitionMap" },

		/**
		 * Metabolic Models
		 */
		Compartment: "compartments",
		Metabolite: "metabolites",
		SubSystem: "subsystems",
		Reaction: "reactions",
		ReactionMetabolite: "reactionMetaboliteMap",
		Gene: "genes",
		ObjectiveFunction: "objectives",
		ObjectiveReaction: "objectiveReactions",
		DrugEnvironment: "drugEnvironmentMap",

		KineticLaw: "kinetic_laws",
		KParameter: "globalParameters",
		VolumeUnit: "volumeUnits",

		/**
		 * Pharmacokinetic Models
		 */
		PKCompartment: "pkcompartments",
		Rate: "rates",
		Parameter: "parameters",
		ParameterVariability: "variabilities",
		ParameterCovariate: "covariates",
		Population: "populations",
		DosingRegimen: "dosings",

		Distribution: "distributions",
		Function: {source: "functions", types: ['pharmacokinetic']},
		Annotation: "annotations"
		
}).map(Utils.ext.bind(null, "source")).toObject();

Application.properties = Seq({
	Model: null,
	ModelVersion: { creationDate: "created", purchase: "isPaid" },
	BooleanModel: null,
	ConstraintBasedModel: null,
	KineticModel: null,
	PharmacokineticModel: null,
	ModelVersionDef: null,
	Component: { external: "isExternal" },
	Condition: { regulator: "parentId", regulatorId: "parentId", speciesRelation: "componentRelation" },
	ConditionSpecies: { conditionId: "parentId", speciesId: "componentId" },
	ConditionGene: { conditionId: "parentId", geneId: "geneId" },
	SubCondition: { conditionId: "parentId", speciesRelation: "componentRelation" },
	SubConditionSpecies: { subConditionId: "parentId", speciesId: "componentId" },
	SubConditionGene: { subConditionId: "parentId", geneId: "geneId" },
	Dominance: { positiveRegulatorId: "positiveId", negativeRegulatorId: "negativeId" },
	Interaction: { firstComponentId: "targetId", secondComponentId: "sourceId" },
	InitialState: null,
	InitialStateComponent: { initialStateId: "parentId", speciesId: "componentId" },
	Flow: null,
	FlowRange: { courseId: "parentId" },
	FlowMutation: { courseRangeId: "parentId", speciesId: "componentId" },
	FlowActivity: { courseRangeId: "parentId", speciesId: "componentId" },
	Experiment: { updateType: "type", published: "isPublic", creationDate: "created", simulations: "numSimulations", activityLevelRange: "activities", lastRunDate: "lastRun", courseId: "flowId" },
	OutputRange: { experimentId: "parentId" },
	ExperimentActivity: null,
	Environment: null,
	SimulationEnvironment: null,
	SimulationActivity: null,
	Page: { speciesId: "parentId" },
	Section: { pageId: "parentId" },
	Content: { sectionId: "parentId" },
	Reference: null,
	ModelReference: null,
	PageReference: { pageId: "parentId" },
	ContentReference: { contentId: "parentId", citationType: "literatureType" },
	Citation: { referenceId: "parentId", citationType: "literatureType" },
	Sharing: null,
	Link: { startDate: "start", endDate: "end", creationDate: "created" },
	Document: { uploadName: "name", fileType: "type", uploadDate: "uploaded" },
	Layout: { left: "minX", right: "maxX", bottom: "minY", top: "maxY" },
	LayoutComponent: { layoutId: "parentId" },
	LearningActivity: null,
	LearningActivityGroup: null,
	TextEditorPanel: null,
	ImagePanel: null,
	Survey: null,
	SurveyQuestion: null,
	SurveyTableCell: null,
	SurveyQuestionOption: null,
	SurveyQuestionText: null,
	UnitDefinition: null,

	/**
	 * Entites > Base
	 */
	Regulator: {
		// base properties
		regulationType: "type",
		// property extensions to logical models
		speciesId: "parentId",
		regulatorSpeciesId: "componentId",
		// property extensions to metabolic models
		reaction: "reactionId",
		gene: "geneId",

		annotations: "annotationIds",
	},

	/**
	 * Entities > Metabolic Models
	 */
	Compartment: null,
	Metabolite: {
		compartment: "compartmentId",
		annotations: "annotationIds"
	},
	SubSystem: null,
	Reaction: {
		annotations: "annotationIds",
		reaction: "reactionId"
	},
	ReactionMetabolite: {
		reaction: "reactionId",
		metabolite: "metaboliteId"
	},
	Gene: {
		annotations: "annotationIds"
	},
	ObjectiveFunction: null,
	ObjectiveReaction: {
		objectiveFunction: "objectiveFunctionId",
		reaction: "reactionId"
	},
	DrugScore: null,
	DrugEnvironment: null,

	/**
	 * Entities > Kinetic Models
	 */
	KineticLaw: null,
	KParameter: null,
	VolumeUnit: null,

	/**
	 * Entities > Pharmacokinetic Models
	 */
	PKCompartment: null,
	Rate: null,
	Parameter: null,
	ParameterVariability: null,
	ParameterCovariate: null,
	Population: null,
	DosingRegimen: null,

	Distribution: null,
	Function: null,
	Annotation: null,

	CoreReaction: null,
	ExcludeReaction: null,
	BoundaryReaction: null,

}).map(e => Utils.map(e || {})).toObject();

Application.values = (function() {
	const regulationType = Utils.map({
		NEGATIVE: false,
		POSITIVE: true
	});
	const conditionType = Utils.map({
		UNLESS: false,
		IF_WHEN: true
	});
	const relation = Utils.map({
		OR: false,
		AND: true
	});
	const state = Utils.map({
		OFF: false,
		ON: true
	});
	const mutation = Utils.map({
		NONE: 0,
		OFF: 1,
		ON: 2
	});
	const access = Utils.map({
		VIEW: 0,
		EDIT: 1,
		ADMIN: 2
	});
	const share = Utils.map({
		VIEW: 0,
		SHARE: 1
	});
	const fileType = Utils.map({
		JPG: "image",
		JPEG: "image",
		PNG: "image",
		PDF: "document",
		TXT: "document",
		CSV: "document",
		MP4: "video",
	});
	const date = { from: e => new Date(e) };
	const user = { from: (e, u) => (e === u ? null : e )};
	const richEditor = {
		from: e => { try { return EditorState.createWithContent(convertFromRaw(e)) } catch (e) { console.log("Error found within rich editor") } },
		to: e =>   convertToRaw(e.getCurrentContent())
	};

	const inner = (t, f, v, _, i, s) => {
		if (v) {
			const map = s[t];
			let id = map.size;
			map.merge(Seq(v).mapEntries(([k, v]) => [++id, new Immutable.Map({ id: id, parentId: i, componentId: k }).merge(f(v))]));
		}
	};
	const map = { from: v => new Immutable.Map(v || {}), to: (v) => (v ? v.toJS() : {} )};
	const set = { from: v => new Immutable.Set(v || {}), to: (v) => (v ? v.toJS() : {} )};

	return {
		Model: {
			created: date,
			updated: date
		},
		ModelVersionDef: {
			creationDate: date
		},
		Component: {
			absentState: state,
			x: {},
			y: {}
		},
		Regulator: {
			type: regulationType,
			conditionRelation: relation
		},
		Condition: {
			type: conditionType,
			state: state,
			componentRelation: relation,
			subConditionRelation: relation
		},
		SubCondition: {
			type: conditionType,
			state: state,
			componentRelation: relation
		},
		Experiment: {
			created: date,
			lastRun: date,
			mutations: {
				from: inner.bind(null, "ExperimentMutation", e => ({ state: mutation.from[e] })),
				to: e => Seq(e).mapEntries(([_, e]) => [(e.component || e.gene).Persisted, mutation.to[e.state]]).toObject()
			},
			activities: {
				from: inner.bind(null, "ExperimentActivity", e => ({ min: e.minimum, max: e.maximum })),
				to: e => Seq(e).mapEntries(([_, e]) => [(e.component || e.reaction).Persisted, { minimum: e.min, maximum: e.max }]).toObject()
			},
			userId: user
		},
		LearningActivity: {
			workspaceLayout: map,
			views: set
		},
		FlowMutation: {
			state: mutation
		},
		Sharing: {
			access: access
		},
		Link: {
			access: share,
			created: date
		},
		Document: {
			type: fileType,
			uploaded: date
		},
		Survey: {
			description: richEditor
		},
		SurveyQuestion: {
			text: richEditor,
			questionText: richEditor
		},
		SurveyQuestionText: {
			text: richEditor
		},
		TextEditorPanel: {
			editorText: richEditor
		},
		ImagePanel: {
			caption: richEditor,
			uploaded: date
		}
	};
})();

Application.maxFavorites = 7;

/**
 * This property returns the API URL, e.g., teach.org, learn.org, or research.org.
 */
Application.api = (function () {
	let apiUrl = '/';
	switch (Application.domain) {
		case LEARNING: apiUrl = import.meta.env.VITE_CC_URL_LEARN + "/web"; break;
		case TEACHING: apiUrl = import.meta.env.VITE_CC_URL_TEACH + "/web"; break;
		case RESEARCH: apiUrl = import.meta.env.VITE_CC_URL_RESEARCH + "/web"; break;
	}
  return apiUrl;
})();

Application.isModelIt = true;

Application.currSubdomain = getCurrentSubdomain();

// TO BE REDONE: Use AppConfig.version instead. This might cause persistent issues so advisable to clear cache.
Application.version = "0021";

export {
	TEACHING,
	LEARNING,
	RESEARCH
}
