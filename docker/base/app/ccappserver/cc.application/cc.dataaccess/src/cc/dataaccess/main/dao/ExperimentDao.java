/**
 * 
 */
package cc.dataaccess.main.dao;

import java.util.Calendar;
import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.TransactionStatus;
import org.springframework.transaction.support.TransactionCallback;
import org.springframework.transaction.support.TransactionCallbackWithoutResult;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.util.CollectionUtils;

import cc.common.data.simulation.AnalysisActivity;
import cc.common.data.simulation.AnalysisEnvironment;
import cc.common.data.simulation.CalcInterval;
import cc.common.data.simulation.ComponentPair;
import cc.common.data.simulation.Course;
import cc.common.data.simulation.CourseActivity;
import cc.common.data.simulation.CourseMutation;
import cc.common.data.simulation.CourseRange;
import cc.common.data.simulation.Experiment;
import cc.common.data.simulation.RealtimeActivity;
import cc.common.data.simulation.RealtimeEnvironment;
import cc.common.data.simulation.SimulationState;
import cc.dataaccess.main.repository.AnalysisActivityRepository;
import cc.dataaccess.main.repository.AnalysisEnvironmentRepository;
import cc.dataaccess.main.repository.CalcIntervalRepository;
import cc.dataaccess.main.repository.ComponentPairRepository;
import cc.dataaccess.main.repository.CourseActivityRepository;
import cc.dataaccess.main.repository.CourseMutationRepository;
import cc.dataaccess.main.repository.CourseRangeRepository;
import cc.dataaccess.main.repository.CourseRespository;
import cc.dataaccess.main.repository.ExperimentRepository;
import cc.dataaccess.main.repository.ModelRepository;
import cc.dataaccess.main.repository.RealtimeActivityRepository;
import cc.dataaccess.main.repository.RealtimeEnvironmentRepository;

/**
 * @author Bryan Kowal
 */
public class ExperimentDao {

	@Autowired
	private ModelRepository modelRepository;

	@Autowired
	private ExperimentRepository experimentRepository;

	@Autowired
	private TransactionTemplate transactionTemplate;

	@Autowired
	private CourseRespository courseRespository;

	@Autowired
	private CourseRangeRepository courseRangeRepository;

	@Autowired
	private CourseActivityRepository courseActivityRepository;

	@Autowired
	private CourseMutationRepository courseMutationRepository;

	@Autowired
	private CalcIntervalRepository calcIntervalRepository;

	@Autowired
	private ComponentPairRepository componentPairRepository;

	@Autowired
	private RealtimeEnvironmentRepository realtimeEnvironmentRepository;

	@Autowired
	private RealtimeActivityRepository realtimeActivityRepository;

	@Autowired
	private AnalysisEnvironmentRepository analysisEnvironmentRepository;

	@Autowired
	private AnalysisActivityRepository analysisActivityRepository;

	public ExperimentDao() {
	}

	public void updateState(final Long id, final SimulationState state) {
		this.transactionTemplate.execute(new TransactionCallbackWithoutResult() {
			@Override
			protected void doInTransactionWithoutResult(TransactionStatus status) {
				final Experiment experiment = experimentRepository.findOne(id);
				if (experiment == null || experiment.getState() == state) {
					return;
				}
				experiment.setState(state);
				Calendar currentDate = Calendar.getInstance();
				if (state == SimulationState.RUNNING) {
					experiment.setLastRunDate(Calendar.getInstance());
				}
				experimentRepository.save(experiment);
				modelRepository.updateModelRecord(experiment.getModel_id(), currentDate);
			}
		});
	}

	public List<Experiment> getVisibleExperiments(final Long modelId, final Long userId) {
		return transactionTemplate.execute(new TransactionCallback<List<Experiment>>() {
			@Override
			public List<Experiment> doInTransaction(TransactionStatus status) {
				if (userId == null) {
					return experimentRepository.getVisibleExperimentsAnonymous(modelId);
				} else {
					return experimentRepository.getVisibleExperimentsForAuthenticated(modelId, userId);
				}
			}
		});
	}

