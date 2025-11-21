/**
 * 
 */
package cc.common.data.user;

import java.util.Calendar;
import java.util.List;

import javax.persistence.*;

/**
 * @author Bryan Kowal
 */
@Entity
@Table(name = "authority_request")
public class AuthorityRequest {

	@EmbeddedId
	private AuthorityRequestId id;

	@Column(nullable = false, length = 80)
	private String token;

	@Column(nullable = false)
	private Calendar creationDate;

	@Column(nullable = true)
	private Calendar approvalDate;

	@Column(nullable = true)
	private Calendar rejectionDate;


	public AuthorityRequest() {
	}

	@OneToOne()
	@JoinColumn(name = "roleid", insertable = false, updatable = false)
	private Role role;

	public Role getRole() {
		return this.role;
	}

	public AuthorityRequestId getId() {
		return id;
	}

	public void setId(AuthorityRequestId id) {
		this.id = id;
	}

	public String getToken() {
		return token;
	}

	public void setToken(String token) {
		this.token = token;
	}

	public Calendar getCreationDate() {
		return creationDate;
	}

	public void setCreationDate(Calendar creationDate) {
		this.creationDate = creationDate;
	}

	public Calendar getApprovalDate() {
		return approvalDate;
	}

	public void setApprovalDate(Calendar approvalDate) {
		this.approvalDate = approvalDate;
	}

	public Calendar getRejectionDate() {
		return rejectionDate;
	}

	public void setRejectionDate(Calendar rejectionDate) {
		this.rejectionDate = rejectionDate;
	}

	@Override
	public String toString() {
		StringBuilder sb = new StringBuilder("AuthorityRequest [");
		sb.append("id=").append(id);
		sb.append(", token=").append(token);
		sb.append(", creationDate=").append(creationDate.getTime().toString());
		if (approvalDate != null) {
			sb.append(", approvalDate=").append(approvalDate.getTime().toString());
		}
		if (rejectionDate != null) {
			sb.append(", rejectionDate=").append(rejectionDate.getTime().toString());
		}
		sb.append("]");
		return sb.toString();
	}
}