import React from 'react';
import { Seq } from 'immutable';
import { BuildBenchmarksView } from './learningInsightsBenchmarks';
import Options from '../base/options';
import Panel from '../base/panel';
import { PanelFlow } from '../base/panelLayout';
import NotFoundInsights from './alerts/NotFoundInsights';

const Content = {
	construct: (state) => class extends React.Component {
		constructor(props) {
			super(props);
			this.state = {
				objective: null
			};
		}
		render() {

			if (state.scores === null) {
				return <div>Loading...</div>;
			}	

			if (state.scores.length == 0) {
				return <NotFoundInsights domain='learning'/>
			}

			const { model, view } = this.props;

			const getObjectiveName = ({ objective: obj }) => ((`${obj}` in model.mLearningObjective) ? model.mLearningObjective[`${obj}`].self.get("value") : null);

			const objectives = state.scores ? Seq(state.scores.learning_objectives).mapEntries(([k, v]) => [k, { objective: k, score: v }])
				.toIndexedSeq().sortBy(getObjectiveName) : null;

			const objID = (this.state.objective || { objective: null }).objective;
			const ObjView = objID ? BuildBenchmarksView((scoreData) => ({
				personal: { value: scoreData.learning_objectives[objID] },
				course: { value: 0, percentile: 0, maxPercentile: 0 },
				institution: { value: 0, percentile: 0, maxPercentile: 0 },
				all: { value: 0, percentile: 0, maxPercentile: 0 }
			})).construct(state) : null;
			return <PanelFlow view={view}>
				<Panel>
					<div className="insightsObjectiveSelect">
						Learning Objective: <Options value={this.state.objective} options={objectives} onChange={(obj) => this.setState({ objective: obj })}
							get={getObjectiveName} />
					</div>
				</Panel>
				<Panel layoutHeight="vfill">{ObjView ? <ObjView {...this.props} /> : <div className="insightsMessageCenter">Please select a learning objective.</div>}</Panel>
			</PanelFlow>;
		}
	}
};

export default {
	name: 'Learning Objectives',
	Actions: {},
	Content,
	domains: ['teaching', 'learning']
};