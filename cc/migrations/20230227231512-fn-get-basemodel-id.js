'use strict';

/**
 * This function can be used to get a Base Model ID from the versions table, just by passing any model ID.
 */
module.exports = {
  up: async (queryInterface, Sequelize) => {

		const script = `
		CREATE OR REPLACE FUNCTION fn_get_basemodel_id(prm_model_id BIGINT)
		RETURNS bigint AS $$
		DECLARE
				model_type VARCHAR(255) := null;
				rtn_model_id BIGINT := null;
		BEGIN
				model_type := (select modeltype from model where id=prm_model_id);
				if model_type = 'boolean' then
					rtn_model_id := (select mv.modelid
						from model_version mv 
						where mv.id = (select id from model_version where modelid = prm_model_id)
						order by mv.modelid, "version" asc limit 1
					);
				else
					rtn_model_id := prm_model_id;
					if model_type is null then
						rtn_model_id := null;
					end if;
				end if;
				return rtn_model_id;
		END;
		$$ LANGUAGE plpgsql`;

    return await queryInterface.sequelize.query(script);
		
  },
  down: async (queryInterface) => {
    return await queryInterface.sequelize.query('DROP FUNCTION fn_get_basemodel_id');
  }
};