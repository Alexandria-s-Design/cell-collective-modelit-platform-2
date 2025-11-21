/**
 * 
 */
package cc.application.main.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import cc.application.main.exception.EntityNotFoundException;
import cc.application.main.exception.ModelAccessDeniedException;
import cc.application.main.json.ModelPermissions;
import cc.common.data.model.Model;
import cc.common.data.model.ModelVersion;
import cc.common.data.simulation.Experiment;
import cc.dataaccess.main.dao.ModelBiologicDao;
import cc.dataaccess.main.dao.ExperimentDao;
import cc.dataaccess.main.dao.InitialStateDao;

/**
 * @author Bryan
 *
 */
public abstract class AbstractSimulationController extends AbstractModelController {

	protected static final String SIMULATE = "/simulate";

	@Autowired
	protected ModelBiologicDao modelBiologicDao;

	@Autowired
	protected InitialStateDao initialStateDao;

	@Autowired
	protected ExperimentDao experimentDao;

	protected Model verifyModelExistenceAndAccess(final long modelId, final Long userId) throws Exception {
		Model model = this.modelBiologicDao.getModel(modelId);
		if (model == null) {
			throw new EntityNotFoundException(EntityNotFoundException.ENTITY_MODEL, modelId);
		}
		ModelVersion modelVersion = modelVersionDao.getVersionIdForModel(model.getId());
		if (modelVersion == null) {
			throw new EntityNotFoundException(EntityNotFoundException.ENTITY_MODEL, modelId);
		}

		ModelPermissions permissions = this.determineModelPermissions(model, modelVersion, userId, null);
		if (permissions.isView() == false) {
			throw new ModelAccessDeniedException(ModelAccessDeniedException.ACTION_SIMULATE, modelId);
		}

		return model;
	}

	protected ResponseEntity<Object> verifyExperimentAccess(final Experiment experiment) {
		Model model = this.modelDao.getModel(experiment.getModel_id());
		if (model == null) {
			return new ResponseEntity<Object>("Data Inconsistent! Experiment with id: " + experiment.getId()
					+ " is no longer associated with a Model!", HttpStatus.INTERNAL_SERVER_ERROR);
		}
		ModelVersion modelVersion = modelVersionDao.getVersionIdForModel(model.getId());
		if (modelVersion == null) {
			return new ResponseEntity<Object>("Failed to find version information for Model: " + model.getId() + ".",
					HttpStatus.INTERNAL_SERVER_ERROR);
		}
		/*
		 * Verify that the user has access to the {@link Model}.
		 */
		final Long userId = this.getAuthenticatedUserId();
		ModelPermissions permissions = this.determineModelPermissions(model, modelVersion, userId, null);
		if (permissions.isView() == false) {
			return new ResponseEntity<Object>("Access to Experiment: " + experiment.getId() + " is forbidden.",
					HttpStatus.FORBIDDEN);
		}
		/*
		 * Verify that the user is allowed to access the {@link Experiment}.
		 */
		boolean accessAllowed = experiment.isPublished() || experiment.isShared()
				|| (experiment.getUserId() == null && userId == null)
				|| (experiment.getUserId() != null && experiment.getUserId().equals(userId));
		if (accessAllowed == false) {
			return new ResponseEntity<Object>("Access to Experiment: " + experiment.getId() + " is forbidden.",
					HttpStatus.FORBIDDEN);
		}

		return null;
	}
}