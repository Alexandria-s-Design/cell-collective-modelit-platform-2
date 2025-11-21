import { Router } from "express";
import Response from "../response";
import models from "../../models";
import { AuthRequired } from "../middlewares/auth";

const router = new Router();

/**
 * Get Kinetic laws for user.
 */
router.get("/customLawsByUser", async (req, res) => { 
	const resp = new Response();
	const user = req.user;
	if (!user) {
		return res.status(resp.code).json(resp.json);
	}

	// fetch kinetic laws for user.
	const customLaws  = await models.KineticLaw.findAll({
		include: {
			model: models.KineticLocalParams,
			include: models.UnitDefinitions
		},
		where: {
      _createdBy: user.id,
			_deleted: false,
			KineticLawTypeId: 1 // custom type
    }
	});

	const laws = []
	customLaws.forEach((law) =>  {
		// remove duplicate laws
    if (!laws.find(l => l.formula === law.formula)) {
			const params  = law.KineticLocalParams
      laws.push({id: law.id,
				formula: law.formula, 
				description: law.description, 
				numSubstrates: law.numSubstrates,
				numProducts: law.numProducts,
				params: params.map(p =>  {
					return {
						name: p.name,
						value: p.value, 
						unit:{
							id: p.unit_definition_id,
						  name: p.UnitDefinition && p.UnitDefinition.name
						}
					}
				})
		
		})
    }
  })
	resp.data = laws;
	return res.status(resp.code).json(resp.json)

});


export default router;
