/**
 * 
 */
package cc.application.main.json.metadata;

import com.fasterxml.jackson.annotation.JsonIgnore;

import cc.common.data.metadata.Definition;

/**
 * @author Bryan Kowal
 *
 */
public class DefinitionJSON extends Definition {

	private Definition definition;

	public DefinitionJSON() {
	}

	public DefinitionJSON(Definition definition) {
		super(definition);
		this.definition = definition;
	}

	@JsonIgnore
	@Override
	public long getId() {
		return super.getId();
	}

	@JsonIgnore
	public Definition getDefinition() {
		return definition;
	}

	public void setDefinition(Definition definition) {
		this.definition = definition;
	}
}