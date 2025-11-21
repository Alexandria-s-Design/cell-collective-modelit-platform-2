const constructGetParams = (data) => {
	const p = new URLSearchParams("");
	for(const k in data){
		if(data[k]){
			p.set(k, data[k]);
		}
	}
	return p.toString();
}

//Current: window.location.href
export function getCourseIdFromUrl(currentUrl) {
	var allValues = currentUrl.split('/').filter(value => !isNaN(value) && value.trim() !== "");
	if (allValues.length) {
		return allValues[allValues.length-1]
	}
}

export default {constructGetParams};