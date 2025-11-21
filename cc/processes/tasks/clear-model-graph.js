import fs from "fs";
import path from "path";
import logger from "../../logger";

import sharp from "sharp";

import { IMAGE_CHECKS } from "../../server/api/model"

export default async (done) => {
	try {
		logger.info("Clearing corrupted model images...");
	
		const PATH_CACHE_IMAGE = path.join("/cache", "model_images");
	
		const files = fs.readdirSync(PATH_CACHE_IMAGE);
	
		for ( const file of files ) {
			const pathImage = path.join(PATH_CACHE_IMAGE, file);
	
			let isValid   = true;
	
			for ( const imageCheck of IMAGE_CHECKS ) {
				const check = await imageCheck(pathImage);
	
				if ( check ) {
					isValid = false;
					break;
				}
			}
	
			if ( !isValid ) {
				logger.info(`Unable to save image for ID: ${file} (corrupted).`)
				fs.unlinkSync(pathImage);
			} else {
				// resizing images.
				try {
					await sharp(pathImage)
							.resize({ height: 200 })
							.toFile(pathImage);
				} catch (e) {
					logger.error(`Unable to resize: ${e}`);
				}
			}
		}
	} catch (e) {
		logger.info(`Error while performing image check: ${e}`);
		throw e;
	}

	done()
}