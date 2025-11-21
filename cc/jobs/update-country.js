import COUNTRIES from "../data/countries";

import models from "../db";

export default async () => {
    for (const country of COUNTRIES) {
        await models.Country.findOrCreate({
            name: country.name
        }, {
            where: {
                name: country.name
            }
        });

        if ( country.currency ) {
            await models.Currency.findOrCreate({
                name: country.currency.name
            }, {
                name:   country.currency.name,
                symbol: country.currency.code
            });
        }
    }
};