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
@Table(name = "value_bool",
		schema = "metadata")
public class BoolValue extends AbstractSetValue<Boolean> {

	public BoolValue() {
	}
}