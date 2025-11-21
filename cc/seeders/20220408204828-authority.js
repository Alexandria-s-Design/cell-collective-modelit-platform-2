'use strict';

module.exports = {
  up: (queryInterface) => {
   return queryInterface.bulkInsert('authority', [{
		user_id: 22279,
		role_id: 1,
   },
  ], {
     individualHooks: true
   });
  },

  down: (queryInterface) => {
   return queryInterface.bulkDelete('authority', null, {});
  }
};
