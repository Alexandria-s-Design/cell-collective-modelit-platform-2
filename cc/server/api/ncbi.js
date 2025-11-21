import EutilsClient from "../../eutils";
import { getenv } from "../../util/environment";
import { getRandomProxy } from "../../util/proxy";
import { Router } from "express";
import Response from "../response";

const router = new Router();

const filterNihEsummaryTaxonomyToData = (nihResponse) => {
	const results   = nihResponse.result;
	const response  = { };	
	for (const result in results) {
		if ( result != "uids" ) {
			const data = results[result];
			if ( data.error != "cannot get document summary" ) {
				response[result] = {
						uid: data.uid,
						status: data.status,
						rank: data.rank,
						division: data.division,
						scientificname: data.scientificname,
						commonname: data.commonname,
						taxid: data.taxid,
						akataxid: data.akataxid,
						genus: data.genus,
						species: data.species,
						subsp: data.subsp,
						modificationdate: data.modificationdate,
						genbankdivision: data.genbankdivision
				};
			} else {
				response[result] = { error: "Invalid ID." };
			}
		}
	}
	return response;
}

// E.g.humans have a 'Species ID' of 9606, and mice have a value of 10090.
router.get("/taxonomy/:id", async (req, res) => {
	const resp = new Response();
	try {
		const proxy = await getRandomProxy();
		const eutils = new EutilsClient({
			apiKey: getenv("EUTILS_API_KEY"),
			proxy
		});
		const eresponse = await eutils.esummary(req.params.id, {
			db: "taxonomy",
			retmode: "json"
		});
		resp.data = filterNihEsummaryTaxonomyToData(eresponse);
	} catch (err) {
		resp.setError(Response.Error.INTERNAL_SERVER_ERROR, err.message);
	}
	res.status(resp.code).json(resp.json);
})

export default router;