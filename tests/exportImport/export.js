import axios from 'axios';
import {Seq} from 'immutable';
import {promises as fs} from 'fs';
import {program} from 'commander';
import {strict as assert} from 'assert';

program.version('0.0.1')
    .option('-u, --url <url>', 'CC URL', 'http://localhost:5000')
    .option('-d, --dir <dir>', 'directory to save models', './data')
    .option('-s, --skipErr', 'skip errors');

program.parse(process.argv);

const options = program.opts();
const URL = options.url;
const EXPORT_DIR = options.dir;

//unhandled promise rejection throws error
process.on('unhandledRejection', up => {
    if (options.skipErr) {
        console.error(up);
    } else {
        throw up;
    }
})


async function doGet(...args) {
    console.log("calling ", args[0]);
    return await axios.get(...args);
}

Array.prototype.forEachAsync = async function (cbk) {
    for (let i = 0; i < this.length; i++) {
        const el = this[i];
        await cbk(el, i, this);
    }
};

const run = async () => {
    console.log(`CREATING DIR TO SAVE ${EXPORT_DIR}`);
    await fs.mkdir(EXPORT_DIR, {recursive: true});

    console.log("GETTING model request");

//	const { data, status } = await doGet(`${URL}/api/model/get?_=${new Date().getTime()}`);
//	const { data: {data}, status } = await doGet(`${URL}/api/model?cards=9999999&_=${new Date().getTime()}`);
//	const { data: {data}, status } = await doGet(`${URL}/_api/model/cards/research?cards=9999999&_=${new Date().getTime()}`);
    const {
        data,
        status
    } = await doGet(`${URL}/api/model/cards/research?category=published&cards=9999999&_=${new Date().getTime()}`);

//	console.log("LOADED DATA", data);

    //200-299
    assert(Math.floor(status / 100) === 2, "request returns valid status code");
    assert(data.length >= 1, "there is more than 1 public model");

    console.log(`EXPORTING ${data.length} models`);

    await data.forEachAsync(async ({model}) => {
        const {modelType} = model;
        if (modelType !== "boolean") {
            return;
        }
        try {
            const id = model.id;
            const version = model.currentVersion || model.selectedVersion || Seq(model.modelVersionMap).keySeq().first();

            console.log(`EXPORTING SBML FOR MODEL ${id} (ver. ${version})`);
            const exported = await doGet(`${URL}/api/model/${id}/export/version/${version}?type=SBML`);
            assert(Math.floor(exported.status / 100) === 2, "request returns valid status code");
            assert(exported.data.length >= 100, "request response is big enough ( > 100B )");

            const EXPORT_FILE = `${EXPORT_DIR}/${id}_${version}_${modelType}.sbml`;

            console.log(`WRITING TO FILE ${EXPORT_FILE}`);
            await fs.writeFile(EXPORT_FILE, exported.data, 'utf8');
        } catch (e) {
            console.error(e);
            if (!options.skipErr) {
                throw e;
            }
        }
    });

    console.log("EXPORT WAS SUCCESSFULL");
}

run();
