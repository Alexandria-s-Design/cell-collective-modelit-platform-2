import { Seq } from 'immutable';



/****** Constants for setting up the environment ********/

//all features for development
export const PAYMENTS = "PAYMENTS";
export const COURSES = "COURSES";

export const allDevFeatures = [
	PAYMENTS,
	COURSES
];




/****** Manupulation functions ********/

//what key in the localStorage are the data stored under
const STORAGE_KEY = "__betaFeatures";

//everything disabled by default
let enabledFeatures = (JSON.parse(localStorage[STORAGE_KEY] || "{}")) || {};

const allDevFeaturesAsObj = Seq(allDevFeatures).toMap().mapEntries(([_, v]) => [v, true]).toObject();

export function isDevFeatureEnabled(featureKey){
	if(!allDevFeaturesAsObj[featureKey]){
		throw new Error(`unknown development feature ${featureKey}`)
	}

	return !!enabledFeatures[featureKey];
}

export function setNewDevFeatures(featureList){
	localStorage[STORAGE_KEY]  = JSON.stringify(enabledFeatures = featureList);
}