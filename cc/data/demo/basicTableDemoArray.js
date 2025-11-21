import React from 'react';
import { Seq } from 'immutable';

import Panel from '../../client/app/component/base/panel';
import Table from '../../client/app/component/base/table';

const TableData = Seq(new Array(10)).map((_, i) => [
	`Row ${i + 1}, Column 1`,
	`Row ${i + 1}, Column 2`,
	`Row ${i + 1}, Column 3`
]);

class BasicTableArrayDemo extends React.Component {
	render() {
		const { view } = this.props;
		return <Panel {...view}>
			<Table
				data={TableData}
				columns={[
					{ get: 0, label: "Column 1" },
					{ get: 1, label: "Column 2" },
					{ get: 2, label: "Column 3" }
				]}
				references={[]}
			/>
		</Panel>;
	}
}

export default {
	Component: BasicTableArrayDemo,
	title: "Basic Table Demo (Array Data)",
	sourceKey: "basicTableDemoArray"
}