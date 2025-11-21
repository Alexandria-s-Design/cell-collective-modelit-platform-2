import Immutable, { Seq } from "immutable";
import Entity from "./Entity";

export default class ModelVersionDef extends Entity {}

Entity.init({ModelVersionDef}, {
	name: { maxLength: 100, defaultVal: "1.0"},
	selected: null,
	description: { maxLength: 255 },
	creationDate: null
});