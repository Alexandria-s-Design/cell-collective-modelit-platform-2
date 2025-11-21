/**
 * 
 */
package cc.common.data.model;

import java.util.Calendar;
import java.util.HashSet;
import java.util.Set;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.OneToMany;
import javax.persistence.OneToOne;
import javax.persistence.PrimaryKeyJoinColumn;
import javax.persistence.SequenceGenerator;
import javax.persistence.Table;
import javax.persistence.Transient;
import org.hibernate.annotations.BatchSize;
import org.hibernate.annotations.Fetch;
import org.hibernate.annotations.FetchMode;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;

import cc.common.data.ClientEditableField;
import cc.common.data.IdManagementConstants;
import cc.common.data.biologic.Species;
import cc.common.data.knowledge.ReferenceBase;
import cc.common.data.simulation.Course;
import cc.common.data.simulation.InitialState;

/**
 * @author bkowal
 *
 */
@Entity
@Table(name = "model")
@SequenceGenerator(name = Model.GENERATOR_NAME, sequenceName = Model.SEQUENCE_NAME, allocationSize = 1)
public class Model {

	protected static final String GENERATOR_NAME = "model" + IdManagementConstants.GENERATOR_NAME_SUFFIX;

	protected static final String SEQUENCE_NAME = "model" + IdManagementConstants.SEQUENCE_NAME_SUFFIX;

	@Id
	@GeneratedValue(strategy = GenerationType.SEQUENCE, generator = GENERATOR_NAME)
	private long id;

	@ClientEditableField
	@Column(length = 100, nullable = false)
	private String name;

	@ClientEditableField
	@Column(length = 4096, nullable = true)
	private String description;

	@JsonIgnore
	@Column(nullable = false)
	private boolean _deleted;

	@ClientEditableField
	@Column(length = 255, nullable = true)
	private String tags;

	@Column(nullable = true)
	private Long userId;

	@ClientEditableField
	@Column(nullable = true, length = 70)
	private String author;

