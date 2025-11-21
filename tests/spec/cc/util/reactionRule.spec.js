const { Seq } = require("immutable");
const { parseGeneReactionRule, removeInvalidRule } = require("../../../../cc/util/reactionRules");


describe('Testing reaction rule into Models', () => {

  it('Should correctly parse gene reaction rules for regulators in the Regulatory Mechanism', async () => {
    
		let expected_data = [
			'99992,99993,99995,99997',
			'278757'
		];
		let test_data = [
			'99997 or 99993 or (99995 and 99992)',
			'278757 and (null and null and null)'
		];
		let result_components = [];
		let result_regulators = [];

		let i = 0, n=3;
		for (let i=0; i<test_data.length; i++) {
			let ruleResult = await parseGeneReactionRule(test_data[i], true, {i,n})
			result_components.push(Seq(ruleResult.data.data.components).map(v => v.name).toArray().sort().join(','))
			result_regulators.push(Seq(ruleResult.data.data.regulators).count())
		}

		expect(expected_data).toEqual(result_components);
    expect([3,1]).toEqual(result_regulators);
  });

	it ('Should remove invalid rules', () => {

		let expected_data = [
			'(278813 and ( 278814 and 278817 ) and ( 522 ))',
			'(278813 and ( 150 and 160 ) and ( 120 ))',
			'(278813)',
			'(278757)',
			'(278813 and ( 250 ))',
			'(( 278745 and ( 300 and ( 600 and 800 or 150 ) ) ) or ( 278966 and ( 100 ) ))',
			'(278852 or 520)',
			'(( 278750 ) or ( 278761 ))',
			'(( 279269 ) or ( 278745 ) or ( 278788 ))',
			'(279030)'
		]
		let test_data = [
			' 278813 and (null and 278814 and 278817 and null) and (522 and null)',
			'278813 and (null and 150 and null and 160) and (120 and null)',
			'278813 and (null and null and null and null)',
			'278757 and (null and null and null)',
			'278813 and (null and 250 and null and null)',
			'(278745 and (null and 300 and (600 and 800 and null or 150))) or (278966 and (100 and null))',
			'278852 and null or 520',
			'(278750 and null) or (278761 and null)',
			'(279269 and (null and null and null)) or (278745 and (null and null and null)) or (278788 and (null and null and null and null))',
			'279030 and ((null and null) or (null and null))'
		]

		let result_data = []

		test_data.forEach(test => {
			result_data.push(removeInvalidRule(test))
		})		

		expect(expected_data).toEqual(result_data)
	})

});