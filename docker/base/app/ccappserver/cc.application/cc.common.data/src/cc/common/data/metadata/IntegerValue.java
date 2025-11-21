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
@Table(name = "value_integer",
		schema = "metadata")
public class IntegerValue extends AbstractSetValue<Integer> {

	public IntegerValue() {
	}
}