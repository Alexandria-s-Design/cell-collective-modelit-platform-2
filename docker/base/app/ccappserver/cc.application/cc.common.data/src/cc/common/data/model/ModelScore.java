/**
 * 
 */
package cc.common.data.model;

import java.util.Calendar;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.ForeignKey;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.OneToOne;
import javax.persistence.Table;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;

/**
 * @author Bryan Kowal
 */
@Entity
@Table(name = "model_score")
public class ModelScore {

	@Id
	private long id;

	@JsonIgnore
	@OneToOne(optional = true,
			fetch = FetchType.EAGER,
			targetEntity = ModelIdentifier.class)
	@JoinColumn(name = "model_id",
			nullable = false,
			updatable = false,
			foreignKey = @ForeignKey(name = "fk_score_to_model") )
	private ModelIdentifier model;

	@Column(nullable = true)
	private Double score;

	@Column(nullable = false)
	@JsonFormat(shape = JsonFormat.Shape.STRING,
			pattern = "EEE, dd MMM yyyy HH:mm:ss z")
	private Calendar lastCalculationDate;

	@JsonIgnore
	@Column(nullable = false)
	private int citations;

	@JsonIgnore
	@Column(nullable = false)
	private int simulations;

	@JsonIgnore
	@Column(nullable = false)
	private int edits;

	@JsonIgnore
	@Column(nullable = false)
	private int downloads;

	public ModelScore() {
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
	 * @return the model
	 */
	public ModelIdentifier getModel() {
		return model;
	}

	/**
	 * @param model
	 *            the model to set
	 */
	public void setModel(ModelIdentifier model) {
		this.model = model;
	}

	/**
	 * @return the score
	 */
	public Double getScore() {
		return score;
	}

	/**
	 * @param score
	 *            the score to set
	 */
	public void setScore(Double score) {
		this.score = score;
	}

	/**
	 * @return the lastCalculationDate
	 */
	public Calendar getLastCalculationDate() {
		return lastCalculationDate;
	}

	/**
	 * @param lastCalculationDate
	 *            the lastCalculationDate to set
	 */
	public void setLastCalculationDate(Calendar lastCalculationDate) {
		this.lastCalculationDate = lastCalculationDate;
	}

	/**
	 * @return the citations
	 */
	public int getCitations() {
		return citations;
	}

	/**
	 * @param citations
	 *            the citations to set
	 */
	public void setCitations(int citations) {
		this.citations = citations;
	}

	/**
	 * @return the simulations
	 */
	public int getSimulations() {
		return simulations;
	}

	/**
	 * @param simulations
	 *            the simulations to set
	 */
	public void setSimulations(int simulations) {
		this.simulations = simulations;
	}

	/**
	 * @return the edits
	 */
	public int getEdits() {
		return edits;
	}

	/**
	 * @param edits
	 *            the edits to set
	 */
	public void setEdits(int edits) {
		this.edits = edits;
	}

	/**
	 * @return the downloads
	 */
	public int getDownloads() {
		return downloads;
	}

	/**
	 * @param downloads
	 *            the downloads to set
	 */
	public void setDownloads(int downloads) {
		this.downloads = downloads;
	}

	@Override
	public String toString() {
		StringBuilder sb = new StringBuilder("ModelScore [");
		sb.append("id=").append(this.id);
		sb.append(", score=").append(this.score);
		sb.append(", lastCalculationDate=").append(this.lastCalculationDate.getTime().toString());
		sb.append(", citations=").append(this.citations);
		sb.append(", simulations=").append(this.simulations);
		sb.append(", edits=").append(this.edits);
		sb.append(", downloads=").append(this.downloads).append("]");

		return sb.toString();
	}
}