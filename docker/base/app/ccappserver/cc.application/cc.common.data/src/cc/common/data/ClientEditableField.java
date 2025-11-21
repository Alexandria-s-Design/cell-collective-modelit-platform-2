/**
 * 
 */
package cc.common.data;

import static java.lang.annotation.RetentionPolicy.RUNTIME;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.Target;

/**
 * Annotation used to mark fields in the POJO Entities that users will be able
 * to edit. The Application Server will scan the Entity POJOs that are created
 * from the JSON to determine if there are any differences between the Entity as
 * it is currently stored in the database and the entity that was provided by
 * the JS Client. TODO: better JavaDoc.
 * 
 * @author bkowal
 */
@Retention(RUNTIME)
@Target(ElementType.FIELD)
public @interface ClientEditableField {
}