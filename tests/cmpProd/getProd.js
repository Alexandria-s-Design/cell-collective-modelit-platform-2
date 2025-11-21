import axios from 'axios';
import { promises as fs } from 'fs';
import { program } from 'commander';
import { strict as assert } from 'assert';



program.version('0.0.1')
	.option('-u, --url <url>', 'CC URL', 'http://research.cellcollective.org')
	.option('-d, --dir <dir>', 'directory to save models','./data')
  .option('-s, --skipErr', 'skip errors')
  .parse(process.argv);

	//unhandled promise rejection throws error
process.on('unhandledRejection', up => { 
	if(program.skipErr){
		console.error(up);
	}else{
		throw up;
	}
})


async function doGet(...args){
	console.log("calling ", args[0]);
	return await axios.get(...args);
}

Array.prototype.forEachAsync = async function(cbk){
	for(let i = 0; i < this.length; i++){
		const el = this[i];
		await cbk(el, i, this);
	}
};


const URL = program.url;
const EXPORT_DIR = program.dir;

const run = async () => {
	console.log(`CREATING DIR TO SAVE ${EXPORT_DIR}`);
	await fs.mkdir(EXPORT_DIR, {recursive: true});

	console.log("GETTING model request");

//	const { data, status } = await doGet(`${URL}/api/model/get?_=${new Date().getTime()}`);
	const { data: {data}, status } = await doGet(`${URL}/api/model?_=${new Date().getTime()}`);

	//200-299
	assert(Math.floor(status/100) === 2, "request returns valid status code");
	assert(data.length >= 1, "there is more than 1 public model");

	await data.forEachAsync(async ({model, modelType}) => {
		try{
		const id  = model.id;
		const version = model.currentVersion;

		console.log(`EXPORTING SBML FOR MODEL ${id} (ver. ${version})`);

		const exported = await doGet(`${URL}/api/model/${id}/version/${version}?hash=${new Date().getTime()}&slim=true`);
		assert(Math.floor(exported.status/100) === 2, "request returns valid status code");
		assert(exported.data.data !== undefined, "request contains response");

		const EXPORT_FILE = `${EXPORT_DIR}/${id}_${version}_${modelType}.json`;

		console.log(`WRITING TO FILE ${EXPORT_FILE}`);
		await fs.writeFile(EXPORT_FILE, JSON.stringify(exported.data.data), 'utf8');
		}catch(e){
			console.error(e);
			if(!program.skipErr){
				throw e;
			}
		}
	});

	console.log("EXPORT WAS SUCCESSFULL");
}

run();