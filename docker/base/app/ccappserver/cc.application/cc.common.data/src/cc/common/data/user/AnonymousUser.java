/**
 * 
 */
package cc.common.data.user;

import java.util.Calendar;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.SequenceGenerator;
import javax.persistence.Table;

import cc.common.data.IdManagementConstants;

/**
 * @author Bryan Kowal
 */
@Entity
@Table(name = "anonymous_user")
@SequenceGenerator(name = AnonymousUser.GENERATOR_NAME, sequenceName = AnonymousUser.SEQUENCE_NAME, allocationSize = 1)
public class AnonymousUser {

	protected static final String GENERATOR_NAME = "anonymous_user" + IdManagementConstants.GENERATOR_NAME_SUFFIX;

	protected static final String SEQUENCE_NAME = "anonymous_user" + IdManagementConstants.SEQUENCE_NAME_SUFFIX;

	@Id
	@GeneratedValue(strategy = GenerationType.SEQUENCE, generator = GENERATOR_NAME)
	private long id;

	@Column(nullable = false, length = 30)
	private String ip;

	@Column(nullable = true, length = 500)
	private String userAgent;

	@Column(nullable = false)
	private Calendar creationDate;

	public AnonymousUser() {
	}

	public long getId() {
		return id;
	}

	public void setId(long id) {
		this.id = id;
	}

	public String getIp() {
		return ip;
	}

	public void setIp(String ip) {
		this.ip = ip;
	}

	public String getUserAgent() {
		return userAgent;
	}

	public void setUserAgent(String userAgent) {
		this.userAgent = userAgent;
	}

	public Calendar getCreationDate() {
		return creationDate;
	}

	public void setCreationDate(Calendar creationDate) {
		this.creationDate = creationDate;
	}

	@Override
	public String toString() {
		StringBuilder sb = new StringBuilder("AnonymousUser [");
		sb.append("id=").append(id);
		sb.append(", ip=").append(ip);
		if (userAgent != null) {
			sb.append(", userAgent=").append(userAgent);
		}
		if (creationDate != null) {
			sb.append(", creationDate=").append(creationDate.getTime().toString());
		}
		sb.append("]");
		return sb.toString();
	}
}