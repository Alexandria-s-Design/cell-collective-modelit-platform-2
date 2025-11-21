import axios from 'axios';
import fs, {promises as fsPromises} from 'fs';
import {program} from 'commander';
import FormData from 'form-data';
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
});


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
    console.log(`READING DIRECTORY TO IMPORT ${EXPORT_DIR}`);
    const files = await fsPromises.readdir(EXPORT_DIR);
    console.log(`FOUND ${files.length} files`);

    await files.forEachAsync(async (el, idx, arr) => {
        const FILE_PATH = `${EXPORT_DIR}/${el}`;

        let type;
        try {
            type = el.split('.')[0].split("_")[2];
        } catch (e) {
            console.error(`Error parsing type ${type}`);
            console.error(e);
        }
        if (!type) {
            return;
        }
        try {
            const form_data = new FormData();
            //		form_data.append("upload", fs.createReadStream(FILE_PATH), el);
            form_data.append("file", fs.createReadStream(FILE_PATH), el);
            form_data.append("slim", "true");
            form_data.append("type", type);

            const SAVE_URL = `${URL}/api/model/import`;
            console.log(`PROCESSING ${FILE_PATH} VIA ${SAVE_URL}`);
            const {data: {data}, status, headers} = await axios.post(SAVE_URL, form_data, {
                headers: form_data.getHeaders(),
            });

            //200-299
            assert(Math.floor(status / 100) === 2, "request returns valid status code");
            assert(data[0].data['1'], "the imported model is inside [1] field");
        } catch (e) {
            console.error(e);
            if (!options.skipErr) {
                throw e;
            }
        }

    });

    console.log("IMPORT SUCCESSFULL");
}

run();
