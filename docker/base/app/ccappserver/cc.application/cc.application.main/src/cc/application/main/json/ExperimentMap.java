/**
 * 
 */
package cc.application.main.json;

import java.util.Map;
import java.util.Set;
import java.util.List;
import java.util.ArrayList;

import com.fasterxml.jackson.annotation.JsonIgnore;

import cc.common.data.simulation.Experiment;
import cc.common.data.simulation.SpeciesMutation;
import cc.common.simulate.settings.SimulationSettingsJAXBManager;
import cc.common.simulate.settings.dynamic.ActivityLevelRange;
import cc.common.simulate.settings.dynamic.DynamicSimulationSettings;
import cc.common.simulate.settings.dynamic.IDynamicSimulationSettings;

/**
 * @author Bryan Kowal
 *
 */
public class ExperimentMap extends Experiment implements IDynamicSimulationSettings, INullableFields {

	private static class NullableFields {
		public static String COURSE_ID = "courseId";

		public static String UPDATE_TYPE = "updateType";

		public static String ENVIRONMENT_ID = "environmentId";

		public static String LAST_RUN_ENVIRONMENT_ID = "lastRunEnvironmentId";
	}

	@JsonIgnore
	private final NullableFieldsJSON nullableFields = new NullableFieldsJSON();

	protected static final String FIELD_SIMULATIONS = "simulations";

	protected static final String FIELD_ACTIVITY_LEVEL_RANGE = "activityLevelRange";

	protected static final String FIELD_MUTATIONS = "mutations";

	protected static final String FIELD_INITIAL_STATE_ID = "initialStateId";

	protected static final String FIELD_BITS = "bits";

	protected static final String FIELD_X = "x";

	protected static final String FIELD_Y = "y";

	private final List<String> fieldsSet = new ArrayList<>();

	private DynamicSimulationSettings objSettings;

	private boolean bitsAvailable;

	public ExperimentMap() {
	}

