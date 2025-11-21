/**
 * 
 */
package cc.common.data.simulation;

import javax.persistence.Column;
import javax.persistence.EmbeddedId;
import javax.persistence.Entity;
import javax.persistence.Table;

/**
 * @author Bryan Kowal
 */
@Entity
@Table(name = "experiment_data")
public class ExperimentData {

	@EmbeddedId
	private ExperimentDataPK id;

	@Column(nullable = false,
			columnDefinition = "MEDIUMTEXT")
	private String data;

	public ExperimentData() {
	}

	public ExperimentData(ExperimentDataPK id) {
		this.id = id;
	}

	/**
	 * @return the id
	 */
	public ExperimentDataPK getId() {
		return id;
	}

	/**
	 * @param id
	 *            the id to set
	 */
	public void setId(ExperimentDataPK id) {
		this.id = id;
	}

	/**
	 * @return the data
	 */
	public String getData() {
		return data;
	}

	/**
	 * @param data
	 *            the data to set
	 */
	public void setData(String data) {
		this.data = data;
	}

}