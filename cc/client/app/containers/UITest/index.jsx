import React from 'react';
import { Seq } from 'immutable';
import LoadDemos from './demos';

import ErrorBoundary from '../../component/base/errorBoundary';
import BasicOptions from '../../component/base/basicOptions';

class Content extends React.Component {
	constructor(props) {
		super(props);
		this.demoBox = React.createRef();

		this.state = {
			component: null,
			layout: {},
			demos: null,
			demo: -1
		};
	}

	componentDidMount() {
		const demoBoxRef = this.demoBox.current;
		const updateSize = () => {
			const boundingRect = demoBoxRef.getBoundingClientRect();
			const layout = {
				parentWidth: boundingRect.right - boundingRect.left,
				parentHeight: boundingRect.bottom - boundingRect.top
			};
			this.setState({
				layout: layout
			});
		};
		this.listener = updateSize.bind(this);
		window.addEventListener('resize', this.listener);

		updateSize();

		LoadDemos().then(demos => {
			this.setState({ demos: demos });
		});
	}

	componentWillUnmount() {
		window.removeEventListener('resize', this.listener);
	}

	setMode(mode) {
		this.setState({
			mode: mode ? mode.toLowerCase() : null
		});
	}

	get mode() {
		return this.state.mode || "demo";
	}

	get source() {
		if (this.state.demo >= 0) {
			return this.state.demos.source[this.state.demos.components[this.state.demo].sourceKey];
		} else {
			return null;
		}
	}

	render() {
		let demos = null;
		let demo = null;
		let Component = null;
		if (this.state.demos) {
			demos = Seq(this.state.demos.components).toIndexedSeq();
			if (this.state.demo !== -1) {
				demo = demos.get(this.state.demo);
				Component = demo.Component;
			}
		}

		const noDemo = <div className="none-selected">No demo selected.</div>;

		return (<div className="ui-test-app">
			<div id="downloader"></div>
			<div className="selector">
				<h2>Demo:</h2>
				<div className="view-select">
					View:&nbsp;<BasicOptions options={["Demo", "Source Code"]} onChange={this.setMode.bind(this)} />
				</div>
				<ul className="list">
					{demos ? demos.map((info, key) => <li key={key} onClick={() => this.setState({ demo: key })} className={this.state.demo == key ? "selected" : ""}>{info.title}</li>) : <li>Loading...</li>}
				</ul>
			</div>
			<div className="demo" ref={this.demoBox}>
				{this.mode === "demo" ? <ErrorBoundary>{Component ? <Component view={this.state.layout} /> : noDemo}</ErrorBoundary>
					: (this.source ? <pre>{this.source}</pre> : noDemo)}
			</div>
		</div>);
	}
}

export default Content;