	public ExperimentMap(Experiment experiment) {
		super(experiment);
		/*
		 * Verify that settingsXML corresponds to a valid {@link
		 * DynamicSimulationSettings}.
		 */
		try {
			this.objSettings = (DynamicSimulationSettings) SimulationSettingsJAXBManager.getInstance()
					.fromXMLString(experiment.getSettings());
			this.objSettings.setActivityLevelRange(null);
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}

	public Experiment constructNew() {
		Experiment experiment = new Experiment();
		experiment.setName(super.getName());
		experiment.setShared(super.isShared());
		experiment.setPublished(super.isPublished());
		experiment.setCourseId(super.getCourseId());
		experiment.setUpdateType(getUpdateType());
		experiment.setEnvironmentId(super.getEnvironmentId());
		experiment.setLastRunEnvironmentId(super.getLastRunEnvironmentId());

		return experiment;
	}

	@Override
	public boolean wasSetNull(String fieldName) {
		return this.nullableFields.wasSetNull(fieldName);
	}

	@JsonIgnore
	@Override
	public long getId() {
		return super.getId();
	}

	@JsonIgnore
	@Override
	public long getModel_id() {
		return super.getModel_id();
	}

	@JsonIgnore
	@Override
	public String getSettings() {
		return super.getSettings();
	}

	@Override
	public void setCourseId(Long courseId) {
		super.setCourseId(courseId);
		nullableFields.handleNullSet(courseId, NullableFields.COURSE_ID);
	}

	@Override
	public void setUpdateType(UpdateType updateType) {
		super.setUpdateType(updateType);
		nullableFields.handleNullSet(updateType, NullableFields.UPDATE_TYPE);
	}

	@Override
	public void setEnvironmentId(Long environmentId) {
		super.setEnvironmentId(environmentId);
		nullableFields.handleNullSet(environmentId, NullableFields.ENVIRONMENT_ID);
	}

	@Override
	public void setLastRunEnvironmentId(Long lastRunEnvironmentId) {
		super.setLastRunEnvironmentId(lastRunEnvironmentId);
		nullableFields.handleNullSet(lastRunEnvironmentId, NullableFields.LAST_RUN_ENVIRONMENT_ID);
	}

	/*
	 * Settings
	 */
	private void checkSettings() {
		if (this.objSettings == null) {
			this.objSettings = new DynamicSimulationSettings();
		}
	}

	@Override
	public int getSimulations() {
		return this.objSettings.getSimulations();
	}

	@Override
	public void setSimulations(int simulations) {
		this.checkSettings();
		this.objSettings.setSimulations(simulations);
		this.fieldsSet.add(FIELD_SIMULATIONS);
	}

	@Override
	public Map<Long, ActivityLevelRange> getActivityLevelRange() {
		return this.objSettings.getActivityLevelRange();
	}

	@Override
	public void setActivityLevelRange(Map<Long, ActivityLevelRange> activityLevelRange) {
		this.checkSettings();
		this.objSettings.setActivityLevelRange(activityLevelRange);
		this.fieldsSet.add(FIELD_ACTIVITY_LEVEL_RANGE);
	}

	@Override
	public Map<Long, SpeciesMutation> getMutations() {
		return this.objSettings.getMutations();
	}

	@Override
	public void setMutations(Map<Long, SpeciesMutation> mutations) {
		this.checkSettings();
		this.objSettings.setMutations(mutations);
		this.fieldsSet.add(FIELD_MUTATIONS);
	}

	@Override
	public Long getInitialStateId() {
		return this.objSettings.getInitialStateId();
	}

	@Override
	public void setInitialStateId(Long initialStateId) {
		this.checkSettings();
		this.objSettings.setInitialStateId(initialStateId);
		this.fieldsSet.add(FIELD_INITIAL_STATE_ID);
	}

	@Override
	public boolean isBits() {
		return this.objSettings.isBits();
	}

	@Override
	public void setBits(boolean bits) {
		this.checkSettings();
		this.objSettings.setBits(bits);
		this.fieldsSet.add(FIELD_BITS);
	}

	@Override
	public Long getX() {
		return this.objSettings.getX();
	}

	public void setX(Long x) {
		this.checkSettings();
		this.objSettings.setX(x);
		this.fieldsSet.add(FIELD_X);
	}

	public Set<Long> getY() {
		return this.objSettings.getY();
	}

	public void setY(Set<Long> y) {
		this.checkSettings();
		this.objSettings.setY(y);
		this.fieldsSet.add(FIELD_Y);
	}

	public void udpateExisting(DynamicSimulationSettings settings) {
		if (fieldsSet == null || fieldsSet.isEmpty()) {
			return;
		}

		if (this.fieldsSet.contains(FIELD_SIMULATIONS)) {
			settings.setSimulations(this.getSimulations());
		}
		if (this.fieldsSet.contains(FIELD_ACTIVITY_LEVEL_RANGE)) {
			settings.setActivityLevelRange(this.getActivityLevelRange());
		}
		if (this.fieldsSet.contains(FIELD_MUTATIONS)) {
			settings.setMutations(this.getMutations());
		}
		if (this.fieldsSet.contains(FIELD_INITIAL_STATE_ID)) {
			settings.setInitialStateId(this.getInitialStateId());
		}
		if (this.fieldsSet.contains(FIELD_BITS)) {
			settings.setBits(this.isBits());
		}
		if (this.fieldsSet.contains(FIELD_X)) {
			settings.setX(this.getX());
		}
		if (this.fieldsSet.contains(FIELD_Y)) {
			settings.setY(this.getY());
		}
	}

	/**
	 * @return the objSettings
	 */
	@JsonIgnore
	public DynamicSimulationSettings getObjSettings() {
		return objSettings;
	}

	/**
	 * @param objSettings
	 *            the objSettings to set
	 */
	public void setObjSettings(DynamicSimulationSettings objSettings) {
		this.objSettings = objSettings;
	}

	public boolean isBitsAvailable() {
		return bitsAvailable;
	}

	public void setBitsAvailable(boolean bitsAvailable) {
		this.bitsAvailable = bitsAvailable;
	}
}