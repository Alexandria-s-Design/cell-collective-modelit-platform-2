/**
 * 
 */
package cc.common.data.metadata;

import java.util.Calendar;

import javax.persistence.Entity;
import javax.persistence.Table;

/**
 * @author Bryan Kowal
 */
@Entity
@Table(name = "value_date",
		schema = "metadata")
public class DateValue extends AbstractSetValue<Calendar> {

	public DateValue() {
	}
}