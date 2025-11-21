// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)
const { lighthouse, prepareAudit } = require('cypress-audit');
const fs = require('fs');

module.exports = (on, config) => {
    on("before:browser:launch", (browser = {}, launchOptions) => {
        if (browser.family === "chromium" && browser.name !== "electron") {
            launchOptions.args.push("--disable-dev-shm-usage")
        }
        prepareAudit(launchOptions);

        return launchOptions
    });
    on('task', {
        lighthouse: lighthouse(),
        deleteFile(filePath) {
            return new Promise((resolve, reject) => {
                fs.unlink(filePath, (err) => {
                    if (err) {
                        if (err.code === 'ENOENT') {
                            // File doesn't exist, that's fine
                            return resolve(null);
                        }
                        return reject(err);
                    }
                    resolve(null);
                });
            });
        }
    });
}
