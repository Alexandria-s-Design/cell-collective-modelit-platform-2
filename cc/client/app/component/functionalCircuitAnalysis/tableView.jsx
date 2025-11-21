import React from 'react';
import { Seq } from 'immutable';
import view from '../base/view';
import Panel from '../base/panel';
import Table from '../base/table';
import Utils from '../../utils';

export default (state, getTableData, selectNodes, layout, running, result, selectedRow, fileName) => {
  class Content extends React.Component {
    componentWillUnmount() {
      this.props.actions[getTableData](null);
    }
    shouldComponentUpdate(props) {
      return (
        this.props.networkAnalysis[state] !== props.networkAnalysis[state] ||
        this.props.modelState.get(selectedRow) !== props.modelState.get(selectedRow) ||
        this.props.networkAnalysis[running] !== props.networkAnalysis[running] ||
        this.props.networkAnalysis[result] !== props.networkAnalysis[result]
      );
    }
    render() {
      const props = this.props;
      const data = props.networkAnalysis[state];

      const cycles = props.modelState.getIn(['Feedback', 'feedback', state]) || data || Seq();

      const tableData =
        layout === 'functionalCircuits'
          ? [
              { get: 'id', label: 'id', style: 'number' },
              { get: 'name', label: 'Functional Circuit' },
              { get: 'type', label: 'Type', style: 'middle' },
            ]
          : [
              { get: 'id', label: 'id', style: 'number' },
              { get: 'name', label: 'Feedback Loops' },
            ];

      return (
        <Panel {...props.view} top="5px" className="bar">
          {cycles.size && (
            <Table
              {...props.actions}
              onDrag={null}
              onSelect={e => props.actions[selectNodes](e.entities)}
              references={[cycles]}
              owner={props.model}
              data={cycles}
              selected={cycles.find(e => e.entities === props.modelState.get(selectedRow))}
              columns={tableData}></Table>
          )}
          {this.props.networkAnalysis[state] &&
            !props.modelState.getIn(['Feedback', 'feedback', state]) &&
            !this.props.networkAnalysis[running] && (
              <div className="message" style={{ color: '#1f77b4' }}>
                {this.props.networkAnalysis[result]}
              </div>
            )}
        </Panel>
      );
    }
  }

  const Actions = props => {
    const data = props.modelState.getIn(['Feedback', 'feedback', fileName]) || props.networkAnalysis[fileName];
    const filename = layout === 'feedbackLoops' ? 'Feedback_Loops' : 'Functional_Circuits';
    return {
      run: () => {
        props.actions[getTableData](props.model.Component, props);
      },
      download:
        data &&
        (() => {
          Utils.downloadBinary(`[${props.model.name}]_${filename}.csv`, new Blob([data], { type: 'text/plain' }));
        }),
    };
  };

  return view(Content, null, Actions);
};
