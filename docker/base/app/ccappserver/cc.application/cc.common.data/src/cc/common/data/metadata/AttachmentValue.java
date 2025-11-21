/**
 * 
 */
package cc.common.data.metadata;

import javax.persistence.Entity;
import javax.persistence.Table;

/**
 * @author Bryan Kowal
 */
@Entity
@Table(name = "value_attachment",
		schema = "metadata")
public class AttachmentValue extends AbstractSetValue<Long> {

	public AttachmentValue() {
	}
}