/**
 * 
 */
package cc.common.data.user;

import java.io.Serializable;

import javax.persistence.*;

/**
 * @author Bryan Kowal
 */
@Embeddable
public class AuthorityRequestId implements Serializable {

	private static final long serialVersionUID = -4204763713852078713L;

	@Column(nullable = false)
	private long userId;

	@Column(nullable = false)
	private long roleId;

	public AuthorityRequestId(){}

	public AuthorityRequestId(long userId, long roleId) {
		this.setUserId(userId);
		this.setRoleId(roleId);
	}

	public long getUserId() {
		return userId;
	}

	public void setUserId(long userId) {
		this.userId = userId;
	}

	public long getRoleId() {
		return roleId;
	}

	public void setRoleId(long roleId) {
		this.roleId = roleId;
	}
	
	@Override
	public String toString() {
		StringBuilder sb = new StringBuilder("AuthorityRequestId [");
		sb.append("userId=").append(userId);
		sb.append(", roleId=").append(roleId);
		sb.append("]");
		return sb.toString();
	}
}