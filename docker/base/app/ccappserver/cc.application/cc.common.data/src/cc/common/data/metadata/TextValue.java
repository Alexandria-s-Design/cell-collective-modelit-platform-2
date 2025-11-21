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
@Table(name = "value_text",
		schema = "metadata")
public class TextValue extends AbstractSetValue<String> {

	public TextValue() {
	}
}