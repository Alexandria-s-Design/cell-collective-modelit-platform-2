
export default function entityPrototype(entityOrig) {
	let name;
	if (entityOrig) {
		name = Object.getPrototypeOf(entityOrig).className;
	}
	return {
		is: (entityName) => name && name === entityName,
		getName: () => name
	}
}