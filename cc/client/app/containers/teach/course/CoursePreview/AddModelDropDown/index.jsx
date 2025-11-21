import React from 'react';
import { connect } from 'react-redux';
import { Seq } from 'immutable';
import cc from '../../../../../../app/cc'
import ScrollableNative from '../../../../../component/base/scrollableNative';

import AddIcon from '@mui/icons-material/Add';
import Application from '../../../../../../app/application';

import { ActionTypes } from './actions';

import "./style.scss";

class AddModelList extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			category: null,
			checkedList: []
		};
	}

	render() {
		const { values, onChange, onCancel } = this.props;

		const rItem = (props) => {
			const {id, title} = props;

			const onCheckboxChange = (e, id, title) => {
					const isChecked = e.target.checked;

					//Add checked item into checkList
					if(isChecked){
						const modelCheckedObj = { id: id, title: title };
						this.setState({checkedList: [...this.state.checkedList, modelCheckedObj]})
					}
					else{
						const filteredList = this.state.checkedList.filter((item) => item.id !== e.target.value);
					
						//Remove unchecked item from checkList
						this.setState({checkedList: filteredList});
					}
				};

			return (
				<div title={title}>
					<input type="checkbox" name="model"  id ={`model_${id}`} value={id} onChange={(e) => {onCheckboxChange(e, id, title);}}/>
					<label for={`model_${id}`}> ({id}) {title} </label>
				</div>
			);
		};

		const doAddSelectedModelToCourse = (() =>{
			if(this.state.checkedList.length>0){
				for(let i=0; i<this.state.checkedList.length; i++){
					let obj = this.state.checkedList[i];
					onChange(obj);
				}
			}
		})

		const doCancel = (() => {
			this.state.category ? this.setState({
				category: null
			}) : onCancel();
		}).bind(this);

		const setCategory = ((cat) => {
			this.setState({
				category: cat
			});
		});
	
		return (
			<ScrollableNative className="addModelList">
				<ul className="ul">
					<li className="def" key="_def"><div onClick={() => doCancel()}>... go back ...</div></li>
					{values === null ? <li key={0}>loading...</li> :(this.state.category ? Seq(values[this.state.category]).map((v, k) => (
						<li key={k}>
							{rItem({
								id: k,
								title: v
							})}
						</li>
					)).toArray() : Object.keys(values).map((category, idx) => (
						<li key={idx}>
							<div title={category} onClick={setCategory.bind(this, category)}>
								{category}
							</div>
						</li>
					)))}
				</ul>

			<ul>
				{this.state.checkedList.length > 0 ? <li className="add-model-btn" key="_def1"><div onClick={() => doAddSelectedModelToCourse()}>... Add Selected Module...</div></li>: ""}	
			</ul>

			</ScrollableNative>
		);
	}
}

const NAMES = {
	"my": "My Modules",
	"shared": "Shared with Me",
	"published": "Public Modules"
}
class AddModelDropDown extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			showDropDown: false
		}
	}
	render() {
		const { addModelToCourse, modelCatalogSave, Models } = this.props;

		const showDropDown = this.state.showDropDown;
		const changeShowAdd = val => {
			this.setState({
				showDropDown: val
			});
		}

		async function getModels() {
			const allModels = (await cc.request.get("/api/model/teach-catalog")).data;
			const data = Seq(allModels).mapEntries(([k, v]) => [NAMES[k], v]).toObject();
			modelCatalogSave(data);
		}

		return (
			<>
				{!showDropDown && (
					<div 
						className="addModelDropdownIcon" 
						onClick={() => { changeShowAdd(!showDropDown); (!Models && getModels()) }} 
						>
						<AddIcon fontSize="large" />
						<div>add module</div>
					</div>
					// <Panel.Action name={"add"} title={"Add model to course"} onClick={() => { changeShowAdd(!showDropDown) }} />
				)}
				{showDropDown && (
						<AddModelList 
								values={Models} 
								onChange={({id}) => { addModelToCourse(id); changeShowAdd(false); }} 
								onCancel={() => {changeShowAdd(false); }}
							/>)}
			</>
		);
	}
}

const mapStateToProps = ({ addModelDropDown: { courseModelCatalog: catalog } }) => {
	return {
		Models: catalog || null
	}
};

const mapDispatchToProps = (dispatch) => ({
	modelCatalogSave: models => {
		dispatch({
			type: ActionTypes.STORE_MODELS,
			payload: models
		});
	}
});

export default connect(mapStateToProps, mapDispatchToProps)(AddModelDropDown);