	@Column(nullable = false)
	@JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "EEE, dd MMM yyyy HH:mm:ss z")
	private Calendar creationDate;

	@Column(nullable = false)
	@JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "EEE, dd MMM yyyy HH:mm:ss z")
	private Calendar biologicUpdateDate;

	@Column(nullable = false)
	@JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "EEE, dd MMM yyyy HH:mm:ss z")
	private Calendar knowledgeBaseUpdateDate;

	@JsonIgnore
	@Column(nullable = false)
	private Calendar updateDate;

	@ClientEditableField
	@Column(nullable = false)
	private Integer components;

	@ClientEditableField
	@Column(nullable = false)
	private Integer interactions;

	@ClientEditableField
	@Column(nullable = false)
	private Boolean published;

	@Transient
	private Boolean isShared = false;
	@Transient
	private Boolean isWorkspace = false;

	@OneToOne(fetch = FetchType.EAGER, optional = true)
	@JsonInclude(JsonInclude.Include.NON_NULL)
	@PrimaryKeyJoinColumn(referencedColumnName = "modelId", name = "id")
	private ModelInitialState modelInitialState;

	@Column(nullable = true)
	private Integer cited;

	@ClientEditableField
	@Column(nullable = false, length = 30)
	private String type;

	@ClientEditableField
	@Column(nullable = true)
	private Long originId;

	@OneToMany(mappedBy = "model", targetEntity = Species.class, fetch = FetchType.EAGER)
	@JsonInclude(JsonInclude.Include.NON_NULL)
	@Fetch(FetchMode.SUBSELECT)
	@BatchSize(size = 50)
	private Set<Species> species;

	@OneToMany(mappedBy = "model", targetEntity = InitialState.class, fetch = FetchType.EAGER)
	@JsonInclude(JsonInclude.Include.NON_NULL)
	@Fetch(FetchMode.SUBSELECT)
	@BatchSize(size = 50)
	private Set<InitialState> initialStates;

	@Transient
	@JsonInclude(JsonInclude.Include.NON_NULL)
	private ModelRating rating;

	@Transient
	private Set<ModelComment> modelComments;

	@OneToMany(mappedBy = "model", targetEntity = ModelReference.class, fetch = FetchType.EAGER)
	@JsonInclude(JsonInclude.Include.NON_NULL)
	@Fetch(FetchMode.SUBSELECT)
	@BatchSize(size = 50)
	private Set<ModelReference> references;
	
	@Transient
	private Set<ReferenceBase> referencesBase;

	@OneToOne(mappedBy = "model", targetEntity = ModelScore.class, fetch = FetchType.EAGER, optional = true)
	@JsonInclude(JsonInclude.Include.NON_NULL)
	private ModelScore score;

	@OneToMany(fetch = FetchType.EAGER, targetEntity = Course.class)
	@JoinColumn(name = "modelId", insertable = false, updatable = false)
	private Set<Course> courses;

	@Transient
	private final ModelIdentifier identifier = new ModelIdentifier(this);

	@Column(nullable = false)
	private String modelType = "boolean";

	public Model() {
	}

	public Model(Model model) {
		this.id = model.id;
		this.name = model.name;
		this.description = model.description;
		this.tags = model.tags;
		this.userId = model.userId;
		this.author = model.author;
		this.creationDate = model.creationDate;
		this.biologicUpdateDate = model.biologicUpdateDate;
		this.knowledgeBaseUpdateDate = model.knowledgeBaseUpdateDate;
		this.updateDate = model.updateDate;
		this.published = model.published;
		this.modelInitialState = model.modelInitialState;
		this.cited = model.cited;
		this.species = model.species;
		this.initialStates = model.initialStates;
		this.rating = model.rating;
		this.modelComments = model.modelComments;
		this.references = model.references;
		this.score = model.score;
		this.components = model.components;
		this.interactions = model.interactions;
		this.type = model.type;
		this.originId = model.originId;
		this.modelType = model.modelType;
		this.isWorkspace = model.isWorkspace;
		this.isShared = model.isShared;
	}

	public void addSpecies(Species species) {
		if (this.species == null) {
			this.species = new HashSet<>();
		}
		species.setModel(this.identifier);
		this.species.add(species);
	}

	public void addInitialState(InitialState initialState) {
		if (this.initialStates == null) {
			this.initialStates = new HashSet<>();
		}
		initialState.setModel(this.identifier);
		this.initialStates.add(initialState);
	}

	@JsonIgnore
	public ModelIdentifier getModelIdentifier() {
		return this.identifier;
	}

	/**
	 * @return the id
	 */
	public long getId() {
		return id;
	}

	/**
	 * @param id
	 *            the id to set
	 */
	public void setId(long id) {
		this.id = id;
	}

	/**
	 * @return the name
	 */
	public String getName() {
		return name;
	}

	/**
	 * @param name
	 *            the name to set
	 */
	public void setName(String name) {
		this.name = name;
	}

	/**
	 * @return the description
	 */
	public String getDescription() {
		return description;
	}

	/**
	 * @param description
	 *            the description to set
	 */
	public void setDescription(String description) {
		this.description = description;
	}

	/**
	 * @return the tags
	 */
	public String getTags() {
		return tags;
	}

	/**
	 * @param tags
	 *            the tags to set
	 */
	public void setTags(String tags) {
		this.tags = tags;
	}

	/**
	 * @return the userId
	 */
	public Long getUserId() {
		return userId;
	}

	/**
	 * @param userId
	 *            the userId to set
	 */
	public void setUserId(Long userId) {
		this.userId = userId;
	}

	/**
	 * @return the author
	 */
	public String getAuthor() {
		return author;
	}

	/**
	 * @param author
	 *            the author to set
	 */
	public void setAuthor(String author) {
		this.author = author;
	}

	/**
	 * @return the creationDate
	 */
	public Calendar getCreationDate() {
		return creationDate;
	}

	/**
	 * @param creationDate
	 *            the creationDate to set
	 */
	public void setCreationDate(Calendar creationDate) {
		this.creationDate = creationDate;
	}

	/**
	 * @return the biologicUpdateDate
	 */
	public Calendar getBiologicUpdateDate() {
		return biologicUpdateDate;
	}

	/**
	 * @param biologicUpdateDate
	 *            the biologicUpdateDate to set
	 */
	public void setBiologicUpdateDate(Calendar biologicUpdateDate) {
		this.biologicUpdateDate = biologicUpdateDate;
	}

	/**
	 * @return the knowledgeBaseUpdateDate
	 */
	public Calendar getKnowledgeBaseUpdateDate() {
		return knowledgeBaseUpdateDate;
	}

	/**
	 * @param knowledgeBaseUpdateDate
	 *            the knowledgeBaseUpdateDate to set
	 */
	public void setKnowledgeBaseUpdateDate(Calendar knowledgeBaseUpdateDate) {
		this.knowledgeBaseUpdateDate = knowledgeBaseUpdateDate;
	}

	/**
	 * @return the updateDate
	 */
	public Calendar getUpdateDate() {
		return updateDate;
	}

	/**
	 * @param updateDate
	 *            the updateDate to set
	 */
	public void setUpdateDate(Calendar updateDate) {
		this.updateDate = updateDate;
	}

	/**
	 * @return the components
	 */
	public Integer getComponents() {
		return components;
	}

	/**
	 * @param components
	 *            the components to set
	 */
	public void setComponents(Integer components) {
		this.components = components;
	}

	/**
	 * @return the interactions
	 */
	public Integer getInteractions() {
		return interactions;
	}

	/**
	 * @param interactions
	 *            the interactions to set
	 */
	public void setInteractions(Integer interactions) {
		this.interactions = interactions;
	}

	/**
	 * @return the published
	 */
	public Boolean isPublished() {
		return published;
	}

	/**
	 * @param published
	 *            the published to set
	 */
	public void setPublished(Boolean published) {
		this.published = published;
	}




	public void setIsShared(Boolean s) { this.isShared = s; }
	public Boolean getIsShared() { return this.isShared; }

	public void setIsWorkspace(Boolean s) { this.isWorkspace = s; }
	public Boolean getIsWorkspace() { return this.isWorkspace; }

	/**
	 * @return the modelInitialState
	 */
	public ModelInitialState getModelInitialState() {
		return modelInitialState;
	}

	/**
	 * @param modelInitialState
	 *            the modelInitialState to set
	 */
	public void setModelInitialState(ModelInitialState modelInitialState) {
		this.modelInitialState = modelInitialState;
	}

	/**
	 * @return the cited
	 */
	public Integer getCited() {
		return cited;
	}

	/**
	 * @param cited
	 *            the cited to set
	 */
	public void setCited(Integer cited) {
		this.cited = cited;
	}

	/**
	 * @return the type
	 */
	public String getType() {
		return type;
	}

	/**
	 * @param type
	 *            the type to set
	 */
	public void setType(String type) {
		this.type = type;
	}

	/**
	 * @return the originId
	 */
	public Long getOriginId() {
		return originId;
	}

	/**
	 * @param originId
	 *            the originId to set
	 */
	public void setOriginId(Long originId) {
		this.originId = originId;
	}

	/**
	 * @return the species
	 */
	public Set<Species> getSpecies() {
		return species;
	}

	/**
	 * @param species
	 *            the species to set
	 */
	public void setSpecies(Set<Species> species) {
		this.species = species;
	}

	/**
	 * @return the initialStates
	 */
	public Set<InitialState> getInitialStates() {
		return initialStates;
	}

	/**
	 * @param initialStates
	 *            the initialStates to set
	 */
	public void setInitialStates(Set<InitialState> initialStates) {
		this.initialStates = initialStates;
	}

	/**
	 * @return the rating
	 */
	public ModelRating getRating() {
		return rating;
	}

	/**
	 * @param rating
	 *            the rating to set
	 */
	public void setRating(ModelRating rating) {
		this.rating = rating;
	}

	/**
	 * @return the modelComments
	 */
	public Set<ModelComment> getModelComments() {
		return modelComments;
	}

	/**
	 * @param modelComments
	 *            the modelComments to set
	 */
	public void setModelComments(Set<ModelComment> modelComments) {
		this.modelComments = modelComments;
	}

	/**
	 * @return the references
	 */
	public Set<ModelReference> getReferences() {
		return references;
	}

	/**
	 * @param references
	 *            the references to set
	 */
	public void setReferences(Set<ModelReference> references) {
		this.references = references;
	}

	public Set<ReferenceBase> getReferencesBase() {
		return referencesBase;
	}

	public void setReferencesBase(Set<ReferenceBase> references) {
		this.referencesBase = references;
	} 

	/**
	 * @return the score
	 */
	public ModelScore getScore() {
		return score;
	}

	/**
	 * @param score
	 *            the score to set
	 */
	public void setScore(ModelScore score) {
		this.score = score;
	}

	/**
	 * @return the courses
	 */
	public Set<Course> getCourses() {
		return courses;
	}

	/**
	 * @param courses
	 *            the courses to set
	 */
	public void setCourses(Set<Course> courses) {
		this.courses = courses;
	}


	public String getModelType() {
		return modelType;
	}

	public void setModelType(String t) {
		modelType = t;
	}



	/*
	 * (non-Javadoc)
	 * 
	 * @see java.lang.Object#hashCode()
	 */
	@Override
	public int hashCode() {
		final int prime = 31;
		int result = 1;
		result = prime * result + ((creationDate == null) ? 0 : creationDate.hashCode());
		result = prime * result + ((description == null) ? 0 : description.hashCode());
		result = prime * result + (int) (id ^ (id >>> 32));
		result = prime * result + ((name == null) ? 0 : name.hashCode());
		result = prime * result + (published ? 1231 : 1237);
		result = prime * result + ((tags == null) ? 0 : tags.hashCode());
		result = prime * result + ((updateDate == null) ? 0 : updateDate.hashCode());
		return result;
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see java.lang.Object#equals(java.lang.Object)
	 */
	@Override
	public boolean equals(Object obj) {
		if (this == obj) {
			return true;
		}
		if (obj == null) {
			return false;
		}
		if (getClass() != obj.getClass()) {
			return false;
		}
		Model other = (Model) obj;
		if (creationDate == null) {
			if (other.creationDate != null) {
				return false;
			}
		} else if (!creationDate.equals(other.creationDate)) {
			return false;
		}
		if (description == null) {
			if (other.description != null) {
				return false;
			}
		} else if (!description.equals(other.description)) {
			return false;
		}
		if (id != other.id) {
			return false;
		}
		if (name == null) {
			if (other.name != null) {
				return false;
			}
		} else if (!name.equals(other.name)) {
			return false;
		}
		if (published != other.published) {
			return false;
		}
		if (tags == null) {
			if (other.tags != null) {
				return false;
			}
		} else if (!tags.equals(other.tags)) {
			return false;
		}
		if (updateDate == null) {
			if (other.updateDate != null) {
				return false;
			}
		} else if (!updateDate.equals(other.updateDate)) {
			return false;
		}
		return true;
	}

	@Override
	public String toString() {
		StringBuilder sb = new StringBuilder("Model [");
		sb.append("id=").append(this.id);
		sb.append(", name=").append(this.name);
		sb.append(", description=").append(this.description);
		sb.append(", tags=").append(this.tags);
		sb.append(", userId=").append(this.userId);
		sb.append(", author=").append(this.author);
		sb.append(", creationDate=").append(this.creationDate.getTime().toString());
		if (this.biologicUpdateDate != null) {
			sb.append(", biologicUpdateDate=").append(this.biologicUpdateDate.getTime().toString());
		}
		if (this.knowledgeBaseUpdateDate != null) {
			sb.append(", knowledgeBaseUpdateDate=").append(this.knowledgeBaseUpdateDate.getTime().toString());
		}
		sb.append(", updateDate=").append(this.updateDate.getTime().toString());
		sb.append(", components=").append(this.components);
		sb.append(", interactions=").append(this.interactions);
		sb.append(", published=").append(this.published);
		sb.append(", cited=").append(this.cited);
		sb.append(", type=").append(this.type);
		sb.append(", originId=").append(this.originId);
		sb.append("]");
		return sb.toString();
	}
}