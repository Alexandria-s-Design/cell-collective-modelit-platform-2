import React from "react";
import classNames from "classnames";

class Table extends React.Component {
    render ( ) {
        const { props }         = this;
        const { columns, data, selectable } = props;

        return (
            <table>
                <Table.Head columns = {columns}></Table.Head>
                <Table.Body
                    data = {data}
                    selectable = {selectable} />
            </table>
        )
    }
}

Table.Head = class extends React.Component {
		static displayName = 'Table.Head';
    render ( ) {
        const { props }   = this;
        const { columns } = props;

        return (
            <thead>
                {
                    columns.map(({ label }) => (
                        <th key={label}>
                            {label}
                        </th>
                    ))
                }
            </thead>
        )
    }
}

Table.Body = class extends React.Component {
	static displayName = 'Table.Body';
    render ( ) {
        const { props } = this;
        const { data, selectable } = props;

        return (
            <tbody className={classNames({ selectable })}>
                {
                    data.map(row => (
                        <Table.Row key={row} row={row} />
                    ))
                }
            </tbody>
        )
    }
}

Table.Row  = class extends React.Component {
		static displayName = 'Table.Row';
    render ( ) {
        const { props } = this;
        const { row }   = props;

        return (
            <tr>
                {
                    row.map(cell => (
                        <td key={cell}>{cell}</td>
                    ))
                }
            </tr>
        )
    }
}


export default Table;