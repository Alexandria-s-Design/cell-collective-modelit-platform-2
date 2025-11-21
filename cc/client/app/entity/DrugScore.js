import { Seq } from "immutable";
import Entity from "./Entity";

export default class DrugScore extends Entity {
	select() {
		return [this.validRanges.maxBy(e => e.to) || "OutputRange"].concat(this.flow && this.flow.select());
	}

	get validRanges() {
		return Seq(this.ranges).filter(e => e.from !== e.to);
	}
}

Entity.init({DrugScore}, {
	parentId: { ref : "envExperimentDrugList" },
	code: 999,
	name: '',
	moa: null,
	target: null,
	entrez_gene_id: null,
	phase: '',
	d_score: 0
}, {
	mutations: { nullable: false, entity: "DrugScoreMutation" },
	ranges: false
});
