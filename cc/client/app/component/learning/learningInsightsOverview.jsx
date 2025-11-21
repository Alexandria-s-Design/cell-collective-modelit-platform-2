import React from 'react';
import { format as formatDate } from "date-fns";
import { Seq } from 'immutable';

import Editable from "../base/editable";
import Table from "../base/table";
import Panel from "../base/panel";
import { PanelFlow, HeightFunctions } from "../base/panelLayout";
import request from "../../request";
import Message from "../dialog/message";
import Confirm from "../dialog/confirmation";
import Progress from "../dialog/progress";
import FileInput from "../base/fileInput";

import BasicOptions from "../base/basicOptions";

import { exclude } from '../../util/object';

const PER_ROW = 4;

const generateTable = (total, marked) => {
	const rows = [];
	for (let i = 0; i < Math.ceil(total / PER_ROW); i++) {
		const cells = [];
		for (let j = 0; j < PER_ROW; j++) {
			const pos = ((i * PER_ROW) + j) + 1;
			if (pos <= marked) {
				cells.push(<td className="marked"></td>);
			} else if (pos <= total) {
				cells.push(<td className="unmarked"></td>);
			} else {
				cells.push(<td className="empty"></td>);
			}
		}
		rows.push(<tr>{cells}</tr>);
	}
	return (<table>
		<tbody>
			{rows}
		</tbody>
	</table>);
};

const formatTheDate = function (dateStr) {
	try { return dateStr ? formatDate(new Date(dateStr), "MM-dd-yyyy H:mm:ss") : null; }
	catch (err){} 
}

