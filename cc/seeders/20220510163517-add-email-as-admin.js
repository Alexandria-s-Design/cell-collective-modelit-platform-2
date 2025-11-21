'use strict';

module.exports = {
	async up(queryInterface, Sequelize) {
		return queryInterface.bulkInsert('model_share', [{
			id: 10830,
			access: 'ADMIN',
			creationdate: new Date(),
			email: "",
			updatedate: new Date(),
			userid: 767,
			model_id: 121704
		},
		{
			id: 10831,
			access: 'ADMIN',
			creationdate: new Date(),
			email: "",
			updatedate: new Date(),
			userid: 767,
			model_id: 141066
		},
		{
			id: 10832,
			access: 'ADMIN',
			creationdate: new Date(),
			email: "",
			updatedate: new Date(),
			userid: 767,
			model_id: 126290
		},
		{
			id: 10833,
			access: 'ADMIN',
			creationdate: new Date(),
			email: "",
			updatedate: new Date(),
			userid: 767,
			model_id: 123988
		},
		{
			id: 10834,
			access: 'ADMIN',
			creationdate: new Date(),
			email: "",
			updatedate: new Date(),
			userid: 767,
			model_id: 223854
		},

		], {
			individualHooks: true
		});
	},

	async down(queryInterface, Sequelize) {
		queryInterface.bulkDelete('model_share', {
			id: {
				[Op.gte]: 10830
			},
		});


	}
};
