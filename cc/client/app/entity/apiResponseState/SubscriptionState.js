import Entity from "./Entity";

export default class SubscriptionState extends Entity {
	hasUserSubscription = false;
	user;
	userId;

	constructor(datas) {
		super(datas);
		this.dataTransfer(datas);
	}
}