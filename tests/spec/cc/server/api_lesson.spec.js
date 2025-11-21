const Lesson = require("../../../../cc/server/api/manageModules/Lesson");

describe('Testing Lessons', () => {

  test('Methods for starting lesson', () => {
		
		const lessonTest = new Lesson({Sequelize: {}});
		const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(lessonTest));

		const expected = ['registeringInitiation',
		'getLessonsAttempts',
		'setOriginAtLesson',
		'disableInitiationAttempts',
		'startLesson',
		'submitLesson'];

		const actual = [];

		methods.forEach(m => {
			if (expected.includes(m)) {
				actual.push(m);
			}
		});

    expect(expected.length).toBe(actual.length);
		
  });

});