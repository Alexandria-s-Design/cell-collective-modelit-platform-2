import React from 'react';
import { Seq } from 'immutable';

import Panel from '../../client/app/component/base/panel';
import Table from '../../client/app/component/base/table';

const TableData = Seq(new Array(10)).map((_, i) => ({
	"column_1": `Row ${i + 1}, Column 1`,
	"column_2": `Row ${i + 1}, Column 2`,
	"column_3": `Row ${i + 1}, Column 3`
}));

class BasicTableObjectDemo extends React.Component {
	render() {
		const { view } = this.props;
		return <Panel {...view}>
			<Table
				data={TableData}
				columns={[
					{ get: "column_1", label: "Column 1" },
					{ get: "column_2", label: "Column 2" },
					{ get: "column_3", label: "Column 3" }
				]}
				references={[]}
			/>
		</Panel>;
	}
}

export default {
	Component: BasicTableObjectDemo,
	title: "Basic Table Demo (Object/Dictionary Data)",
	sourceKey: "basicTableDemoObject"
}