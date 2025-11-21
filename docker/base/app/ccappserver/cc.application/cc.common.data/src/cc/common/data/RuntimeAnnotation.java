package cc.common.data;

import java.lang.annotation.Annotation;
import java.lang.reflect.Field;

public class RuntimeAnnotation {

	@SuppressWarnings("unchecked")
	public static <T extends Annotation> T getRuntimeAnnotation(Class<?> clazz, String fieldName, Class<T> annoClazz) {
		for (Field field : clazz.getDeclaredFields()) {
			if (fieldName.equals(field.getName())) {
				for (Annotation anno : field.getDeclaredAnnotations()) {
					if (anno.annotationType().equals(annoClazz)) {
						return (T) anno;
					}
				}
			}
		}
		return null;
	}

}
