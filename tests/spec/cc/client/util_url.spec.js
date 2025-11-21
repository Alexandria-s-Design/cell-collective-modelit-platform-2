var UtilUrl = require('../../../../cc/client/app/util/url');

describe('Testing Util at frontend', () => {

  test('Should be a valid course id', () => {

		let urls = [
			'https://teach.cellcollective.org/?dashboard=true#module/295469:2/cexam-scores/training--practice-model/420',
			'https://localhost/?dashboard=true#module/295469:1/other-scores/training--practice-model/10/81',
		]
		
		let dataResult = [];
		let expectedResult = ["420", "81"];

		urls.forEach(url => {
			dataResult.push(UtilUrl.getCourseIdFromUrl(url))
		})
		
		expect(expectedResult).toEqual(dataResult)
	})
})