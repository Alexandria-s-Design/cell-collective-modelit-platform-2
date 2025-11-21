import models from "../../cc/models"

(async () => {
	await models.connect({ sync: true })
})();