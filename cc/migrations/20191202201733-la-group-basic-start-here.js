'use strict';

function promisesSequentially(){
  let ret = Promise.resolve();
  for(let i = 0; i < arguments.length; ++i){
    ret = ret.then(function() {
      return arguments[i];
    });
  }
  return ret;
}

const DEFAULT_GROUP_NAME = 'Start Here';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query("\
          BEGIN;\
          INSERT INTO learning_activity_groups ( name, position, masterid )  \
            SELECT  '"+DEFAULT_GROUP_NAME+"', 1, masterid \
            FROM    learning_activity  \
            GROUP BY masterid; \
          \
          UPDATE learning_activity la SET \
          groupid=(\
              SELECT id FROM learning_activity_groups lag WHERE \
                la.masterid=lag.masterid AND lag.name='"+DEFAULT_GROUP_NAME+"' LIMIT 1\
            ); \
          COMMIT; \
      "
    );
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(" \
       BEGIN;\
        TRUNCATE learning_activity_groups; \
        UPDATE learning_activity SET groupid=NULL WHERE \
          ( \
            SELECT name FROM learning_activity_groups \
              WHERE learning_activity_groups.id=learning_activity.groupid \
          ) = '"+DEFAULT_GROUP_NAME+"'; \
      COMMIT; \
    ");
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    */
  }
};