class Content extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			course: props.cc.state.course,
			students: 40,
			insights: null,
			matching: null,
			details: null,
			email: {
				accessed: false,
				started: false,
				completed: false,

				all: false
			},
			offsets: [0, 0]
		};

		this.props.view.setState({
			roster: null
		});
	}

	componentDidMount() {
		const { model } = this.props;
		if (model.top.id < 0) return;

		if (!this.state.insights) {
			this.loadInsights();
		}		
	}

	loadInsights(reload = false) {
		const { model, view, cc } = this.props;

		const doLoad = () => request.get(`/api/course/insights/${model.top.id}?forCourse=${this.state.course}`).then(res => {
			const data = res.data.data;

			const newViewState = { courseId: data.course };
			if (data.roster !== null) {
				newViewState.roster = data.roster;
			}

			// calculate access dates
			const accessDates = {};
			let idx = 0;
			for (const dateCategory of [data.accessedCourse, data.startedLesson, data.completedLesson]) {
				for (const entry of dateCategory) {
					if (entry.user in accessDates) {
						accessDates[entry.user][idx] = entry.date;
					} else {
						const initial = [null, null, null];
						initial[idx] = entry.date;
						accessDates[entry.user] = initial;
					}
				}
				idx++;
			}

			data.accessDates = accessDates;

			this.setState({ insights: data });
			//view.setState(newViewState);
		}).catch(err => {
			const status = err.response.status;
			let hasError = true;
			if (status === 403) {
				cc.showDialog(Message, {
					message: 'You are not authorized to view insights for this lesson on this course.',
					onSubmit: () => {
						cc.routerHome();
						cc.closeDialog();
					}
				});
			} else if (status === 422) {
				cc.showDialog(Message, {
					message: 'Please view this lesson through a course in order to view insights.',
					onSubmit: () => {
						cc.routerHome();
						cc.closeDialog();
					}
				});
			} else if (status < 400) {
				hasError = false;
			}
			this.setState({
				error: hasError
			});
		});

		if (reload) {
			this.setState({ insights: null, roster: null }, doLoad);
		} else {
			doLoad();
		}
	}

	componentDidUpdate() {
		const { view } = this.props;
		if (view.getState().roster !== this.state.roster) {
			if (view.getState().roster !== null) {
				const roster = view.getState().roster;

				this.setState({
					roster,
					students: roster.length
				});
			} else {
				this.setState({
					roster: null,
					students: 40
				});
				this.loadInsights(true);
			}
		}

		if (view.getState().reload === true) {
			this.loadInsights(true);
			view.setState({
				reload: false
			});
		}
	}

	sendEmails() {
		const { cc, model } = this.props;
		
		cc.showDialog(Progress, { waitMessage: "Sending all e-mails..."});
		setTimeout(function() {
			cc.closeDialog();
		}, 20000);
		const data = exclude(this.state.email, 'Sending all');
		data.forCourse = this.state.course;

		request.post(`/api/course/remind/${model.top.id}`, data).then(res => {
			const message = res.data.data.message;
			cc.showDialog(Message, { message });
		}).catch(err => {
			cc.closeDialog();
			cc.showDialog(Message, { message: err.response.data.error.errors[0].message });
		});
	}

	render() {
		const { view, model, cc } = this.props;

		if (model.top.id < 0) {
			return (<div className="insightsUnavailable">
        This model is not saved into the system. Please save it and reload this panel to view insights.
      </div>);
		}

		if (this.state.error) {
			return <div></div>;
		}

		const data = this.state.insights;
		const content = [null, null, null];
		let canModifyStudents = true;

		if (data !== null) {
			const totalBlocks = Math.min(40, this.state.students);
			const accessedCourseBlocks = Math.floor((data.accessedCourse.length / this.state.students) * totalBlocks);
			const startedLessonBlocks = Math.floor((data.startedLesson.length / this.state.students) * totalBlocks);
			const completedLessonBlocks = Math.floor((data.completedLesson.length / this.state.students) * totalBlocks);

			content[0] = generateTable(totalBlocks, accessedCourseBlocks);
			content[1] = generateTable(totalBlocks, startedLessonBlocks);
			content[2] = generateTable(totalBlocks, completedLessonBlocks);

			canModifyStudents = data.roster === null && (view.getState().roster === null);
		}

		const emailTargetToggle = (key) => {
			const newState = {};
			newState.email = this.state.email;
			newState.email[key] = !newState.email[key];
			this.setState(newState);
		};

		const emailAllToggle = () => {
			if (this.state.email.all) {
				this.setState({
					email: {
						accessed: false,
						started: false,
						completed: false,
						
						all: false
					}
				});
			} else {
				this.setState({
					email: {
						accessed: true,
						started: true,
						completed: true,

						all: true
					}
				});
			}
		};

		const match = (key, value) => {
			const user = Seq(this.state.roster).filter(e => e['Email Address'] === key).first();
			if (user) {
				cc.showDialog(Confirm, {
				message: `Are you sure you want to match ${user['First Name']} ${user['Last Name']} to CellCollective user ${value}?`,
				okText: 'Yes',
				cancelText: 'No',
				action: () => {
					request.post(`/api/course/roster/match/${this.state.insights.course}`, {
						unmatched: key,
						matchTo: value
					}).then(() => {
						cc.showDialog(Message, { message: "Successfully matched roster student to CellCollective profile." });
						this.loadInsights(true);
					}).catch(err => {
						cc.showDialog(Message, { message: err.response.data.error.errors[0].message });
					});
				}
				});
			}
		};

		const accessDatesFor = (function (email) { return (this.state.insights !== null && email in this.state.insights.accessDates) ?
			this.state.insights.accessDates[email].map(entry => formatTheDate(entry)) : [null, null, null] }).bind(this); 

		const accessCourse = (this.state.insights && this.state.insights.accessedCourse && this.state.insights.length) && this.state.insights.accessedCourse[0].courseTitle;

		return (<PanelFlow view={view} scrollable={true}>
				<Panel className="insightsOverview">
					<div className="students">
						Students in class:&nbsp;<Editable value={this.state.students} onEdit={(!canModifyStudents) ? null : (val) => {
						const num = parseInt(val);
							if (!isNaN(num) && num > 0) {
								this.setState({
									students: num
								});
							}
						}} />
					</div>
					<div className="blocks">
						<div className="accessedCourse">
							{content[0]}
							<br />
							<h2>Accessed your course</h2>
							{accessCourse && (<h4>{accessCourse}</h4>)}
						</div>
						<div className="startedLesson">
							{content[1]}
							<br />
							<h2>Started this lesson</h2>
						</div>
						<div className="completedLesson">
							{content[2]}
							<br />
							<h2>Completed this lesson</h2>
						</div>
					</div>
					<hr />
					<div className="email">
						<div className="emailType">
							Send reminders to students that haven&apos;t:
							<br />
							<br />
							<ul className="checkboxes">
								<li>accessed your course&nbsp;<input type="checkbox" checked={this.state.email.accessed} disabled={this.state.email.all} onChange={emailTargetToggle.bind(this, "accessed")} /></li>
								<li>started the lesson&nbsp;<input type="checkbox" checked={this.state.email.started} disabled={this.state.email.all} onChange={emailTargetToggle.bind(this, "started")} /></li>
								<li>completed the lesson&nbsp;<input type="checkbox" checked={this.state.email.completed} disabled={this.state.email.all} onChange={emailTargetToggle.bind(this, "completed")} /></li>
								<hr />
								<li>select all&nbsp;<input type="checkbox" checked={this.state.email.all} onChange={emailAllToggle.bind(this)} /></li>
							</ul>
							<button className="send-email" disabled={!(this.state.email.accessed || this.state.email.started || this.state.email.completed)} onClick={this.sendEmails.bind(this)}>Send</button>
						</div>
						<div className="emailPreview">
							{(this.state.email.accessed || this.state.email.started || this.state.email.completed) ? <>
								<p>
									Dear {"{Student First Name, Last Name}"},
								</p>
								<br />
								<p>
									Your instructor requests that you please do the following:
									<br />
									<ul>
										{this.state.email.accessed ? <li>Access their course</li> : null}
										{this.state.email.started ? <li>Start your lesson</li> : null}
										{this.state.email.completed ? <li>Complete your lesson</li> : null}
									</ul>
									<br />
								</p>
								<p>
									Best regards,
									<br />
									The CellCollective Team on behalf of your instructor, {"{First Name, Last Name}"}
								</p>
								</> : null
							}
						</div>
					</div>
					<hr />
				</Panel>
				{this.state.insights && this.state.insights.accessedCourse ?
					<Panel className="stats">
						<PanelFlow view={view} spacing={5}>
							<Panel>
								<h2>Students that have accessed this course</h2>
							</Panel>
							<Panel innerHeight={HeightFunctions.TableHeight(10)}>
								<Table
									references={[this.state.insights.accessedCourse]}
									data={Seq(this.state.insights.accessedCourse).map(entry => entry.profile)}
									columns={[
										{ get: 'firstname', label: 'First Name', style: "center" },
										{ get: 'lastname', label: 'Last Name', style: "center" },
										{ get: 'email', label: 'CellCollective Email Address', style: "center" },
										{ get: e => accessDatesFor(e.email)[0], label: 'Course Access Date', style: "center" },
										{ get: e => accessDatesFor(e.email)[1], label: 'Lesson Start Date', style: "center" },
										{ get: e => accessDatesFor(e.email)[2], label: 'Lesson Complete Date', style: "center" }
									]}
								/>
							</Panel>
							{this.state.insights !== null && this.state.insights.nonjoined.length > 0 ? <>
								<Panel top={15}>
									<h2>Unmatched Roster Entries</h2>
								</Panel>
								<Panel innerHeight={HeightFunctions.TableHeight(10)}>
									<Table
										references={[this.state.insights.nonjoined]}
										data={Seq(this.state.insights.nonjoined)}
										columns = {[
											{ get: 'First Name', label: 'First Name', style: "center" },
											{ get: 'Last Name', label: 'Last Name', style: "center" },
											{ get: 'Email Address', label: 'Email Address', style: "center" },
											{ get: 'potential_matches', label: 'Match to CellCollective E-mail', format: e => <BasicOptions options={e.potential_matches}
												onChange={match.bind(this, e['Email Address'])} /> }
										]}
										/>
								</Panel>
								</> : null}
						</PanelFlow>
					</Panel>
				: null}
			</PanelFlow>);
	}
}

