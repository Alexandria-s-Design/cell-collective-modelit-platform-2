/**
 * 
 */
package cc.application.main.json;

import com.fasterxml.jackson.annotation.JsonIgnore;

import cc.common.data.knowledge.Reference;
import cc.common.data.model.ModelIdentifier;
import cc.common.data.model.ModelReference;

/**
 * @author Bryan Kowal
 */
public class ModelReferenceMap extends ModelReference {

	public ModelReferenceMap() {
	}

	public ModelReferenceMap(ModelReference modelReference) {
		super(modelReference);
	}

	public ModelReference constructNew() {
		ModelReference reference = new ModelReference();
		reference.setPosition(super.getPosition());
		reference.setReference(super.getReference());
		reference.setModel(super.getModel());
		reference.setCreationDate(super.getCreationDate());
		reference.setCreationUser(super.getCreationUser());
		return reference;
	}

	public long getReferenceId() {
		return super.getReference().getId();
	}

	public void setReferenceId(long referenceId) {
		if (super.getReference() == null) {
			super.setReference(new Reference());
		}
		super.getReference().setId(referenceId);
	}

	@JsonIgnore
	@Override
	public long getId() {
		return super.getId();
	}

	@JsonIgnore
	@Override
	public Reference getReference() {
		return super.getReference();
	}

	@JsonIgnore
	@Override
	public ModelIdentifier getModel() {
		return super.getModel();
	}
}