const ModelMetabolicMap = require("../../../../cc/server/api/manageModel/JsonMap/ModelMetabolicMap");
const Immutable = require("immutable");
describe('Testing JSON Maps for Models', () => {

	it('Should fill targetModel with notes when reactions are provided', () => {
		const model = new ModelMetabolicMap();
		const targetModel = {};
		const reactions = [
			{
				newId: 1,
				name: 'Reaction 1',
				notes: {
					note1: 'This is note 1',
					note2: 'This is note 2'
				}
			},
			{
				newId: 2,
				name: 'Reaction 2',
				notes: {
					note3: 'This is note 3',
					note4: 'This is note 4'
				}
			}
		];

		model.fillReactionNotes(targetModel, reactions);

		expect(targetModel.pageMap).toEqual({
			'-1': { reactionId: 1 },
			'-5': { reactionId: 2 }
		});

		expect(targetModel.sectionMap).toEqual({
			'-2': {
				pageId: -1,
				position: 0,
				title: 'Reaction 1',
				type: 'Description'
			},
			'-6': {
				pageId: -5,
				position: 0,
				title: 'Reaction 2',
				type: 'Description'
			}
		});

		expect(targetModel.contentMap).toEqual({
			'-3': { sectionId: -2, position: 0, text: 'note1 This is note 1' },
			'-4': { sectionId: -2, position: 1, text: 'note2 This is note 2' },
			'-7': { sectionId: -6, position: 0, text: 'note3 This is note 3' },
			'-8': { sectionId: -6, position: 1, text: 'note4 This is note 4' }
		});
	});

	it('should return an Immutable Map when results are provided', () => {
		const results = [
			{ id: 88, name: 'Result 1' },
			{ id: 99, name: 'Result 2' }
		];

		const map = ModelMetabolicMap.buildMapToResults(results);

		expect(Immutable.Map.isMap(map)).toBe(true);
		expect(map.size).toBe(2);
		expect(map.get(88).toJS()).toEqual({ name: 'Result 1' });
		expect(map.get(99).toJS()).toEqual({ name: 'Result 2' });
		expect(map.get(100)).toBeUndefined();
	});

})