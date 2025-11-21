export default function errorResponse(errStr = "") {
	let message = '', code = 500;
	if (errStr.hasOwnProperty("message")) {
		message = errStr.message;
	} else {
		let jsonRes = JSON.parse(errStr);	
		code = jsonRes.code;
		message = jsonRes.error.errors.map(e => e.message.error || e.message).join('; ');
	}	
	return {
		code,
		message,
	}
}