import isEmpty from "lodash.isempty";

import COUNTRIES from "../data/countries";

const CURRENCIES = Array.from(
	new Set(
		COUNTRIES.map(country  => country.currency)
				.filter(currency => !isEmpty(currency) && !isEmpty(currency.name) && !isEmpty(currency.code))
				.map(currency => ({ name: currency.name.trim(), symbol: currency.code.trim() }))
				.map(currency => JSON.stringify(currency))
	)
).map(o => JSON.parse(o));

const LANGUAGES  = Array.from(
	new Set(
		[].concat(...COUNTRIES.map(country => country.languages))
			.filter(language => !isEmpty(language))
	)
).map(l => ({ name: l }));

export default {
	up: async (queryInterface) => {
		await queryInterface.bulkInsert('Currencies', CURRENCIES);
		await queryInterface.bulkInsert('Languages',  LANGUAGES,  { fields: ['name'], ignoreDuplicates: true });

			await COUNTRIES.map(async country => {
			const { sequelize } = queryInterface;
			const { currency, languages } = country;

			!isEmpty(currency) && !isEmpty(currency.name) && !isEmpty(currency.code) &&
					await sequelize.query(`SELECT id FROM "Currencies" WHERE name = '${currency.name}'`, {
						type: sequelize.QueryTypes.SELECT
					});
			!isEmpty(languages) &&
					await sequelize.query(`SELECT id FROM "Languages"  WHERE name IN [${languages.map(l => `'${l}'`).join(",")}]`, {
						type: sequelize.QueryTypes.SELECT
					});

			return await true;
		});

		return await true;
	},
	down: async (queryInterface, { Op }) => {
		await queryInterface.bulkDelete('Currencies', {
			name: {
				[Op.or]: CURRENCIES.map(currency => currency.name)
			}
		});

		await queryInterface.bulkDelete('Languages',  {
			name: {
				[Op.or]: LANGUAGES.map(languages => languages.name)
			}
		});
		
		return await true
	}
}
