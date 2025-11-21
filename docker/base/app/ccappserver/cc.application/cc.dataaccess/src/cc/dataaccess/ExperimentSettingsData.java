/**
 * 
 */
package cc.dataaccess;

import java.util.Map;

import cc.common.data.simulation.AnalysisActivity;
import cc.common.data.simulation.AnalysisEnvironment;
import cc.common.data.simulation.CalcInterval;
import cc.common.data.simulation.ComponentPair;
import cc.common.data.simulation.Course;
import cc.common.data.simulation.CourseActivity;
import cc.common.data.simulation.CourseMutation;
import cc.common.data.simulation.CourseRange;
import cc.common.data.simulation.RealtimeActivity;
import cc.common.data.simulation.RealtimeEnvironment;

/**
 * @author Bryan Kowal
 *
 */
public class ExperimentSettingsData {

	private Map<Long, Course> coursesToSave;

	private Map<Long, Course> coursesToDelete;

	private Map<Long, CourseRange> courseRangesToSave;

	private Map<Long, CourseRange> courseRangesToDelete;

	private Map<Long, CourseActivity> courseActivitiesToSave;

	private Map<Long, CourseActivity> courseActivitiesToDelete;

	private Map<Long, CourseMutation> courseMutationsToSave;

	private Map<Long, CourseMutation> courseMutationsToDelete;
	
	private Map<Long, CalcInterval> calcIntervalsToSave;
	
	private Map<Long, CalcInterval> calcIntervalsToDelete;
	
	private Map<Long, ComponentPair> componentPairsToSave;
	
	private Map<Long, ComponentPair> componentPairsToDelete;
	
	private Map<Long, RealtimeEnvironment> realtimeEnvironmentsToSave;
	
	private Map<Long, RealtimeEnvironment> realtimeEnvironmentsToDelete;
	
	private Map<Long, RealtimeActivity> realtimeActivitiesToSave;
	
	private Map<Long, RealtimeActivity> realtimeActivitiesToDelete;
	
	private Map<Long, AnalysisEnvironment> analysisEnvironmentsToSave;
	
	private Map<Long, AnalysisEnvironment> analysisEnvironmentsToDelete;

	private Map<Long, AnalysisActivity> analysisActivitiesToSave;
	
	private Map<Long, AnalysisActivity> analysisActivitiesToDelete;
	
	public ExperimentSettingsData() {
	}

	/**
	 * @return the coursesToSave
	 */
	public Map<Long, Course> getCoursesToSave() {
		return coursesToSave;
	}

	/**
	 * @param coursesToSave the coursesToSave to set
	 */
	public void setCoursesToSave(Map<Long, Course> coursesToSave) {
		this.coursesToSave = coursesToSave;
	}

	/**
	 * @return the coursesToDelete
	 */
	public Map<Long, Course> getCoursesToDelete() {
		return coursesToDelete;
	}

	/**
	 * @param coursesToDelete the coursesToDelete to set
	 */
	public void setCoursesToDelete(Map<Long, Course> coursesToDelete) {
		this.coursesToDelete = coursesToDelete;
	}

	/**
	 * @return the courseRangesToSave
	 */
	public Map<Long, CourseRange> getCourseRangesToSave() {
		return courseRangesToSave;
	}

	/**
	 * @param courseRangesToSave the courseRangesToSave to set
	 */
	public void setCourseRangesToSave(Map<Long, CourseRange> courseRangesToSave) {
		this.courseRangesToSave = courseRangesToSave;
	}

	/**
	 * @return the courseRangesToDelete
	 */
	public Map<Long, CourseRange> getCourseRangesToDelete() {
		return courseRangesToDelete;
	}

	/**
	 * @param courseRangesToDelete the courseRangesToDelete to set
	 */
	public void setCourseRangesToDelete(Map<Long, CourseRange> courseRangesToDelete) {
		this.courseRangesToDelete = courseRangesToDelete;
	}

	/**
	 * @return the courseActivitiesToSave
	 */
	public Map<Long, CourseActivity> getCourseActivitiesToSave() {
		return courseActivitiesToSave;
	}

	/**
	 * @param courseActivitiesToSave the courseActivitiesToSave to set
	 */
	public void setCourseActivitiesToSave(Map<Long, CourseActivity> courseActivitiesToSave) {
		this.courseActivitiesToSave = courseActivitiesToSave;
	}

	/**
	 * @return the courseActivitiesToDelete
	 */
	public Map<Long, CourseActivity> getCourseActivitiesToDelete() {
		return courseActivitiesToDelete;
	}

	/**
	 * @param courseActivitiesToDelete the courseActivitiesToDelete to set
	 */
	public void setCourseActivitiesToDelete(Map<Long, CourseActivity> courseActivitiesToDelete) {
		this.courseActivitiesToDelete = courseActivitiesToDelete;
	}

	/**
	 * @return the courseMutationsToSave
	 */
	public Map<Long, CourseMutation> getCourseMutationsToSave() {
		return courseMutationsToSave;
	}

