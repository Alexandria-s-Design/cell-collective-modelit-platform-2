import React from 'react';
import { Seq } from 'immutable';

import Panel from '../../client/app/component/base/panel';
import { PanelFlow, HeightFunctions } from '../../client/app/component/base/panelLayout';
import Table from '../../client/app/component/base/table';
import BasicOptions from '../../client/app/component/base/basicOptions';

const TableData = Seq([
	{ name: 'John Smith', occupation: 'Construction Worker', age: 42 },
	{ name: 'John Wilson', occupation: 'Computer Programmer', age: 19 },
	{ name: 'Owen Wilson', occupation: 'Data Entry', age: 62 },
	{ name: 'Katherine Cooper', occupation: 'Data Scientist', age: 24 },
	{ name: 'Larken Smith-Johnson', occupation: 'Unemployed', age: 13 },
	{ name: 'Bartholomew van Zant', occupation: 'Priest', age: 37 },
	{ name: 'Cooper Smith-Wilson', occupation: 'President', age: 45 }
]);

class TableSearchDemo extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			search: null
		}
	}

	setSearch(search) {
		this.setState({
			search: search ? search.toLowerCase() : null
		});
	}

	render() {
		const { view } = this.props;
		const { search } = this.state;
		return <PanelFlow view={view} scrollable={2}>
			<Panel innerHeight={HeightFunctions.TableHeight(5)}>
				<Table
					data={TableData}
					columns={[
						{ get: 'name', label: 'Name' },
						{ get: 'occupation', label: 'Occupation' },
						{ get: 'age', label: 'Age' }
					]}
					references={[]}
					search={search}
				/>
			</Panel>
			<Panel>
				<div>
					Search against: <BasicOptions options={['Name', 'Occupation']} onChange={this.setSearch.bind(this)} />
				</div>
				<hr />
			</Panel>
		</PanelFlow>;
	}
}

export default {
	Component: TableSearchDemo,
	title: "Table with Search",
	sourceKey: "tableSearch"
}