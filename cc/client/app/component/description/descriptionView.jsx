import React from "react";
import { Seq } from "immutable"
import view from "../base/view";
import Panel from "../base/panel";
import Scrollable from "../base/scrollable";
import PropertyLine from "./propertyLine";
import PropertyArea from "./propertyArea";
import Application from "../../application";
import { FormattedMessage } from "react-intl";

export default view(({view, model, editable, actions}) => {
	const date = e => e.toLocaleDateString();
	const p = { entity: model, actions: editable && actions };
	const modelType = model.modelType || "boolean";

	const rMetabolicDescription = () => {
		const nReactions = Seq(model.reactions)
			.count();
		const nBoundaryReactions = Seq(model.boundary)
			.count()
		// const nExchangeReactions = nReactions - nBoundaryReactions;
		const nMetabolites = Seq(model.metabolites)
			.count();
		const nGenes = Seq(model.genes)
			.count();
		const nCompartments = Seq(model.compartments)
			.count();
		const nSubSystems = Seq(model.subsystems)
			.count();

		return (
			<i>
				<FormattedMessage id="ModelsView.DescriptionView.LabelMetabolitesCount" defaultMessage="Metabolites">
					{(message) => (<span className="metabolic-description"><b>{message}:</b> {nMetabolites}</span>)}
				</FormattedMessage>

				<FormattedMessage id="ModelsView.DescriptionView.LabelReactionsCount" defaultMessage="Reactions">
					{(message) => (<span className="metabolic-description"><b>{message}:</b> {nReactions}</span>)}
				</FormattedMessage>

				<FormattedMessage id="ModelsView.DescriptionView.LabelBoundaryReactionsCount" defaultMessage="Boundary Reactions">
					{(message) => (<span className="metabolic-description"><b>{message}:</b> {nBoundaryReactions}</span>)}
				</FormattedMessage>

				{/*
				<FormattedMessage id="ModelsView.DescriptionView.LabelExchangeReactionsCount" defaultMessage="Exchange Reactions">
					{(message) => (<span className="metabolic-description"><b>{message}:</b> {nExchangeReactions}</span>)}
				</FormattedMessage>
				*/}

				<FormattedMessage id="ModelsView.DescriptionView.LabelGenesCount" defaultMessage="Genes">
					{(message) => (<span className="metabolic-description"><b>{message}:</b> {nGenes}</span>)}
				</FormattedMessage>

				<FormattedMessage id="ModelsView.DescriptionView.LabelCompartmentCount" defaultMessage="Compartments">
					{(message) => (<span className="metabolic-description"><b>{message}:</b> {nCompartments}</span>)}
				</FormattedMessage>

				<FormattedMessage id="ModelsView.DescriptionView.LabelSubSystemCount" defaultMessage="Sub Systems">
					{(message) => (<span className="metabolic-description"><b>{message}:</b> {nSubSystems}</span>)}
				</FormattedMessage>
			</i>
		)
	}

	return (
		<Panel {...view} className="description">
			<Scrollable>
				{(!Application.isEducation)
					? 
					<span>
					<FormattedMessage id="ModelsView.descriptionView.labelAuthor" defaultMessage="Author">
						{(message)=> (<PropertyLine {...p} name={editable ? "author" : "publisher"} label={message} placeHolder={model.publisher}/>)}
					</FormattedMessage> 
						
					<FormattedMessage id= "ModelsView.descriptionView.labelCreated" defaultMessage="Created">
						{(message)=>(<PropertyLine {...p} name="created" label={message} format={date}/>)}
					</FormattedMessage>
					
					<FormattedMessage id="ModelsView.descriptionView.labelUpdated" defaultMessage="Updated">
						{(message)=>(	<PropertyLine {...p} name="updated" label={message} format={date}/>)}
					</FormattedMessage>
					
					<FormattedMessage id="ModelsView.descriptiveView.labelVersion" defaultMessage="Version">
						{(message)=>(<PropertyLine {...p} name="name" label={message} separate={true}/>)}
					</FormattedMessage>
						
					</span> 
					:
					null
				}
				<span>
					<br />
					
					<FormattedMessage id="ModelsView.descriptionView.labelVersionDescription" defaultMessage="Version Description">
						{(message)=>(<PropertyArea {...p} name="description" label={message} separate={true}/>)}
					</FormattedMessage>
					
				</span>
				<br />
					<FormattedMessage id="ModelsView.descriptionView.labelDescription" defaultMessage="Description">
						{(message)=>(<PropertyArea {...p} entity={model.top} separate={true} name="description" label={message}/>)}
					</FormattedMessage>
				
				<br/>
					<FormattedMessage id="ModelsView.descriptionView.labelTags" defaultMessage="Tags">
						{(message)=>(<PropertyArea {...p} name="tags" label={message}/>)}
					</FormattedMessage>

				<br/>

				{modelType == "metabolic" && rMetabolicDescription()}
				
			</Scrollable>
		</Panel>
	);
});
