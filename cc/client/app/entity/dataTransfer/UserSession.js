import Entity from "./Entity";

export default class UserSession extends Entity {
	email;
	firstName;
	id;
	institution;
	lastName;
	name;
	token;
	userDomainAccess = {
		admin: true,
		labmember: true,
		learn: true,
		research: true,
		teach: true,
		editor: true
	}

	constructor(datas) {
		super(datas);
		this.dataTransfer(datas);
	}
}