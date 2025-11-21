import React from 'react';
import { Seq } from 'immutable';

import Application from '../../application';

import Panel from '../base/panel';
import ScrollableNative from '../base/scrollableNative';
import { ProgressDial } from './learningInsights';
import NotFoundInsights from './alerts/NotFoundInsights';
import Inform from "../dialog/inform";
import { CCContextConsumer } from "../../containers/Application/index";
import { getOrdinalNumber } from '../../util/number';

const shorthandMap = {
	'personal': {
		display: user => `${user.firstName} ${user.lastName}`,
		domains: ['learning']
	},
	'course': {
		display: 'Your Course',
		domains: ['teaching', 'learning']
	},
	'institution': {
		display: 'Your Institution',
		domains: ['teaching', 'learning']
	},
	'peer': {
		display: 'Peer Institutions',
		domains: ['teaching', 'learning']
	},
	'all': {
		display: 'All Institutions',
		domains: ['teaching', 'learning']
	}
};

const scoresDesc = {
	personal: 0,
	course: 0
};

const displayValue = (percentile, char="") => {
	if ([undefined, null].includes(percentile)) return '(no data)';
	return `${percentile}${char}`;
}


// TODO - make learning insights include this, and remove the tabs for learning.
const BuildBenchmarksView = (getScoreData) => ({ construct: ((state) => class extends React.Component {
	
	helperText = 'What does that mean?';

	openHelperBox(title, msg, cc, e) {
		e.preventDefault();		
		cc.showDialog(Inform, { message: msg, barTitle: title });
	}

	render() {
		const { view, user } = this.props;

		if (state.error) return <div></div>;

		if (state.scores === null) {
			// TODO - display loading graphic
			return <div>Loading...</div>;
		}

		if (state.scores.length == 0) {
			return <NotFoundInsights domain='learning'/>
		}

		const rawData = getScoreData(state.scores);
		const currentDomain = Application.domain;
		
		const data = Seq(shorthandMap).filter(v => v.domains.includes(currentDomain)).mapEntries(([k, v]) => [k, {
			display: v.display,
			key: k,
			...rawData[k],
			info: rawData.helpers[k]
		}]).filter(entry => !entry.hide).toArray();

		const personalGraph = Seq(data).filter(entry => entry.key === 'personal').first();

		const paneWidth = Math.max(182 + 50 /* width of progress dials + margins */, Math.floor((1 / data.length) * view.parentWidth)) - 1; // subtract one for border
		const paneWidth2 = Math.max(130 + 50, Math.floor(((view.parentWidth / data.length) * 90) / 100))-1;

		scoresDesc.personal = (personalGraph !== undefined && Math.round(personalGraph.value)) || 0;

		const renderStudentGraphics = (cc) => (
			<div style={{width: `${paneWidth * data.length}px`, height: '100%', position: 'relative'}}>
				<Panel width={paneWidth} className="you">
					<div className="score label">YOUR SCORE</div>
					<ProgressDial
						progress={personalGraph.value}
						label={personalGraph.display(user)}
					/>
				</Panel>
				<div>
				{Seq(data).filter(v => !['personal'].includes(v.key)).map((entry, idx) => {
					if (entry.key == 'course') { scoresDesc.course = entry.value; }
					const displayTitle = typeof entry.display === 'function' ? entry.display(user) : entry.display;
					return <Panel key={idx} left={(idx + 1) * paneWidth} width={paneWidth}>
						{idx === 0 ?  <div className="percentile label">YOUR PERCENTILE <span>***</span></div> : null}
						<ProgressDial progress={entry.value} format={displayValue.bind(null, entry.value, "")} progressFont={{size: '28pt'}}
							label={displayTitle}
						/>
					</Panel>;
				}).toArray()}
				<p className="scores-description" style={{left: paneWidth + 25}}>
					<span>***</span>Your Percentile indicates the percentage of the scores (or students) that fall at or below your score. For example, {scoresDesc.course} in the circle of Your Course above means your score ({scoresDesc.personal}%) is in the {getOrdinalNumber(scoresDesc.course)} percentile for students in your course, which in turn indicates {scoresDesc.course} percent of the students in your course have achieved a score lower than or equal to yours, or {Math.ceil(100 - scoresDesc.course)} percent of the students in your course have achieved a score higher than yours.</p>
				</div>
			</div>
		);
		
		const renderTeacherGraphics = (cc) => (
			<div style={{width: `${paneWidth * data.length}px`, height: '100%', position: 'relative'}}>
				{Seq(data).map((entry, idx) => {
					return <Panel key={idx} left={idx > 0 ? idx * paneWidth2 : 0} width={paneWidth2}>
						<ProgressDial progress={entry.value} format={displayValue.bind(null, entry.value, "%")} progressFont={{size: '28pt'}}
							label={entry.display}/>
					</Panel>;
				}).toArray()}
			</div>
		);

		return <Panel {...view} className="insightsBenchmarks">
			<ScrollableNative horizontal={true} width="100%" height="100%">
				<CCContextConsumer>
					{({cc}) => currentDomain == 'teaching'
						? renderTeacherGraphics(cc) : renderStudentGraphics(cc)}
				</CCContextConsumer>
			</ScrollableNative>
		</Panel>
	}
}) });

export { BuildBenchmarksView };

export default {
	name: 'Benchmarks',
	Actions: {},
	Content: BuildBenchmarksView((rawData) => Object.fromEntries(
		Object.entries({
			personal: rawData.personal,
			course: rawData.course,
			institution: rawData.institution,
			peer: rawData.peer,
			all: rawData.all,
			helpers: rawData.helpers
		}).filter(raw => raw[1] != undefined)
	)),
	domains: ['teaching', 'learning']
}