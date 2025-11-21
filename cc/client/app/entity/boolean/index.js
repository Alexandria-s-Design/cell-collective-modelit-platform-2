import { Seq } from "immutable";

import Entity from "../Entity";
import ModelVersion, {
	references
} from "../ModelVersion";

export default class BooleanModel extends ModelVersion {
	get modelType ( ) {
		return "boolean";
	}

	build (g) {
		super.build(g);
	}
}

Entity.init({ BooleanModel }, {
	...references
});