	public Experiment getById(final Long id) {
		return transactionTemplate.execute(new TransactionCallback<Experiment>() {
			@Override
			public Experiment doInTransaction(TransactionStatus status) {
				return experimentRepository.findOne(id);
			}
		});
	}

	public List<Experiment> getExperimentsForIds(final Collection<Long> ids) {
		return transactionTemplate.execute(new TransactionCallback<List<Experiment>>() {
			@Override
			public List<Experiment> doInTransaction(TransactionStatus status) {
				return experimentRepository.findByIdIn(ids);
			}
		});
	}

	public List<Course> getCoursesForIds(final Collection<Long> ids) {
		return transactionTemplate.execute(new TransactionCallback<List<Course>>() {
			@Override
			public List<Course> doInTransaction(TransactionStatus status) {
				return courseRespository.findByIdIn(ids);
			}
		});
	}

	public List<CourseRange> getCourseRangesForIds(final Collection<Long> ids) {
		return transactionTemplate.execute(new TransactionCallback<List<CourseRange>>() {
			@Override
			public List<CourseRange> doInTransaction(TransactionStatus status) {
				return courseRangeRepository.findByIdIn(ids);
			}
		});
	}

	public List<CourseActivity> getCourseActivitiesForIds(final Collection<Long> ids) {
		return transactionTemplate.execute(new TransactionCallback<List<CourseActivity>>() {
			@Override
			public List<CourseActivity> doInTransaction(TransactionStatus status) {
				return courseActivityRepository.findByIdIn(ids);
			}
		});
	}

	public List<CourseMutation> getCourseMutationsForIds(final Collection<Long> ids) {
		return transactionTemplate.execute(new TransactionCallback<List<CourseMutation>>() {
			@Override
			public List<CourseMutation> doInTransaction(TransactionStatus status) {
				return courseMutationRepository.findByIdIn(ids);
			}
		});
	}

	public List<CalcInterval> getCalcIntervalsForIds(final Collection<Long> ids) {
		return transactionTemplate.execute(new TransactionCallback<List<CalcInterval>>() {
			@Override
			public List<CalcInterval> doInTransaction(TransactionStatus status) {
				return calcIntervalRepository.findByIdIn(ids);
			}
		});
	}

	public List<ComponentPair> getComponentPairsForIds(final Collection<Long> ids) {
		return transactionTemplate.execute(new TransactionCallback<List<ComponentPair>>() {
			@Override
			public List<ComponentPair> doInTransaction(TransactionStatus status) {
				List<ComponentPair> returnValues = componentPairRepository.findByIdIn(ids);
				if (CollectionUtils.isEmpty(returnValues)) {
					return Collections.emptyList();
				}
				return returnValues;
			}
		});
	}

	public List<ComponentPair> getComponentPairsForSpecies(final Collection<Long> speciesIds) {
		return transactionTemplate.execute(new TransactionCallback<List<ComponentPair>>() {
			@Override
			public List<ComponentPair> doInTransaction(TransactionStatus status) {
				List<ComponentPair> returnValues = componentPairRepository.getComponentPairsForSpecies(speciesIds);
				if (CollectionUtils.isEmpty(returnValues)) {
					return Collections.emptyList();
				}
				return returnValues;
			}
		});
	}

	public List<RealtimeEnvironment> getRealtimeEnvironmentsForModelAndUser(final Long modelId, final Long userId) {
		return transactionTemplate.execute(new TransactionCallback<List<RealtimeEnvironment>>() {
			@Override
			public List<RealtimeEnvironment> doInTransaction(TransactionStatus status) {
				List<RealtimeEnvironment> results = realtimeEnvironmentRepository.findBymodelidAndUserId(modelId,
						userId);
				if (CollectionUtils.isEmpty(results)) {
					return Collections.emptyList();
				}
				return results;
			}
		});
	}

