/**
 * 
 */
package cc.application.main.json;

import cc.common.data.model.ModelRating;

/**
 * @author Bryan Kowal
 *
 */
public class Rating {

	private Double rating;

	private Integer userCount;

	private Double userRating;

	public Rating() {
	}

	public Rating(ModelRating modelRating) {
		this.rating = modelRating.getRating();
		this.userCount = modelRating.getUserCount();
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

	/**
	 * @return the userCount
	 */
	public Integer getUserCount() {
		return userCount;
	}

	/**
	 * @param userCount
	 *            the userCount to set
	 */
	public void setUserCount(Integer userCount) {
		this.userCount = userCount;
	}

	/**
	 * @return the userRating
	 */
	public Double getUserRating() {
		return userRating;
	}

	/**
	 * @param userRating
	 *            the userRating to set
	 */
	public void setUserRating(Double userRating) {
		this.userRating = userRating;
	}
}