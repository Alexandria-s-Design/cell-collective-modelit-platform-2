import React from 'react';
import { Seq } from 'immutable';

import Application from '../../application';
import Message from '../dialog/message';

import { connect } from 'react-redux';
import { WORKSPACE, changeWorkspace } from '../../containers/Application/ModuleDM/Module/actions';

import view from '../base/view';
import insightsViews from './insightsViews';

import request from '../../request';

class Content extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			scores: null,
			alert: null
		}
	}

	shouldComponentUpdate(nextProps, nextState) {
		return ((this.state.scores === null) && (nextState.scores !== null)) || (this.props.insights_cateogry !== nextProps.insights_category);
	}

	componentDidMount() {
		const { model, cc, onFail } = this.props;
		if (model.top.id > 0 || model.top.Persisted) {
			const teach = Application.domain === 'teaching' ? '&teach' : '';
			request.get(`/api/module/${model.top.id > 0 ? model.top.id : model.top.Persisted}/insights?forCourse=${cc.state.course}${teach}`).then(res => {
				this.setState({
					scores: res.data.data.scores,
					error: false,
					alert: null
				});
			}).catch(err => {
				if (err.response && err.response.data.code == 401) {
					this.setState({
						error: false,
						scores: [],
						alert: err.response.data.error.errors[0].message
					});
				} else {
					cc.showDialog(Message, { message: err.response.data.error.errors[0].message, onSubmit: () => {
						onFail();
						cc.closeDialog();
					} });
					this.setState({
						error: true
					});
				}
			});
		}
	}

	render() {
		const { cc } = this.props;
		const insights_category = this.props.insights_category || Seq(insightsViews).map((v, k) => k).toIndexedSeq().first();

		let Component = insightsViews[insights_category].Content;
		if (typeof Component === 'object') {
			Component = Component.construct(this.state);
		}

		return <Component {...this.props} />
	}
}

const Actions = (props) => {
	const viewActions = insightsViews[props.insights_category || Seq(insightsViews).map((v, k) => k).toIndexedSeq().first()].Actions;
	if (typeof viewActions === 'function') {
		return viewActions(props);
	} else {
		return viewActions;
	}
};

const mapDispatchToProps = (dispatch) => ({
	onFail: dispatch.bind(null, changeWorkspace(WORKSPACE.MODEL))
});

export default connect(null, mapDispatchToProps)(view(Content, null, Actions));
