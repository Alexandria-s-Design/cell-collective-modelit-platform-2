/**
 * 
 */
package cc.application.jsbml.response.bool;

import java.util.List;
import java.util.Map;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

/**
 * @author Bryan Kowal
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class BiologicResponse {

	public Map<String, RegulatorJSON> regulators;
	public Map<String, ComponentJSON> components;
	
	public boolean absentState;
	
	public BiologicResponse() {
	}
}