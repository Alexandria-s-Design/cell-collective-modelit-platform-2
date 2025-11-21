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
@Table(name = "value_decimal",
		schema = "metadata")
public class DecimalValue extends AbstractSetValue<Double> {

	public DecimalValue() {
	}
}