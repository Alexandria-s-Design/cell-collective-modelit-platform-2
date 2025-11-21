/**
 * 
 */
package cc.common.data.model;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.Id;
import javax.persistence.OneToOne;
import javax.persistence.PrimaryKeyJoinColumn;
import javax.persistence.Table;

import com.fasterxml.jackson.annotation.JsonIgnore;

/**
 * @author Bryan Kowal
 */
@Entity
@Table(name = "model_rating")
public class ModelRating {

	@Id
	private long id;

	@OneToOne(optional = false,
			fetch = FetchType.EAGER,
			targetEntity = ModelIdentifier.class)
	@PrimaryKeyJoinColumn
	@JsonIgnore
	private ModelIdentifier model;

	@Column(nullable = true,
			precision = 1,
			scale = 1)
	private double rating;

	@Column(nullable = false)
	private double ratingSum;

	@Column(nullable = false)
	private int userCount = 0;

	public ModelRating() {
	}

	public ModelRating(ModelIdentifier model) {
		this.model = model;
	}

	public void ratingAdded() {
		++this.userCount;
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
	 * @return the rating
	 */
	public double getRating() {
		return rating;
	}

	/**
	 * @param rating
	 *            the rating to set
	 */
	public void setRating(double rating) {
		this.rating = rating;
	}

	/**
	 * @return the ratingSum
	 */
	public double getRatingSum() {
		return ratingSum;
	}

	/**
	 * @param ratingSum
	 *            the ratingSum to set
	 */
	public void setRatingSum(Double ratingSum) {
		this.ratingSum = ratingSum;
	}

	/**
	 * @return the userCount
	 */
	public int getUserCount() {
		return userCount;
	}

	/**
	 * @param userCount
	 *            the userCount to set
	 */
	public void setUserCount(int userCount) {
		this.userCount = userCount;
	}
}