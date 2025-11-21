import * as fs from "fs";
import path from "path";
import { sync as globSync } from "glob";
import { sync as mkdirpSync } from "mkdirp";

const MESSAGES_PATTERN = "cc/public/messages/**/*.json";
const LANG_DIR = "cc/client/app/locales";

const deleteFolderRecursive = function(path) {
  if (fs.existsSync(path)) {
    fs.readdirSync(path).forEach(function(file, index){
    var curPath = path + "/" + file;
    if (fs.lstatSync(curPath).isDirectory()) {
      deleteFolderRecursive(curPath);
    } else { // delete file
      fs.unlinkSync(curPath);
    }
    });
    fs.rmdirSync(path);
  }
};

// Aggregates the default messages that were extracted from the example app's
// React components via the React Intl Babel plugin. An error will be thrown if
// there are messages in different components that use the same `id`. The result
// is a flat collection of `id: message` pairs for the app's default locale.
const defaultMessages = globSync(MESSAGES_PATTERN)
  .map(filename => fs.readFileSync(filename, "utf8"))
  .map(file => JSON.parse(file))
  .reduce((collection, descriptors) => {
    descriptors.forEach(({ id, defaultMessage }) => {
      if (collection.hasOwnProperty(id)) {
        throw new Error(`Duplicate message id: ${id}`);
      }
      collection[id] = defaultMessage;
    });

    return collection;
  }, {});

// Create a new directory that we want to write the aggregate messages to
mkdirpSync(LANG_DIR);

// Merge aggregated default messages with the translated json files and
// write the messages to this directory
fs.writeFileSync(
  path.join(LANG_DIR, 'data.json'),
  JSON.stringify(defaultMessages, null, 2)
);

try {
  deleteFolderRecursive("cc/public/messages");
} catch (error) {
  console.log(error);
}