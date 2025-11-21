'use strict';

/**
 * This function should be used to retrieve the ID
 * of the original lesson created by a teacher
 * that a student has started.
 */
module.exports = {
  up: async (queryInterface, Sequelize) => {

		const script = `
		CREATE OR REPLACE FUNCTION fn_latest_version(mid bigint, mtype varchar(10))
		RETURNS bigint AS $$
		DECLARE
			rtn_id bigint = null;
		BEGIN
			if mtype = 'boolean' then	
				select modelid from model_version mv1
					where mv1.id = (select id from model_version mv2 where mv2.modelid = mid limit 1)
					order by mv1."version" desc limit 1 into rtn_id;
				end if;
			if rtn_id is null then
				return use_version(mid);
			end if;
			return rtn_id;
		END;
		$$ LANGUAGE plpgsql;`;

    return await queryInterface.sequelize.query(script);
		
  },
  down: async (queryInterface) => {
    return await queryInterface.sequelize.query('DROP FUNCTION fn_latest_version');
  }
};