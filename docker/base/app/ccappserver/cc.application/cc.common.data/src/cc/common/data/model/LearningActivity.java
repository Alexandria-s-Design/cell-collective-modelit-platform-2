/**
 * 
 */
package cc.common.data.model;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.ForeignKey;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.FetchType;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Id;
import javax.persistence.SequenceGenerator;
import javax.persistence.Table;

import cc.common.data.IdManagementConstants;

import com.fasterxml.jackson.annotation.JsonIgnore;

/**
 * @author Bryan Kowal
 */
@Entity
@Table(name = "learning_activity")
@SequenceGenerator(name = LearningActivity.GENERATOR_NAME, sequenceName = LearningActivity.SEQUENCE_NAME, allocationSize = 1)
public class LearningActivity {

	protected static final String GENERATOR_NAME = "learning_activity" + IdManagementConstants.GENERATOR_NAME_SUFFIX;

	protected static final String SEQUENCE_NAME = "learning_activity" + IdManagementConstants.SEQUENCE_NAME_SUFFIX;

	@Id
	@GeneratedValue(strategy = GenerationType.SEQUENCE, generator = GENERATOR_NAME)
	private long id;

	@Column(nullable = false)
	private long masterId;

	@ManyToOne(optional = true,
			fetch = FetchType.EAGER,
			targetEntity = LearningActivityGroup.class)
	@JoinColumn(name = "groupid",
			nullable = true,
			updatable = true,
			foreignKey = @ForeignKey(name = "fk_comment_to_model") )
	@JsonIgnore
	private LearningActivityGroup group;


	@Column(length = 100, nullable = false)
	private String name;

	@Column(nullable = false)
	private int position;

	@Column(nullable = false)
	private String workspaceLayout;
	
	@Column(nullable = true)
	private String views;

	@Column(nullable = false)
	private int version;

	public LearningActivity() {
	}

	public long getId() {
		return id;
	}

	public void setId(long id) {
		this.id = id;
	}

	public long getMasterId() {
		return masterId;
	}

	public void setMasterId(long masterId) {
		this.masterId = masterId;
	}

	public LearningActivityGroup getGroup() {
		return group;
	}

	public void setGroup(LearningActivityGroup group) {
		this.group = group;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public int getPosition() {
		return position;
	}

	public void setPosition(int position) {
		this.position = position;
	}

	public String getWorkspaceLayout() {
		return workspaceLayout;
	}

	public void setWorkspaceLayout(String workspaceLayout) {
		this.workspaceLayout = workspaceLayout;
	}

	public String getViews() {
		return views;
	}

	public void setViews(String views) {
		this.views = views;
	}

	public int getVersion() {
		return version;
	}

	public void setVersion(int version) {
		this.version = version;
	}
}