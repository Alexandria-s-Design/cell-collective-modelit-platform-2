/**
 * 
 */
package cc.common.data.model;

import java.io.Serializable;

import javax.persistence.Embeddable;

/**
 * @author Bryan Kowal
 */
@Embeddable
public class UserModelRatingId implements Serializable {

	private static final long serialVersionUID = -1068409344898584953L;

	private long ratingId;

	private long userId;

	public UserModelRatingId() {
	}

	public UserModelRatingId(long ratingId, long userId) {
		this.ratingId = ratingId;
		this.userId = userId;
	}

	/**
	 * @return the ratingId
	 */
	public long getRatingId() {
		return ratingId;
	}

	/**
	 * @param ratingId
	 *            the ratingId to set
	 */
	public void setRatingId(long ratingId) {
		this.ratingId = ratingId;
	}

	/**
	 * @return the userId
	 */
	public long getUserId() {
		return userId;
	}

	/**
	 * @param userId
	 *            the userId to set
	 */
	public void setUserId(long userId) {
		this.userId = userId;
	}

	@Override
	public int hashCode() {
		final int prime = 31;
		int result = 1;
		result = prime * result + (int) (ratingId ^ (ratingId >>> 32));
		result = prime * result + (int) (userId ^ (userId >>> 32));
		return result;
	}

	@Override
	public boolean equals(Object obj) {
		if (this == obj)
			return true;
		if (obj == null)
			return false;
		if (getClass() != obj.getClass())
			return false;
		UserModelRatingId other = (UserModelRatingId) obj;
		if (ratingId != other.ratingId)
			return false;
		if (userId != other.userId)
			return false;
		return true;
	}
}