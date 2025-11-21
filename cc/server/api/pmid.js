import { Router } from "express";
import moment from "moment";

import Response from "../response";
import EutilsClient from "../../eutils";

import { getenv } from "../../util/environment";
import { getRandomProxy } from "../../util/proxy";

const router = Router();

const _eutilsEsummaryResponseToData = eresponse => {
    const results   = eresponse.result;
    const response  = { };
    
    for (const result in results) {
        if ( result != "uids" ) {
            const data = results[result];

            if ( data.error != "cannot get document summary" ) {
                response[result] = {
                    publicationDate: data.pubdate,
                             source: data.source,
                              title: data.title,
                             volume: data.volume,
                              issue: data.issue,
                              pages: data.pages,
                            authors: data.authors.map(a => ({ name: a.name })),
                        firstAuthor: data.sortfirstauthor
                };
            } else {
                response[result] = { error: "Invalid ID." };
            }
        }
    }

    return response;
};

router.get("/:ids", async (req, res) => {
    const { ids }    = req.params;
    const response   = new Response();

    try {
        const proxy     = await getRandomProxy();
        const eutils    = new EutilsClient({
            apiKey: getenv("EUTILS_API_KEY"),
             proxy: proxy
        });
        const eresponse = await eutils.esummary(ids.split(","), {
            db: "pubmed",
            retmode: "json"
        });

        response.data   = _eutilsEsummaryResponseToData(eresponse);
    } catch (err) {
        response.setError(Response.Error.INTERNAL_SERVER_ERROR, err.message);
    }

    res.status(response.code)
       .json(response.json);
});

export default router;