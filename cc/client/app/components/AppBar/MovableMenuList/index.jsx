import React, {
	Component
} from 'react';
import {
	injectIntl
} from 'react-intl';

import SortableContainer from './SortableContainer';


import messages from './messages';

import { sanitizeLayoutName } from "../../../layouts"

import Application from '../../../application';

import './styles.scss';

const swapElements = (array, index1, index2) => {
    array[index1] = array.splice(index2, 1, array[index1])[0];
};

const MenuItem = (item) => {
	let { content, label, ...args } = item;

	label = sanitizeLayoutName(label);

	return (
		<li {...args}>
			{content ? content(item) : label}
		</li>);
};

const SortableItem = (props) => (<MenuItem {...props} movable={true} />);

const MyList = (items, listEl, props = {}) => {
	return (
		<ul {...props}>
			{items.map((value, index) =>
				listEl({
					key: `item-${index}`,
					index,
					...value
				})
			)}
		</ul>
	);
};

const SortableList = ({ items, className }) => {
	return MyList(items, (args) => (<SortableItem {...args} />), { className });
};

const UnsortableList = ({ items, className }) => {
	return MyList(items, MenuItem, { className });
}

let showSlide = '';

class SortableComponent extends Component {

	constructor(props) {
		super(props);
		this.menuRef = React.createRef();
		this.state = {
			shufflingItems: false,
			menuSlideVal: 0
		}
	}

	checkResponsiveSize() {
		let uEl = document.querySelector('.menuSlideWrap > ul');
		if (!uEl) { return; }
		let sizeW = window.innerWidth;
		let sizeWEl = uEl.offsetWidth;
		if (sizeWEl > sizeW-350) {
			showSlide = 'show-slide';
		} else {
			showSlide = '';
		}
	}

	componentWillUpdate(states) {
		if (states.responsive
			&& states.responsive == true
			&& states.items
			&& states.items.length > 0)
		{
			this.checkResponsiveSize();
		}
	}

	handleSlideMenu(right=true) {
		let el = this.menuRef.current;
		const skipVal = 16;
		let menuSlideVal = this.state.menuSlideVal;
		
		if (right) {	menuSlideVal -= skipVal; }
		else {	menuSlideVal += skipVal;	}

		this.setState((prev) => ({...prev, menuSlideVal}));

		let optsEl = el.querySelector('ul');
		optsEl.style.left = `${menuSlideVal}px`;
		
		let i = 0;
		let tmSlide = setInterval(() => {
			if (i > 2) { clearInterval(tmSlide)	}
			if (right) {	menuSlideVal -= skipVal }
			else {	menuSlideVal += skipVal	}
			this.setState((prev) => ({...prev, menuSlideVal}));
			optsEl.style.left = `${menuSlideVal}px`;
			i++;
		}, 100);
	}

	onSortEnd = ({ oldIndex, newIndex }) => {
		const { items, updatePositions } = this.props;
		updatePositions(swapElements(items, oldIndex, newIndex));
	}
	
	render() {
		const { items, className, updatePositions, intl: { formatMessage }, responsive, layout } = this.props;
		const { shufflingItems } = this.state;

		let renderSortableList = () => (React.createElement(shufflingItems && updatePositions ? SortableList : UnsortableList,
			{className, axis:"x", items, onSortEnd:this.onSortEnd}
		));

		let renderShuffleButton = () => (Application.isTeach && !['OVERVIEW'].includes(`${layout}`.toUpperCase()) && updatePositions && (
			<div 
				className={`moveOrShuffle icon ${(shufflingItems ? 'medium-check-circle' : 'medium-shuffle')} icon-nobg `} 
				title={formatMessage(shufflingItems ? messages.FixPosition : messages.Shuffle)}
				onClick={() => {this.setState((prev) => ({...prev, shufflingItems: !shufflingItems}) )}}>
			</div>
		));

		if (responsive) {
			return (<React.Fragment>
				<button className={`menuSlideBtn left `+showSlide} onClick={this.handleSlideMenu.bind(this, false)}></button>
				<div className={`menuSlideWrap `+showSlide} ref={this.menuRef}>
					{this.state.shufflingItems !== true ? renderSortableList() : <SortableContainer _items={items} className={className} />}
				</div>					
				<button className={`menuSlideBtn right `+showSlide} onClick={this.handleSlideMenu.bind(this)}></button>
				{renderShuffleButton()}
			</React.Fragment>)
		}

		/** Submenu items */
		return (<React.Fragment>
			{renderSortableList()}
			{renderShuffleButton()}
		</React.Fragment>)
	}
}

export default injectIntl(SortableComponent);
