import { Seq } from 'immutable';

import InsightsOverview from './learningInsightsOverview';
import InsightsBenchmarks from './learningInsightsBenchmarks';
import InsightsObjectives from './learningInsightsObjectives';
import InsightsDownloader from './learningInsightsDownloader';
import Application from '../../application';

import "./learning.scss";

const views = Seq([
	InsightsOverview,
	InsightsBenchmarks,
	InsightsObjectives,
	InsightsDownloader
]).filter(view => {
	return view.domains.includes(Application.domain);
}).toKeyedSeq().mapEntries(([k, v]) => {
	return [v.name, v]
}).toObject();

export default views;