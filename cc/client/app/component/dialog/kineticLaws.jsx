import React, { useState } from "react";
import { Seq } from "immutable";
import view from "../base/view";
import KineticLaw from "../../entity/kinetic/KineticLaw";
import request from '../../request';

import { FormattedMessage } from "react-intl";
import Add from "../../action/add";
import Update from "../../action/update";
import Message from "./message"
import 'katex/dist/katex.min.css'
import Latex from 'react-latex-next'
import Checkbox from "../base/checkbox";
import Editable from "../base/editable";
import Options from "../base/options";


class Content extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			selectedItem: null,
			customKineticLaw: null,
			userCustomKineticLaws: [],
			selectedExistingLaw: null
		}
	}

	componentDidMount() {
		request.get("api/kineticlaws/customLawsByUser").then(data => {
			this.setState({
				userCustomKineticLaws: data.data.data
			})
		})
	}

	UNSAFE_componentWillMount() {
		document.addEventListener("keyup", this.dialogKeyUp = this.dialogKeyUp.bind(this));
	}
	dialogKeyUp(e) {
		(e.which || e.keyCode) == 13 && this.props.onSubmit(null, this);
	}
	componentWillUnmount() {
		document.removeEventListener("keyup", this.dialogKeyUp);
	}

	render() {
		let { kineticLaws, reaction, actions, cc, setKL, modelState } = this.props;
		const { customKineticLaw } = this.state;

		if (this.state.selectedItem === null) {
			this.state.selectedItem = kineticLaws[0];
		}

		const setSelectedItem = (item) => {
			this.setState({ selectedItem: item });
			if (this.state.customKineticLaw) {
				this.setState({ customKineticLaw: !this.state.customKineticLaw });
			}

		}
		const selectedStyle = {
			fontWeight: "bold"
		};
		const itemsStyle = {
			cursor: "pointer"
		};

		const onSubmit = () => {
			if (!reaction) {
				cc.showDialog(Message, { message: "Add some Reactions before trying to select a Kinetic Law" });
				return;
			}
			let kineticLaw = new KineticLaw({
				type: this.state.selectedItem.id,
				reaction_id: reaction._id || reaction.id,
				parameters: this.state.selectedItem.parameters.map(param => ({ name: param.name, value: param.value, unit: Seq(this.props.model.UnitDefinition).find(u => u.name.includes(param.unit)).id })),
				formula: this.state.selectedItem.formula() // formula is function of reactants and products
			});

			actions.batch([new Add(kineticLaw),
				new Update(reaction, 'kinetic_law', kineticLaw),
			  new Update(reaction, 'reversible', this.state.selectedItem.reversible)]);

			actions.onSelect(reaction || "Reaction");
			cc.closeDialog();
		}

		const editFormula = (formula) => {
			const reactants = [];
			const products = [];
			let parameters = [];

			const regex = /[a-zA-Z]+\d*/g;
			let match;

			while ((match = regex.exec(formula)) !== null) {
				const variable = match[0];

				if (variable.startsWith("R")) {
					!reactants.includes(variable) && reactants.push(variable);
				} else if (variable.startsWith("P")) {
					!products.includes(variable) && products.push(variable);
				} else {
					!parameters.includes(variable) && parameters.push(variable);
				}
			}
			
			parameters = parameters.map(param => ({ name: param, value: 0, unit: "dimensionless" }));

			this.setState({customKineticLaw: this.state.customKineticLaw.update("formula", formula)})
			this.setState({customKineticLaw: this.state.customKineticLaw.update("parameters", parameters)})
			this.setState({customKineticLaw: this.state.customKineticLaw.update("numSubstrates", reactants.length)})
			this.setState({customKineticLaw: this.state.customKineticLaw.update("numProducts", products.length || 1)})
		};

		const createCustomKineticLaw = () => {
			if (!reaction) {
				cc.showDialog(Message, { message: "Add some Reactions before trying to select a Kinetic Law" });
			}

			this.setState({customKineticLaw: this.state.customKineticLaw.update("type", 1)});

			this.setState({customKineticLaw: this.state.customKineticLaw.update("parameters", this.state.customKineticLaw.parameters.map(param => ({ ...param, unit: param.unit.name })))});
			const customKineticLaw = this.state.customKineticLaw;

			const newKineticLaw = new KineticLaw({
				type: 1,
				name: customKineticLaw.name,
				reaction_id: reaction._id || reaction.id,
				formula: customKineticLaw.formula,
				parameters: customKineticLaw.parameters.map(param => ({ name: param.name, value: param.value, unit: Seq(this.props.model.UnitDefinition).find(u => u.name.includes(param.unit)).id })),
			});

			customKineticLaw.update("formula", new Function('r', 'p', `let f = "${this.state.customKineticLaw.formula}";for (let i = 1; i <= r.length; i++) {
					f = f.replace("R" + i, r[i - 1]);}
				for (let i = 1; i <= p.length; i++) {
					f = f.replace("P" + i, p[i - 1]);
				}
				return f;`));
			modelState.getIn(["KineticLaw"]).push(customKineticLaw);  
			actions.batch([new Add(newKineticLaw), new Update(reaction, 'kinetic_law', newKineticLaw)]);

			actions.onSelect(reaction || "Reaction");
			this.setState({customKineticLaw: null});
			cc.closeDialog();
		}

		return (
			<span>
				<div className="content">
					<div style={{ float: "left", marginLeft: "5px" }}>
						<h3>Kinetic Law</h3>
						<div style={itemsStyle}>
							<ul style={{ lineHeight: "130%" }}>
								{kineticLaws.map(item => (
									<li key={item?.id} onClick={() => setSelectedItem(item)} style={item?.id === this.state.selectedItem.id ? selectedStyle : null}>
										{item?.name}
									</li>
								))}
								<li onClick={() => this.setState({customKineticLaw: new KineticLaw({ name: "Custom", formula: "write here", description: "" })})}><b>Create custom kinetic law</b></li>
							</ul>
						</div>
					</div>
					<div style={{ width: "70%", float: "right", marginRight: "10px" }}>
						{customKineticLaw ? (<div>
							<h3>
								Custom Kinetic Law
							</h3>
							<div>
								<div>
									{
										this.state.userCustomKineticLaws && (
										<label>
											Choose From Existing Custom Kinetic Law:  
											<Options
												none ="None selected"
												value = {this.state.selectedExistingLaw}
												get = "formula"
												options ={Seq(this.state.userCustomKineticLaws)}
												onChange ={ v =>  {
													if(v) {
														this.setState({customKineticLaw: new KineticLaw({
																name: "Custom",
																formula: v.formula, 
																description: v.description,
																parameters: v.params, 
																numProducts: v.numProduct, 
																numSubstrates: v. numSubstrates })
														})	
													} else {
														this.setState({customKineticLaw: new KineticLaw({ name: "Custom", formula: "write here", description: "" })})
													}
													this.setState({selectedExistingLaw: v})
												}}
											/>
											<br/>
											<br/>
										</label>
										)
									}
								
									<label>
										Name: <Editable value={this.state.customKineticLaw.name} onEdit={v => this.setState({ customKineticLaw: this.state.customKineticLaw.update("name", v)})} />
									</label>
									<br />

									<label>
										Formula: <Editable value={this.state.customKineticLaw.formula} onEdit={editFormula} />
									</label>
									<br />

									<label>
										Description: <Editable value={this.state.customKineticLaw.description} onEdit={v => this.setState({ customKineticLaw: this.state.customKineticLaw.update("description", v)})} />
									</label>
									<br />
								</div>

								<div>
									<ul>
										{this.state.customKineticLaw.parameters?.map(param => (
											<li key={param.name}>
												<label style={{display: 'flex', justifyContent: 'space-between', width: '25%'}}>
													{param.name}:
													<Editable value={param.value} onEdit={v => this.setState({ customKineticLaw: this.state.customKineticLaw.update("parameters", this.state.customKineticLaw.parameters.map(p => p.name === param.name ? p.update("value", v) : p))})} />
													<Options value={param.unit} options={Seq([
														{ name: "dimensionless" },
														{ name: "molar"},
														{ name: "molar per second"},
														{ name: "second^-1"},
													])} onChange={v => this.setState({ customKineticLaw: this.state.customKineticLaw.update("parameters", this.state.customKineticLaw.parameters.map(p => p.name === param.name ? {...p, unit: v} : p))})} />
												</label>
											</li>
										))}
									</ul>
								</div>

								<button style={{ float: "right" }} onClick={() => createCustomKineticLaw()}>Create Kinetic Law</button>
							</div>
						</div>) :
							(
								this.state.selectedItem && (
									<div>
										<h3>{this.state.selectedItem.name}</h3>
										<p style={{ overflow: "auto", height: "250px" }}>
											<Latex>{this.state.selectedItem.description}</Latex>
											<br />
											<Latex>{this.state.selectedItem.display}</Latex>
										</p>
										<button style={{ float: "right" }} onClick={() => onSubmit()}>Add Kinetic Law</button>
									</div>)
							)
						}
					</div>

				</div>
			</span>
		);
	}
}

const e = view(Content);

e.width = 800;
e.height = 350;

export const MessageContent = Content;
export default e;