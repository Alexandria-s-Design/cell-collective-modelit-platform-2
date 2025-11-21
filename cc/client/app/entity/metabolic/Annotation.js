import { Seq } from "immutable";
import Entity from "../Entity";

import Update from "../../action/update";
import Remove from "../../action/remove";

import { Annotations as AnnotationLinks } from "../../cc";

export const removeAnnoataion = ({ actions }, annotation, annotationId) => {
	const updates = [ ];

	const annotationIds = annotation.annotations;

	const annotations = Seq(annotationIds)
		.filter(id => id === annotationId)
		.toArray()

	updates.push(new Update(annotation, "annotations", annotations))

	actions.batch(updates);
}

export const updateAnnotation = ({ actions }, annotation, annotationId) => {
	const source = annotation.source;
	const annotationIds = annotation.annotations;
	const metaboliteId = annotation.metaboliteId;

	const updates = [ ];

	if ( !Seq(annotationIds).includes(annotationId) ) {
		const annotationInfo = AnnotationLinks[source];
		const annotationUrl = annotationInfo.url;

		if ( annotationUrl ) {
			try {
				// await cc.request.head(`${annotationUrl}/${annotationId}`);
				annotationIds.push(annotationId);

				updates.push(new Update(annotation, "annotations", annotationIds));
			} catch (e) {
				throw new Error(`Annotation for source ${source} with ID ${annotationId} not found.`);
			}
		}
	}

	actions.batch(updates);
}

export const deleteAnnotation = ({ actions }, e, annotation) => {
	const updates = [ ];

	const annotationIds = Seq(e.annotationIds)
		.filter(annotationId => annotation.id !== annotationId)
		.toArray();

	updates.push(
		new Update(
			e,
			"annotationIds",
			annotationIds
		)
	)

	updates.push(new Remove(annotation))

	actions.batch(updates);
}

export default class Annotation extends Entity { }

Entity.init({ Annotation }, {
	source: null,
	annotations: { defaultVal: [ ] },
	metaboliteId: null
});