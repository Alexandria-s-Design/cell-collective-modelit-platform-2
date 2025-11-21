'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {

		const script = `
			CREATE INDEX model_originid_btree_idx
			ON public.model
			USING btree(originid);

			CREATE INDEX model_id_btree_idx
			ON public.model
			USING btree(id);

			CREATE INDEX model_deleted_btree_idx
			ON public.model
			USING btree("_deleted");

			CREATE INDEX model_type_btree_idx
			ON public.model
			USING btree("type");

			CREATE INDEX model_modeltype_btree_idx
			ON public.model
			USING btree("modeltype");

			CREATE INDEX model_userid_btree_idx
			ON public.model
			USING btree("userid");

			CREATE INDEX model_published_btree_idx
			ON public.model
			USING btree("published");`;

    return await queryInterface.sequelize.query(script);
		
  },
  down: async (queryInterface) => {
    
  }
};