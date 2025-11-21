import {Range} from "immutable";
import React from "react";


class EditableCell extends React.Component{
	render(){
		const {firstRowHeader, firstColHeader, cell, rowIdx, colIdx, data} = this.props;

		const cellEl = cell(data, rowIdx, colIdx);

		if(
				(rowIdx == 0 && firstRowHeader)
				||
				(colIdx == 0 && firstColHeader)
		){
			return (
				<th>{cellEl}</th>
			);
		}else{
			return (
				<td>{cellEl}</td>
			);	
		}
	}
}


class SimpleRow extends React.Component{
	render(){
		const { cols } = this.props;
		return (                        
			<tr>{Range(0,cols).map(idx => (<EditableCell {...this.props} key={idx} colIdx={idx}/>)).toArray()}</tr>
		);
	}
}


class SimpleTable extends React.Component{

	render(){
		const {rows} = this.props;
		return (
			<table className="simpleTable">
				<tbody>{Range(0,rows).map(idx => (<SimpleRow {...this.props} key={idx} rowIdx={idx}/>)).toArray()}</tbody>
			</table>
		);
	}
} 


export default SimpleTable;