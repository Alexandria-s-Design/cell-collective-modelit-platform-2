const { defineConfig } = require('cypress')

module.exports = defineConfig({
  defaultCommandTimeout: 10000,
  chromeWebSecurity: false,
  modifyObstructiveCode: false,
  video: true,
  videoUploadOnPasses: false,
  projectId: '4375br',
  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      return require('./cypress/plugins/index.js')(on, config)
    },
    excludeSpecPattern: '**/*.ignore.js',
    specPattern: 'cypress/e2e/**/*.{js,jsx,ts,tsx}',
		experimentalSessionAndOrigin: true,
		testIsolation: 'off',
  },
	env: {
		// CC_TEST_URL: 'https://hotfix.cellcollective.org/',
		CC_TEST_PASSWORD: 'hdMHOMCPsm',
		CC_TEST_EMAIL: 'CCHLTestUNL@gmail.com',
	},
	
	
	

})
