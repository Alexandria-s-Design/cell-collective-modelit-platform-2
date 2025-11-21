import Entity from "./Entity";

export default class CancelSubscriptionState extends Entity {
	userId;
	isCanceled = false;

	constructor(datas) {
		super(datas);
		this.dataTransfer(datas);
	}
}