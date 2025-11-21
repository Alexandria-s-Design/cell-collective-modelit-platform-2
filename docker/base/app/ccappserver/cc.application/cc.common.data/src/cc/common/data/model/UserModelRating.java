/**
 * 
 */
package cc.common.data.model;

import javax.persistence.Column;
import javax.persistence.EmbeddedId;
import javax.persistence.Entity;
import javax.persistence.Table;

/**
 * @author Bryan Kowal
 */
@Entity
@Table(name = "user_model_rating")
public class UserModelRating {

	@EmbeddedId
	private UserModelRatingId id;

	@Column(nullable = false,
			precision = 1,
			scale = 1)
	private Double rating;

	public UserModelRating() {
	}

	public UserModelRating(long ratingId, long userId, Double rating) {
		this.id = new UserModelRatingId(ratingId, userId);
		this.rating = rating;
	}

	/**
	 * @return the id
	 */
	public UserModelRatingId getId() {
		return id;
	}

	/**
	 * @param id
	 *            the id to set
	 */
	public void setId(UserModelRatingId id) {
		this.id = id;
	}

	/**
	 * @return the rating
	 */
	public Double getRating() {
		return rating;
	}

	/**
	 * @param rating
	 *            the rating to set
	 */
	public void setRating(Double rating) {
		this.rating = rating;
	}
}