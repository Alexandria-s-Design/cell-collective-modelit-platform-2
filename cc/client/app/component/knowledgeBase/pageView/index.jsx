import React from 'react';
import { Seq, Map } from 'immutable';
import Utils from '../../../utils';
import view from '../../base/view';
import Panel from '../../base/panel';
import Scrollable from '../../base/scrollable';
import Editable from '../../base/editable';
import ContextMenu from '../../base/contextMenu';
import Add from '../../../action/add';
import Update from '../../../action/update';
import Remove from '../../../action/remove';
import Entity from '../../../entity/Entity';
import Page from '../../../entity/page';
import Section from '../../../entity/section';
import Content from '../../../entity/content';
import Reference from '../../../entity/reference';
import PageReference from '../../../entity/pageReference';
import ContentReference from '../../../entity/contentReference';
import Citation from '../../../entity/citation';
import Annotation, {
	updateAnnotation,
	deleteAnnotation,
	removeAnnoataion
} from "../../../entity/metabolic/Annotation";
import cc from '../../../cc'
import { FormattedMessage } from "react-intl"
import ModifyLink from "../../../util/links";

import { Annotations as AnnotationLinks } from "../../../cc";
import LoadingBar from '../../loadingbar';

export const KnowledgeBaseViewBuilder = ({
	entityType = "Component"
} = { }) => {
	const getEntityType = ({ modelState }) => {
		const selectedEntity = modelState.get("selectedEntity");
		
		const eTypes = Seq(typeof entityType === 'string' ? [entityType] : entityType);
		let eType = eTypes.first();
		
		if ( selectedEntity && eTypes.includes(selectedEntity) ) {
			eType = selectedEntity;
		}
	
		return eType;
	}

	const referenceTypes = Seq({
		PRIMARY: { name: "Primary Literature", property: "literatureType" },
		NONPRIMARY: { name: "Non-primary Literature", property: "literatureType" },
		HUMAN: { name: "Human Data", property: "dataType" },
		ANIMAL: { name: "Animal Data", property: "dataType" }
	}).map((v, k) => Seq(v).concat({ id: k }).toObject()).toObject();
	
	class ContentView extends React.Component {
			constructor(props) {
				super(props);
				this.state = { content: null, loading: {} };
			}

			removeContent() {
				this.setState({ content: null });
			}

			shouldComponentUpdate(props, state) {
				const eType = getEntityType(this.props);
				return this.state !== state
					|| this.props.selected[eType] !== props.selected[eType]
					|| this.props.entities !== props.entities
					|| this.props.hover != props.hover
					|| !view.equal(this.props.view, props.view)
					|| this.props.modelState !== props.modelState;
			}

			UNSAFE_componentWillReceiveProps(props) {
				const eType = getEntityType(this.props);
				if (this.props.selected[eType] !== props.selected[eType]) {
					this.removeContent();
					this.refs.scrollable && this.refs.scrollable.setPosition(0);
				}
			}

			render ( ) {
				const { props } = this;
				const { model, selected: { Component: component }, dragging, editable, actions, view } = props;
				const modelType = model.modelType || "boolean";
				const _entityType = getEntityType(props);
				const selectedEntity = props.selected[_entityType];
				const newContent = this.state.content;
				const interactions = component && component.interactions;
				const components = component && Seq(component.inputs).sortBy(e => e.name.toLowerCase()).mapEntries(([_, e]) => [e.name, e]).toOrderedMap();
				const page = selectedEntity && Seq(selectedEntity.pages).first();
				let description, regulatorySummary, regulators, references;
				const ti = { done: () => this.refs.scrollable.componentDidUpdate() };

				const annotations = [ ]; 
				if ( selectedEntity && selectedEntity.self.get('annotationIds') ) {
					selectedEntity.self.get('annotationIds') &&
					selectedEntity.self.get('annotationIds').forEach(annotationId => {
						const annotation = model.Annotation[annotationId];
						if ( annotation ) {
							annotations.push(annotation);
						}
					})
				}

				if (page && page.sections) {
					const s = Seq(page.sections).filter(e=>e).sortBy(e => e.position).cacheResult();
					description = s.find(e => e.type === "Description");
					regulatorySummary = s.find(e => e.type === "RegulatorySummary");
					regulators = s.filter(e => e.type === "UpstreamRegulator").mapEntries(([_, v]) => [v.title, v]).toObject();
				}
				else {
					regulators = {};
				}

				if (page) {
					references = {};
					const f = e => (references[e.referenceId] || (references[e.referenceId] = [])).push(e);
					Seq(page.references).forEach(f);
					Seq(page.sections).forEach(e => Seq(e.contents).forEach(e => Seq(e.references).forEach(f)));
					references = Seq(references).map(e => ({ value: e[0].reference, entities: e })).cacheResult();
				}

				const he = props.hover && props.hover.entity;
				const hover = e => !dragging && { className: Utils.css(e === he && "hovered"), onMouseOver: actions.onHover.bind(null, e, null), onMouseOut: actions.onHover.bind(null, null, null) };

				const add = (type, section, entity, position, v) => {
					const p = page || new Page({ parent: selectedEntity });
					const s = section || new Section({ parent: p, type: type, title: entity ? (entity.name || entity) : entity, position: position });
					actions.batch([!page && new Add(p), !section && new Add(s), new Add(new Content({ parent: s, position: position, text: v }))]);
				};

				const addReference = (f, p, k, id) => {
						let loading = {...this.state.loading};
						loading[k] = false;
						if( /^(https?:\/\/)?doi\.org\/.+$/.test(id) )
								{id = id.split('doi.org/')[1];}
						if (id) {
							loading[k] = true;
							this.setState({ loading });
						}
						if (id && !(p && Seq(p.references).some(e => e.reference.pmid === id || e.reference.doi === id)) ) {
								actions.getReference(id, e => {
									loading[k] = false;
									if( 'error' in e ) {
											this.setState({ 'refError': `Website (PMID or DOI) is not reachable!`, loading });
											console.error("["+id+"]: "+e.response);
											return;
									}
									e && f(p, e);									
									this.removeContent();
									this.setState({ 'refError': null, loading });
							});
						} else {
							loading[k] = false;
							this.removeContent();
							this.setState({ loading });
						}						
				};

				const addPageReference = (p, e) => {
					if(e instanceof Entity){
						p = p || new Page({ parent: selectedEntity });
						actions.batch([!page && new Add(p), !e.isAttached && new Add(e), new Add(new PageReference({ parent: p, reference: e }))]);
					}
				};

				const addContentReference = (p, e) => actions.batch([!e.isAttached && new Add(e), new Add(new ContentReference({ parent: p, reference: e }))]);

				const menu = (e, p) => ({
					options: Seq(referenceTypes),
					style: ({id, property: k}) => Utils.css(id.toLowerCase(), Utils.checked(e && e[k] === id)),
					onChange: editable && (({id, property: k}, _) => (e ? (p && e[k] === id && !Seq(referenceTypes).some(({property: p}) => p !== k && e[p]) ? actions.onRemove(e) :
							actions.onEdit(e, k, e[k] === id ? null : id)) : actions.onAdd(new Citation({ parent: p, [k]: id })), _.preventDefault()))
				});

				const rAdd = (type, entity) => editable && (
					<input
						type="button"
						className={Utils.css("icon", "base-" + (["Reference", "Annotations"].includes(type) ? "reference" : "add"))}
						title={"Add " + (["Reference", "Annotations"].includes(type) ? type : "Content")}
						disabled={Utils.enabled(!(newContent && newContent.type === type && newContent.entity === entity))}
						onClick={() => this.setState({ content: { type: type, entity: entity }, refError: null })}/>
				);

				const rNew = (type, entity, def, add) => {
						const _add = val => {
							this.setState({ refError: null });
							add(val);
						};

						return newContent && newContent.type === type && newContent.entity === entity && (
						<li>
							<div>
								<Editable placeHolder={def} className="togglePmid" onEdit={_add}/>
								<div className="remove" onClick={this.removeContent.bind(this)}/>
							</div>
						</li>
				)};

				const rType = (e, p) => {
						let c;
						e && (c = e.reference) && (c = Seq(c.citations).first());
						const v = e && (e[p] || c && c[p]);
						const edit = () => {
							const n = Seq(referenceTypes).find((e, k) => e.property === p && k !== v).id;
							actions.onEdit(e, p, c && c[p] === n ? null : n);
						};
						return v && (<input type="button" className={"icon base-" + v.toLowerCase()} title={referenceTypes[v].name} disabled={Utils.enabled(editable)} onClick={edit}/>);
				}

				const rContent = (type, section, entity) => (
					<ul>
						<div>
							{Seq(section && section.contents).sortBy(e => e.position).map((v, k) => (
								<li key={k}>
									<div>
										<Editable maxWidth={view.parentWidth-20} value={v.text} onEdit={editable && (e => (e ? actions.onEdit(v, "text", e) : actions.onRemove(v)))}>
											<span dangerouslySetInnerHTML={{__html: cc._.nl2br(v.text)}}/>
										</Editable>
										{this.state.loading[`${k+1}`] ? <LoadingBar text="Searching references..."/> : null}
										{editable && (<div className="remove" onClick={actions.onRemove.bind(null, v)}/>)}
										<ul className="references">
											{rAdd("Reference", v)}
											{rNew("Reference", v, this.state.refError ? <span className="error">{this.state.refError}</span> : "pmid or doi",
													addReference.bind(null, addContentReference, v, `${k+1}`))}
											<div>
												{Seq(v.references).sort(Reference.comparator).map((v, k) => (
													<li key={k}>
														<ContextMenu {...menu(v)}>
															<i {...hover(v.reference)}>{"(" + v.reference.shortCitation + ")"}</i>
														</ContextMenu>
														{rType(v, "literatureType")}
														{rType(v, "dataType")}
														{editable && (<div className="remove" onClick={actions.onRemove.bind(null, v)}/>)}
													</li>
												)).toArray()}
											</div>
										</ul>
									</div>
								</li>
							)).toArray()}
							{rNew(type, entity, "Text", v => (v && add(type, section, entity, section ? Seq(section.contents).map(e => e.position).max() + 1 : 0, v), this.removeContent()))}
						</div>
					</ul>
				);

				const rDL = (e, p) => (e = e[p]) && (
					<dl>
						<dt>{p}</dt>
						<dd>{e}</dd>
					</dl>
				);

				const rInteraction = e => (e = interactions[e.id]) && (
					<span>
						{rDL(e, "delay")}
						{rDL(e, "threshold")}
					</span>
				);

				const rRegulator = (k, e, n, c) => (
					<div key={k}>
						<h2 className={Utils.css(!c && "removed")}>
							<span onClick={c && actions.onSelect.bind(null, c)}>{n}</span>
							{c && rAdd("UpstreamRegulator", n)}
							{c && interactions && rInteraction(c)}
						</h2>
						{rContent("UpstreamRegulator", e, n)}
						<br/>
					</div>
				);

				const rNewAnnotation = e => {
					const addAnnotation = value => {
						this.removeContent();

						const annotationLinks = Object.keys(AnnotationLinks)
						.reduce((prev, next) => ({ ...prev, [next]: { ...AnnotationLinks[next], source: next } }), { })
						const annotationLink = Map(annotationLinks)
							.find(v => v.name == value);

						const annotationExists = !Seq(annotations)
							.map(a => a.source)
							.includes(annotationLink.source);

						if ( annotationExists ) {
							const updates = [ ];
	
							const eAnnotation = new Annotation({
								source: annotationLink.source,
								metaboliteId: e.self.get("id"),
								annotations: []
							});
							updates.push(new Add(eAnnotation));
	
							const annotationIds = Seq(e.self.get('annotationIds'))
								.concat([eAnnotation.id])
								.toArray();
	
							updates.push(new Update(e, "annotationIds", annotationIds));
	
							actions.batch(updates);
						}
					}

					return newContent && newContent.type === "Annotation" && newContent.entity === e && (
						<li>
							<div>
								<Editable
									placeHolder={"Search Identifier"}
									values={Seq(AnnotationLinks).map(a => a.name).valueSeq()}
									onEdit={editable && addAnnotation}/>
								<div className="remove" onClick={this.removeContent.bind(this)}/>
							</div>
						</li>
					)
				}

				const rAnnotations = e => {
					const appendAnnotation = async (annotation, value) => {
						this.setState({ content: { type: "annotationUpdate" } });
						updateAnnotation(props, annotation, value);
						this.removeContent();
					};

					return (
						<ul>
							{rNewAnnotation(e)}
							<div>
								{Seq(annotations).map((annotation, i) => {
									const source 				= annotation.source;
									const annotationIds	= annotation.annotations;

									if ( source in AnnotationLinks ) {
										const annotationInfo	= AnnotationLinks[source];
										const annotationName 	= annotationInfo.name;
										let 	annotationUrls	= [ ];

										if ( annotationInfo.url ) {
											annotationUrls = annotationIds.map(annotationId => 
												({ id: annotationId, url: `${annotationInfo.url}/${annotationId}` })
											)
										}

										return (
												<li>
													<div>
														<span>{annotationName}</span>: <span>
														{editable && (<div className="remove annotation-remove" onClick={() => deleteAnnotation(props, e, annotation)}/>)}

															{annotationUrls.map(({ id, url }, i) => [
																i > 0 && ", ",
																<a key={i} href={`${url}`} target="_blank" rel="noopener noreferrer" >{id}</a>,
																editable && (
																	<div
																		className="remove annotation-remove"
																		onClick={() => removeAnnoataion(props, annotation, id)}/>
																)
															])}

														</span>

														{newContent && newContent.type === "Annotations" && newContent.entity === e && 
															Seq(e.annotationIds).includes(annotation.id) && (
																<span style={{ marginLeft: "3px" }}>
																	<Editable
																		placeHolder={`Enter ${annotationName}`}
																		onEdit={editable && appendAnnotation.bind(null, annotation)}/>
																	<div  style={{ marginLeft: "3px !important" }} className="remove" onClick={this.removeContent.bind(this)}/>
																</span>
														)}

														{editable && (rAdd("Annotations", e))}
													</div>
												</li>
										)
									}

									return null;
								})}
							</div>
						</ul>
					)
				}

			return (
				<Panel {...props.view}>
					<Scrollable ref="scrollable">
							{selectedEntity && (
								<div key={selectedEntity.id} className="knowledgeBase phase2-model">
									<h1>
										<FormattedMessage id="ModelDashBoard.PagesView.LabelDescription" defaultMessage="Description"/>
										{rAdd("Description", selectedEntity)}
									</h1>
									{rContent("Description", description, selectedEntity)}
									<br/>
									{components && (
										<div>
											<h1>
												<FormattedMessage id="ModelDashBoard.PagesView.LabelRegulatorMechanism" defaultMessage="Regulatory Mechanism Summary"/>
												{rAdd("RegulatorySummary")}
											</h1>
											{rContent("RegulatorySummary", regulatorySummary)}
											<br/>
											<h1>
												<FormattedMessage id="ModelDashBoard.PagesView.LabelUpstreamRegulators" defaultMessage="Upstream Regulators"/>
											</h1>
											<div>
												{components.map((v, k) => rRegulator(v.id, regulators[k], k, v)).toArray()}
											</div>
											<div>
												{Seq(regulators).filterNot((_, k) => components.get(k)).sortBy((_, k) => k.toLowerCase()).map((v, k) => rRegulator(v.id, v, k)).toArray()}
											</div>
											<br/>
										</div>
									)}
									{annotations && ["metabolic"].includes(modelType) && (
										<span>
											<div>
												<h1>
													<FormattedMessage id="ModelDashBoard.PagesView.LabelStandardAnnotations" defaultMessage="Standard Annotations"/>
													{rAdd("Annotation", selectedEntity)}
												</h1>
												{rAnnotations(selectedEntity)}
												<br/>
											</div>
										</span>
									)}	
									<div className="references">
										<h1>
											<FormattedMessage id="ModelDashBoard.PagesView.LabelReferences" defaultMessage="References"/>
											{rAdd("Reference")}
										</h1>
										<ol className="references">
											{rNew("Reference", undefined, this.state.refError ? <span className="error">{this.state.refError}</span> : "pmid or doi",
													addReference.bind(null, addPageReference, page, 1))}
											<div>
												{page && references.sortBy(e => e.value.shortCitation).map((v, e) => (
														<li key={e}>
															<div>
																<ContextMenu {...menu(e = Seq(v.value.citations).first(), v.value)}>
																	<span dangerouslySetInnerHTML={{__html: ModifyLink(v.value.text)}} {...hover(v.value)}/>
																</ContextMenu>
																{rType(e, "literatureType")}
																{rType(e, "dataType")}
																{editable && (<div className="remove" onClick={() => actions.batch(v.entities.map(e => new Remove(e)))}/>)}
															</div>
														</li>
												)).toArray()}
											</div>
										</ol>
										<br/>
									</div>
								</div>
							)}
					</Scrollable>
				</Panel>
			);
		}
	}

	const Header = (props) => props.title(props.selected[getEntityType(props)], "Knowledge Base")
	
	return view(ContentView, Header);
}

export default KnowledgeBaseViewBuilder();