	public RealtimeEnvironment getRealtimeEnvironmentById(final Long id) {
		return transactionTemplate.execute(new TransactionCallback<RealtimeEnvironment>() {
			@Override
			public RealtimeEnvironment doInTransaction(TransactionStatus status) {
				return realtimeEnvironmentRepository.findOne(id);
			}
		});
	}

	public List<RealtimeActivity> getRealtimeActivitiesByEnvironmentIds(final Collection<Long> ids) {
		return transactionTemplate.execute(new TransactionCallback<List<RealtimeActivity>>() {
			@Override
			public List<RealtimeActivity> doInTransaction(TransactionStatus status) {
				List<RealtimeActivity> results = realtimeActivityRepository.findByParentIdIn(ids);
				if (CollectionUtils.isEmpty(results)) {
					return Collections.emptyList();
				}
				return results;
			}
		});
	}

	public RealtimeActivity getRealtimeActivityById(final Long id) {
		return transactionTemplate.execute(new TransactionCallback<RealtimeActivity>() {
			@Override
			public RealtimeActivity doInTransaction(TransactionStatus status) {
				return realtimeActivityRepository.findOne(id);
			}
		});
	}

	public List<AnalysisEnvironment> getAnalysisEnvironmentsForModelAndUser(final Long modelId, final Long userId) {
		return transactionTemplate.execute(new TransactionCallback<List<AnalysisEnvironment>>() {
			@Override
			public List<AnalysisEnvironment> doInTransaction(TransactionStatus status) {
				List<AnalysisEnvironment> results = analysisEnvironmentRepository.findBymodelidAndUserId(modelId,
						userId);
				if (results == null) {
					return Collections.emptyList();
				}
				return results;
			}
		});
	}

	public AnalysisEnvironment getAnalysisEnvironmentById(final Long id) {
		return transactionTemplate.execute(new TransactionCallback<AnalysisEnvironment>() {
			@Override
			public AnalysisEnvironment doInTransaction(TransactionStatus status) {
				return analysisEnvironmentRepository.findOne(id);
			}
		});
	}

	public List<AnalysisActivity> getAnalysisActivitiesByEnvironmentIds(final Collection<Long> ids) {
		return transactionTemplate.execute(new TransactionCallback<List<AnalysisActivity>>() {
			@Override
			public List<AnalysisActivity> doInTransaction(TransactionStatus status) {
				List<AnalysisActivity> results = analysisActivityRepository.findByParentIdIn(ids);
				if (CollectionUtils.isEmpty(results)) {
					return Collections.emptyList();
				}
				return results;
			}
		});
	}

	public AnalysisActivity getAnalysisActivityById(final Long id) {
		return transactionTemplate.execute(new TransactionCallback<AnalysisActivity>() {
			@Override
			public AnalysisActivity doInTransaction(TransactionStatus status) {
				return analysisActivityRepository.findOne(id);
			}
		});
	}

	public List<Experiment> getAllExperiments() {
		return transactionTemplate.execute(new TransactionCallback<List<Experiment>>() {
			@Override
			public List<Experiment> doInTransaction(TransactionStatus status) {
				List<Experiment> results = experimentRepository.findAll();
				if (CollectionUtils.isEmpty(results)) {
					return Collections.emptyList();
				}
				return results;
			}
		});
	}

	public void saveAnalysisEnvironment(final AnalysisEnvironment analysisEnvironment,
			final Set<AnalysisActivity> analysisActivites) {
		this.transactionTemplate.execute(new TransactionCallbackWithoutResult() {
			@Override
			protected void doInTransactionWithoutResult(TransactionStatus status) {
				try {
					analysisEnvironmentRepository.save(analysisEnvironment);
					if (CollectionUtils.isEmpty(analysisActivites)) {
						return;
					}
					for (AnalysisActivity analysisActivity : analysisActivites) {
						analysisActivity.setParentId(analysisEnvironment.getId());
						analysisActivityRepository.save(analysisActivity);
					}
				} catch (Exception e) {
					status.setRollbackOnly();
				}
			}
		});
	}
}