'use strict';

module.exports = {
  up: (queryInterface) => {
   return queryInterface.bulkInsert('authority', [{
		user_id: 767,
		role_id: 4,
   },
  ], {
     individualHooks: true
   });
  },

  down: (queryInterface) => {
   return queryInterface.bulkDelete('authority', {
		user_id: 767,
		role_id: 4
  });
}
};