	/**
	 * @param courseMutationsToSave the courseMutationsToSave to set
	 */
	public void setCourseMutationsToSave(Map<Long, CourseMutation> courseMutationsToSave) {
		this.courseMutationsToSave = courseMutationsToSave;
	}

	/**
	 * @return the courseMutationsToDelete
	 */
	public Map<Long, CourseMutation> getCourseMutationsToDelete() {
		return courseMutationsToDelete;
	}

	/**
	 * @param courseMutationsToDelete the courseMutationsToDelete to set
	 */
	public void setCourseMutationsToDelete(Map<Long, CourseMutation> courseMutationsToDelete) {
		this.courseMutationsToDelete = courseMutationsToDelete;
	}

	/**
	 * @return the calcIntervalsToSave
	 */
	public Map<Long, CalcInterval> getCalcIntervalsToSave() {
		return calcIntervalsToSave;
	}

	/**
	 * @param calcIntervalsToSave the calcIntervalsToSave to set
	 */
	public void setCalcIntervalsToSave(Map<Long, CalcInterval> calcIntervalsToSave) {
		this.calcIntervalsToSave = calcIntervalsToSave;
	}

	/**
	 * @return the calcIntervalsToDelete
	 */
	public Map<Long, CalcInterval> getCalcIntervalsToDelete() {
		return calcIntervalsToDelete;
	}

	/**
	 * @param calcIntervalsToDelete the calcIntervalsToDelete to set
	 */
	public void setCalcIntervalsToDelete(Map<Long, CalcInterval> calcIntervalsToDelete) {
		this.calcIntervalsToDelete = calcIntervalsToDelete;
	}

	public Map<Long, ComponentPair> getComponentPairsToSave() {
		return componentPairsToSave;
	}

	public void setComponentPairsToSave(Map<Long, ComponentPair> componentPairsToSave) {
		this.componentPairsToSave = componentPairsToSave;
	}

	public Map<Long, ComponentPair> getComponentPairsToDelete() {
		return componentPairsToDelete;
	}

	public void setComponentPairsToDelete(Map<Long, ComponentPair> componentPairsToDelete) {
		this.componentPairsToDelete = componentPairsToDelete;
	}

	public Map<Long, RealtimeEnvironment> getRealtimeEnvironmentsToSave() {
		return realtimeEnvironmentsToSave;
	}

	public void setRealtimeEnvironmentsToSave(Map<Long, RealtimeEnvironment> realtimeEnvironmentsToSave) {
		this.realtimeEnvironmentsToSave = realtimeEnvironmentsToSave;
	}

	public Map<Long, RealtimeEnvironment> getRealtimeEnvironmentsToDelete() {
		return realtimeEnvironmentsToDelete;
	}

	public void setRealtimeEnvironmentsToDelete(Map<Long, RealtimeEnvironment> realtimeEnvironmentsToDelete) {
		this.realtimeEnvironmentsToDelete = realtimeEnvironmentsToDelete;
	}

	public Map<Long, RealtimeActivity> getRealtimeActivitiesToSave() {
		return realtimeActivitiesToSave;
	}

	public void setRealtimeActivitiesToSave(Map<Long, RealtimeActivity> realtimeActivitiesToSave) {
		this.realtimeActivitiesToSave = realtimeActivitiesToSave;
	}

	public Map<Long, RealtimeActivity> getRealtimeActivitiesToDelete() {
		return realtimeActivitiesToDelete;
	}

	public void setRealtimeActivitiesToDelete(Map<Long, RealtimeActivity> realtimeActivitiesToDelete) {
		this.realtimeActivitiesToDelete = realtimeActivitiesToDelete;
	}

	public Map<Long, AnalysisEnvironment> getAnalysisEnvironmentsToSave() {
		return analysisEnvironmentsToSave;
	}

	public void setAnalysisEnvironmentsToSave(Map<Long, AnalysisEnvironment> analysisEnvironmentsToSave) {
		this.analysisEnvironmentsToSave = analysisEnvironmentsToSave;
	}

	public Map<Long, AnalysisEnvironment> getAnalysisEnvironmentsToDelete() {
		return analysisEnvironmentsToDelete;
	}

	public void setAnalysisEnvironmentsToDelete(Map<Long, AnalysisEnvironment> analysisEnvironmentsToDelete) {
		this.analysisEnvironmentsToDelete = analysisEnvironmentsToDelete;
	}

	public Map<Long, AnalysisActivity> getAnalysisActivitiesToSave() {
		return analysisActivitiesToSave;
	}

	public void setAnalysisActivitiesToSave(Map<Long, AnalysisActivity> analysisActivitiesToSave) {
		this.analysisActivitiesToSave = analysisActivitiesToSave;
	}

	public Map<Long, AnalysisActivity> getAnalysisActivitiesToDelete() {
		return analysisActivitiesToDelete;
	}

	public void setAnalysisActivitiesToDelete(Map<Long, AnalysisActivity> analysisActivitiesToDelete) {
		this.analysisActivitiesToDelete = analysisActivitiesToDelete;
	}
}