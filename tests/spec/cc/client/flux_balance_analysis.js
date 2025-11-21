var Module = require('../../../../cc/client/app/component/metabolic/Analysis/FluxBalanceAnalysis/fba');

const path = require('path');
const fs = require('fs');

describe('Testing FBA on Constraint-Based Model', () => {

	test('flux balance analysis with FBA.wasm', async () => {
    const wasmCode = fs.readFileSync(path.resolve(__dirname, '../../../../cc/client/app/component/metabolic/Analysis/FluxBalanceAnalysis/fba.wasm'));
		const fixtureFBAJson = fs.readFileSync(path.resolve(__dirname, '../../fixtures/cbm_fba.json'));

		const fbaWasm = await Module(wasmCode)
		let fbaJsonString = fixtureFBAJson.toString('utf8');
		
		let dataResult = fbaWasm.analyze_fba(fbaJsonString);
		dataResult = JSON.parse(dataResult);

		const expectedResult = {
      status: 'optimal',
      objective_value: 523,
      fluxes: { '13723': 0, '13724': 523, '22796': 0 },
      show_prices: {
        '10038': 0,
        '10039': 0,
        '10040': 0,
        '10041': 0,
        '10042': 0,
        '10043': 0,
        '10044': 0,
        '10045': 0,
        '10046': 1
      }
    };


    expect(expectedResult).toEqual(dataResult);

  });

})