import React from 'react';
import ReactDom from 'react-dom';
import Utils from '../../utils';
import Immutable, { Seq } from 'immutable';
import Persist from '../../mixin/persist';
import Scrollable from './scrollable';
import Head from './tableHead';
import Body from './tableBody';
import Row from './tableRow';
import Search from './tableSearch';

const persist = Persist({ sort: null });
let checkboxRef;

export default persist(class extends Utils.MyComponent {
	static defaultProps = {
		master: true,
		searchHeight: 22,
		headHeight: 20,
		rowHeight: 23
	}
	
	getInitState(...args) {
		const e = Seq(this.props.columns);
		return Seq(super.getInitState ? super.getInitState(...args) : {}).concat({ sort: { column: ((e.findIndex(c => c.get === "name" && c.sortable !== false) + 1) || (e.findIndex(c => c.sortable !== false) + 1)) - 1, ascending: true }}).toObject();
	}
	accessor(a) {
		if (typeof (a) == "function") return a;
		return (e) => {
			if (this.props.atEntity && this.props.atEntity in e) {
				return e.self.get(a);
			}
			return e[a];
		}
	}

	index(props, auto) {
		const selected = props.selected;
		auto && props.onSelect && !selected && this.data.size && props.onSelect(this.data.first());
		this.selected = selected ? this.data.indexOf(selected) : -1;
	}
	update(props, search, map) {

		if (!search) {
			this.data = props.data.sortBy(e => map[e.uniqk]).toList();
			return;
		}

		if (typeof props.search === "object") {

			let filteredData = new Immutable.List();

			for (let x = 0; x < props.search.length; x++) {
				let sp = props.search[x];
				let filteredResult = (props.data.filter(
					  e => e[sp] && e[sp].toLowerCase().indexOf(search.toLowerCase()) >= 0));

				filteredData = filteredData.concat(filteredResult);
			}

			this.data = filteredData.sortBy(e => map[e.uniqk]).toList();
		} else {
			this.data = (props.data.filter(e => e[props.search] && e[props.search].toLowerCase().indexOf(search.toLowerCase()) >= 0)
			).sortBy(e => map[e.uniqk]).toList();
		}
	}
	sort(props, sort, search, auto) {
		const order = this.order;

		if (sort.column >= 0 && props.columns[sort.column]) {
			const get = this.accessor(props.columns[sort.column].get);
			const dir = sort.ascending ? 1 : -1;
			order.list = Seq(order.list).sortBy(
				e => {
					const v = get(e);
					return v && v.toLowerCase ? v.toLowerCase() : v
				},
				(a, b) => {
					return a < b ? -dir : (a > b ? dir : 0)
				}
			).toArray()
		}
		order.index = 0;
		const map = order.map = {};
		order.list.forEach((e, i) => {
			map[e.uniqk] = i
		});
		this.update(props, search, map);
		this.index(props, auto);
	}
	onAdd() {
		const e = this.props.creator();
		e.name && (e._name = e.name);
		this.props.onAdd(e, true);
	}
	onRemove() {
		this.selected >= 0 && this.props.onRemove(this.props.selected, this.data.size - 1 ? this.data.get(this.selected + (this.selected === this.data.size - 1 ? -1 : 1)) : undefined);
	}
	UNSAFE_componentWillMount() {
		this.order = { list: this.props.data.toArray() };
		this.data = new Immutable.List();
		this.selected = -1;
		this.sort(this.props, (this._persisted[null] || this.state).sort, this.state.search, this.props.master);

		this.props.addListener && this.props.addListener("add", this._onAdd = this.onAdd.bind(this));
		this.props.addListener && this.props.addListener("remove", this._onRemove = this.onRemove.bind(this));
	}
	componentWillUnmount() {
		this.props.removeListener && this.props.removeListener("add", this._onAdd);
		this.props.removeListener && this.props.removeListener("remove", this._onRemove);
	}
	onSortChange(column, keepState) {
		let sort = this.state.sort;
		sort = { column: column, ascending: column === sort.column ? !sort.ascending : sort.ascending };
		((keepState === true) && (sort.ascending = this.state.sort));
		this.sort(this.props, sort, this.state.search);
		this.setState({ sort: sort });
	}
	onSearchChange(value) {
		if (checkboxRef) {
			checkboxRef.checked = false;
			checkboxRef.indeterminate = false;
			this.props.setComponentState && this.props.setComponentState({checkboxInUse: checkboxRef.checked})
		}
		this.update(this.props, value, this.order.map);
		this.index(this.props);
		this.setState({ search: value });
	}

	setCheckboxRef(ref) {
		checkboxRef = ref;
		this.props.setCheckboxRef(checkboxRef);
	}

	onActivityCheckboxChange(col, el) {
		el.stopPropagation();
		checkboxRef.indeterminate = false;
		const value = checkboxRef.checked ? 100 : 0;
		this.props.setComponentState && this.props.setComponentState({checkboxInUse: checkboxRef.checked})
		this.data.map((e) => {
			this.props.setSliderValue(e, value);
		})
		this.onSortChange(col, true)
	}

	onBlur() {
		ReactDom.findDOMNode(this.refs.body).focus();
		this.setState({ editing: false });
	}
	setPosition(e) {
		this.refs.scrollable.setPosition(e);
	}
	UNSAFE_componentWillReceiveProps(props) {
		if (this.props.references.some((e, i) => e !== props.references[i])) {
			props.data.cacheResult && props.data.cacheResult();
			const order = this.order;

			if (props.owner === this.props.owner) {
				const list = order.list;
				const map = order.map;
				let i = order.index;
				props.data.filter(e => map[e.id] === undefined).sortBy(e => e.id, (a, b) => b - a).forEach(e => list.unshift(e) && (map[e.id] = --i));
				i !== order.index && (order.index = i) && this.setPosition(0);
				this.update(props, this.state.search, map);
				this.index(props, props.master);
			}
			else {
				order.list = props.data.toArray();
				this.sort(props, this.state.sort, this.state.search, props.master);
			}
		}
		else if (props.selected !== this.props.selected) {
			this.index(props);
		}
		props.owner !== this.props.owner && this.setPosition(0);
	}
	shouldComponentUpdate(props, state) {
		return this.props.selected !== props.selected || this.props.references.some((e, i) => e !== props.references[i]) || this.props.persisted !== props.persisted || this.state.sort !== state.sort ||
			this.state.search != state.search || this.state.editing !== state.editing || this.props.parentWidth !== props.parentWidth || this.props.parentHeight !== props.parentHeight;
	}
	render() {
		const props = this.props;
		let { persisted, editable, search, rowHeight, showEmpty, onSelect, onDrag, persist } = props;
		const references = props.references.concat(persisted);

		const mapColumns = (c) => c.map((c, i) => {
			const get = this.accessor(c.get);
			return {
				index: i,
				property: c.key || c.get,
				format: c.format || get,
				def: c.def && this.accessor(c.def),
				values: c.values,
				state: e => { let p; return (persisted && e.isPersisted && get(e) !== (p = get(persisted[e.accessId ? e.accessId : e.id])) && (p ? "dirty" : "new")) || "" },
				label: c.label,
				title: c.title,
				showCheckbox: c.showCheckbox,
				editable: c.editable,
				sortable: c.sortable !== false,
				style: c.style || "float",
				minWidth: c.minWidth
			}
		}).filter(c => (c.minWidth ? c.minWidth <= props.parentWidth : true));

		const headercolumns = mapColumns(props.columns);

		let data;
		let columns = headercolumns;
		if (showEmpty && this.data.isEmpty()) {
			columns = mapColumns([{ get: "text", label: "Text", style: "center" }]);
			data = Seq([{ text: "... no data ...", id: 0 }]).toList();
			editable = false; onSelect = undefined; onDrag = undefined;
		} else {
			data = this.data;
		}

		return (
			<Scrollable ref="scrollable" parentHeight={props.parentHeight} height={rowHeight * this.data.size} step={rowHeight} fixedHeight={props.headHeight + (search ? props.searchHeight : 0)}>
				{search && (<Search persist={persist + ".search"} value={this.state.search} property={search} data={props.data} onChange={this.onSearchChange.bind(this)} parentWidth={props.parentWidth} data-fixed="true" />)}
				<Head setCheckboxRef={this.setCheckboxRef.bind(this)} columns={headercolumns} sort={this.state.sort} onActivityCheckboxChange={this.onActivityCheckboxChange.bind(this)} onSortChange={this.onSortChange.bind(this)} data-fixed="true" />
				<Body ref="body" columns={columns} data={data} references={references} rowHeight={rowHeight} selected={this.selected} onSelect={onSelect} onDrag={onDrag} editable={editable}
					onEdit={() => this.setState({ editing: true })} setPosition={this.setPosition.bind(this)} />
				{this.selected >= 0 && (<Row columns={columns} data={props.selected} references={references} position={rowHeight * this.selected - 1} editing={this.state.editing} editable={editable}
					onEdit={props.onEdit} cursor={props.cursor} onClick={props.onClick} onDoubleClick={props.onDoubleClick} onDrag={props.onDrag} onBlur={this.onBlur.bind(this)} />)}
			</Scrollable>
		);
	}
});
