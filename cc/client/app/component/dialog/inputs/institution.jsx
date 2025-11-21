import React from 'react'
import { FormattedMessage } from 'react-intl'
import Institution from '../institution'

import DropdownText from '../../base/dropdownText'

import request from '../../../request'
import { CCContextConsumer } from '../../../containers/Application'

// A Queue which accepts a series of similar asynchronous tasks,
// and when it completes one, it skips the others and executes the
// last one in the queue at the time. This is useful for searching,
// since searches take time: it allows a potential search to be queued
// with each keystroke, but once the current request finishes, all the
// searches that have been made obselete by later keystrokes will be ignored.
// This optimizes both front- and back-end performance.
class SkipQueue {
	constructor() {
		this.current = null
		this.next = null
		this.processing = false
	}
	push(task) {
		if (this.current === null) {
			this.current = task
			this._run()
		} else {
			this.next = task
		}
	}
	_run() {
		// current() should return a promise
		this.current().then(() => {
			this.current = this.next
			this.next = null
			if (this.current !== null) {
				this._run()
			}
		})
	}
}


export default class InstitutionInput extends React.Component {
	constructor(props) {
		super(props)
		this.state = {}
		this._keyQueue = new SkipQueue()
	}
	async getMatches(query) {
		if (query === '') {
			// show no choices
			this.setState({ choices: [] })
			return
		}

		const { data } = await request.get('/api/institution/search', { params: { q: query } })
		let ret = data.data.data

		ret = ret.map(e => e.name)
		ret.sort()
		this.setState({
			choices: ret
		})
	}

	queueSearch(event) {
		const searchQuery = event.target.value
		const job = this.getMatches.bind(this, searchQuery)
		job.debug = searchQuery
		this._keyQueue.push(job)
	}

	render() {
		return (
			<div
				style={{
					width: "100%",
					display: "flex",
					flexDirection: "row",
					justifyContent: "space-between",
				}}
			>
				<FormattedMessage id="ModelDashBoard.SignUpModal.LabelInstitution" defaultMessage="Institution">
					{x => <DropdownText name="institution" placeholder={x} tabIndex="6" onChange={this.queueSearch.bind(this)} defaultValue={this.props.defaultValue} className={this.props.className} choices={this.state.choices} />}
				</FormattedMessage>
				<CCContextConsumer>
					{({ cc }) => (
						<FormattedMessage id="ModelDashBoard.SignUpModal.LabelCreateInstitution" defaultMessage="Create new institution">
							{x =>
								<button
									style={{
										background: "grey",
										borderColor: "#fff",
										marginTop: "10px",
										borderRadius: "5px",
										color: "white",
										padding: "5px",
										fontSize: "12px"
									}}
									type="button"
									onClick={() => cc.showDialog(Institution, {
										onSubmit: async (ent) => {
											this.closeDialog()
										},
										action: () => { },
										forgotPassword: () => { }
									})}
									className="btn btn-primary"
								>
									{x}
								</button>
							}
						</FormattedMessage>
					)}
				</CCContextConsumer>
			</div >
		)
	}
}

