module.exports = {
  transform: {
    "^.+\\.jsx?$": "babel-jest",
  },
  testRegex: "(/tests\/spec/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$",
  moduleFileExtensions: ["js", "jsx", "json", "ts", "tsx"],
	collectCoverage: true,
  coverageDirectory: 'tests/coverage',
  coverageReporters: ['html', 'text'],
	testTimeout: 30000
};