
export default class Entity {

	dataTransfer (datas) {
		if (datas == undefined) {
			return;
		}
		const properties = Object.keys(datas);
		if (properties.length) {
			properties.forEach(key => {
				this[key] = datas[key];
			});
		}
	}	
}