const Actions = props => {
	const { view, cc } = props;
	const showDialog = cc.showDialog.bind(cc);
	return !view.getState().roster ? {
		upload: !view.getState().uploading ? {
			title: "Upload Class Roster",
			helperText : "Upload your class roster here",
			type: FileInput,
			ext: ".csv",
			onChange: async (file) => {
				const postData = new FormData();
				postData.append("roster", file[0]);

				view.setState({
					uploading: true
				});

				request.post(`/api/course/roster/${view.getState().courseId}`,  postData, {
					headers: {
						'Content-type': 'multipart/form-data'
					}
				}).then(res => {
					const data = res.data.data;
					showDialog(Message, { message: data.message });
					view.setState({
						roster: data.roster,
						reload: true,
						uploading: false
					});
				}).catch(err => {
					showDialog(Message, { message: err.response.data.error.errors[0].message });
					view.setState({
						uploading: false
					});
				});
			}
		} : false,
		download: {
			title: 'Download Roster Template',
			action: () => {
				const content = 'data:text/plain;name=sample_roster.csv;charset=utf8,' + encodeURIComponent('First Name,Last Name,Email Address\nSample,Student,student@example.com');
				const a = document.createElement('a');
				a.href = content;
				a.download = 'sample_roster.csv';
				a.click();
			}
		}
	} : {
		trash: !view.getState().deleting ? {
			title: "Remove Roster",
			action: () => {
				showDialog(Confirm, {
					message: 'Are you sure you want to delete the currently uploaded roster?',
					okText: 'Yes',
					cancelText: 'No',
					action: () => {
						view.setState({
							deleting: true
						});
						request.delete(`/api/course/roster/${view.getState().courseId}`).then(_ => {
							view.setState({
								roster: null,
								deleting: false
							})
						}).catch(err => {
							showDialog(Message, { message: err.response.data.error.errors[0].message });
							view.setState({
								deleting: false
							});
						});
					}
				});
			}
		} : false
	};
};

export default {
	name: 'Overview',
	Actions,
	Content,
	domains: ['teaching']
};