import path from 'path';
import fs from 'fs';
import models from "../../../models";

export const getLastModelVersion = async (modelId) => {
	let lastModelVersion = await models.ModelVersion.findOne({
		where: {
			modelid: modelId
		},
		order: [ [ '_createdAt', 'DESC' ] ]
	});

	if ( !lastModelVersion ) {
		const allModelVersions = await models.ModelVersion.findAll({
			where: {
				modelid: modelId
			}
		});
		
		let version = 1;

		for ( const mModelVersion of allModelVersions ) {
			if ( mModelVersion.version > version ) {
				lastModelVersion = mModelVersion
			}
		}
	}

	return lastModelVersion
}

const loadingModels = {};
export const waitSingleLoad = (k) => {
	return new Promise((resolve, reject) => {
		if(!loadingModels[k]){
			resolve();
			return;
		}
		
		setTimeout(() => {
			waitSingleLoad(k).then(() => resolve()).catch(reject);
		}, 100);	//wait 100ms for load
	});
}
export const markSingleLoad = async (k, call) => {
	let ret;
	try{
		loadingModels[k] = true;
		ret = await call();
		if(loadingModels[k])
			delete  loadingModels[k];
	}catch(e){
		if(loadingModels[k])
			delete  loadingModels[k];
		throw e;
	}
	return ret;
}

export const _objectify	= (arr, fn) => {
	const objekt = { };

	for ( let i = 0, n = arr.length ; i < n ; ++i ) {
		const o 			= arr[i]; 
		const result 	= fn(o, i);

		for ( const key in result ) {
			objekt[key] = result[key];
		}
	}

	return objekt
}

const existAsync = (path, reason = fs.constants.R_OK) => new Promise((resolve, reject) => {
	fs.access(path, reason, (err) => {
		if(err)
			resolve(false)
		else
			resolve(true)
	});
});

/**
 * @param {string} filename
 * @returns {Promise<string|null>}
 */
export const getCoverImage = async (filename) => {
	let filePath = path.join("/cache", "model_images", `${filename}.webp`);
	if (await existAsync(filePath)) {
		return filePath;
	}

	filePath = path.join("/cache", "model_images", `${filename}.png`);
	if (await existAsync(filePath)) {
		return filePath;
	}

	return null;
}