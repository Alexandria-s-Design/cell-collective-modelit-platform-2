import React from 'react';
import { Seq, Range } from 'immutable';
import Update from '../../action/update';
import Remove from '../../action/remove';
import Add from '../../action/add';
import SurveyTableCell from '../../entity/surveyTableCell';
import SimpleTable from '../base/simpleTable';
import Editable from '../base/editable';
import Application from '../../application';
import classNames from 'classnames';


const MIN_ROWS = 2;
const MIN_COLS = 2;
class SurveyItemTable extends React.Component {
  constructor(props) {
    super(props);
  }
  _addRowBatch(plus = 0) {
    const {
      entity,
      actions: { batch },
    } = this.props;
    const cols = entity.tableCol + plus;
    return [new Update(entity, 'tableRow', entity.tableRow + 1)].concat(
      cols > 0
        ? Range(0, cols)
            .map(col => new Add(new SurveyTableCell({ parent: entity, tCol: col, tRow: entity.tableRow })))
            .toArray()
        : [],
    );
  }
  _addColBatch(plus = 0) {
    const {
      entity,
      actions: { batch },
    } = this.props;
    const rows = entity.tableRow + plus;
    return [new Update(entity, 'tableCol', entity.tableCol + 1)].concat(
      rows > 0
        ? Range(0, rows)
            .map(row => new Add(new SurveyTableCell({ parent: entity, tRow: row, tCol: entity.tableCol })))
            .toArray()
        : [],
    );
  }
  addRow() {
    const {
      entity,
      actions: { batch },
    } = this.props;
    const rowBatch = this._addRowBatch();
    if (entity.tableCol <= 0) {
      batch(rowBatch.concat(this._addColBatch(1)));
    } else {
      batch(rowBatch);
    }
  }
  addCol() {
    const {
      entity,
      actions: { batch },
    } = this.props;
    const colBatch = this._addColBatch();
    if (entity.tableRow <= 0) {
      batch(colBatch.concat(this._addRowBatch(1)));
    } else {
      batch(colBatch);
    }
  }
  delRow() {
    const {
      entity,
      actions: { batch },
    } = this.props;
    if (entity.tableRow === 0) return;
    batch(
      [new Update(entity, 'tableRow', entity.tableRow - 1)].concat(
        Seq(entity.tableCells || [])
          .filter(e => e.tRow >= entity.tableRow - 1)
          .map(e => new Remove(e))
          .toArray(),
      ),
    );
  }
  delCol() {
    const {
      entity,
      actions: { batch },
    } = this.props;
    if (entity.tableCol === 0) return;
    batch(
      [new Update(entity, 'tableCol', entity.tableCol - 1)].concat(
        Seq(entity.tableCells || [])
          .filter(e => e.tCol >= entity.tableCol - 1)
          .map(e => new Remove(e))
          .toArray(),
      ),
    );
  }
  render() {
    const {
      editableContent,
      entity: { tableCells, tableCol, tableRow },
      actions,
    } = this.props;

    const isEditingTeacher = editableContent && Application.domain === 'teaching';
    const target = editableContent ? (isEditingTeacher ? 'text' : 'studentAnswer') : '';

    const createCell = (e, r, c) => {
			const cellEntity = e[r + '_' + c];

      let value = cellEntity?.text;
      if (r === 0 || c === 0) {
        // Row/Column headers
        if (editableContent && !isEditingTeacher) {
          return <div className="editable multiline">{cellEntity?.text}</div>; // Prevent students from editing headers
        }
      } else {
        if (editableContent && !isEditingTeacher) {
          value = cellEntity?.studentAnswer;
        }
			}
			
			let placeHolderTeach;
			if(r==0 && c == 0){
				placeHolderTeach = "";
			}else if (r == 0 || c == 0){
				placeHolderTeach = "Enter Header";
			}else{
				placeHolderTeach = "Enter Text"
			}

			let placeHolderAnswer;
			if(r == 0 || c == 0){
				placeHolderAnswer = "undefined";
			}else{
				placeHolderAnswer = "Enter Answer";
			}


      return (
        <Editable
          placeHolder={editableContent ? (isEditingTeacher ? placeHolderTeach : placeHolderAnswer) : ''}
          multiline={true}
          value={value}
          onEdit={editableContent && (val => cellEntity && actions.onEdit(cellEntity, target, val))}
        />
      );
    };

    const data = {};
    Seq(tableCells).forEach(e => {
      const k = e.tRow + '_' + e.tCol;
      data[k] = e;
		});
		
		const canDelRow = tableRow > MIN_ROWS;
		const canDelCol   = tableCol > MIN_COLS;

    return (
      <div style={{ marginTop: '5px', marginBottom: '5px' }}>
        {isEditingTeacher && (
          <div>
            <div style={{ float: 'left' }}>
              Rows:
              <input type="button" className="icon base-add" title="Add Row" onClick={this.addRow.bind(this)} />
							<input 
								type="button" 
								className={classNames("icon", "base-remove", !canDelRow && "disabled")} 
								title="Remove Row" 
								onClick={canDelRow ? this.delRow.bind(this) : undefined} 
								/>
            </div>
            <div style={{ float: 'right' }}>
              Columns:
              <input type="button" className="icon base-add" title="Add Column" onClick={this.addCol.bind(this)} />
              <input
                type="button"
								className={classNames("icon", "base-remove", !canDelCol && "disabled")} 
                title="Remove Column"
                onClick={canDelCol ? this.delCol.bind(this) : undefined}
              />
            </div>
          </div>
        )}
        <SimpleTable cell={createCell} firstRowHeader={true}  firstColHeader={true} rows={tableRow || 0} cols={tableCol || 0} data={data} />
      </div>
    );
  }
}

SurveyItemTable.checkData = (entity) => {
	/**** Ensure the entity has at least MIN_ROWS rows and MIN_COLS columns before displaying */

	const data = {};
	Seq(entity.tableCells).forEach(e => {
		const k = e.tRow + '_' + e.tCol;
		data[k] = e;
	});

	const changes = [];

	let cols = entity.tableCol || 0;
	if(cols < MIN_COLS){
		cols = MIN_COLS;
		changes.push(new Update(entity, 'tableCol', cols));
	}
	let rows = entity.tableRow || 0;
	if(rows < MIN_ROWS){
		rows = MIN_ROWS;
		changes.push(new Update(entity, 'tableRow', rows));
	}

	for(let i = 0; i < cols; i++){
		for(let j = 0; j < rows; j++){
			if(!data[`${j}_${i}`]){
				changes.push(new Add(new SurveyTableCell({ parent: entity, tRow: j, tCol: i })));
			}
		}
	}

	return changes;
}

export default  SurveyItemTable;