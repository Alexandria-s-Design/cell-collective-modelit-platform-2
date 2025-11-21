import crypto from "crypto";
import uuidv4 from "uuid/v4";

const generateHash = (string = null, { hash = "sha1" } = { }) =>
{
    string       = string ? string : uuidv4();
    
    const algo   = crypto.createHash(hash);
    algo.update(string);

    const digest = algo.digest("hex");

    return digest;
};

const generateKeyTime = () => {
	let dt = new Date();
	let result = `${dt.getFullYear()}`;
	let numbers = [
		dt.getMonth(), dt.getDate(),
		dt.getHours(), dt.getMinutes(),
		dt.getSeconds(), dt.getMilliseconds()
	];
	result += numbers.map(tm => `${tm}`.padStart(2, "0")).join("")
	return result;
}

export { generateHash, generateKeyTime };