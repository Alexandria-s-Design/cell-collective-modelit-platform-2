import React from 'react'
import ArrayInput from './inputs/ArrayInput'
import { FormattedMessage } from 'react-intl'

import view from '../base/view'

class Content extends React.Component {
	constructor(props) {
		super(props)
		this.state = { error: null }
		this.onCreate = this.onCreate.bind(this)
		this.onKeyDown = this.onKeyDown.bind(this)
		this.onClose = props.onClose
	}

	onKeyDown(e) {
		if (e.key === 'Enter') {
			e.preventDefault()
			return false
		}
	}

	onCreate(e) {
		e.preventDefault()
		this.props.onSubmitPromise(
			'api/institution/create',
			this,
			e,
			async res => {
				if(res.status == 201) {
					alert("Institution created successfully")
					this.onClose()
				}
				return res
			},
			err => {
				const jsErr = err
				console.log(err)
				const nodeErr = (err.response.data.error && err.response.data.error.errors.map(e => e.message).join(' | ')) || null
				const javaErr = err.response.data
				this.setState({ error: nodeErr || javaErr || jsErr })
			},
		)
	}

	render() {
		return (
			<form className="row-2" onSubmit={this.onCreate} onKeyDown={this.onKeyDown}>
				<FormattedMessage id="DashBoard.InstitutionModal.Name" defaultMessage="Institution Name">
					{x => <input type="text" name="name" placeholder={x} tabIndex="1" />}
				</FormattedMessage>

				<FormattedMessage id="DashBoard.InstitutionModal.Category" defaultMessage="Category">
					{x => <input type="text" name="category" placeholder={x} tabIndex="2" />}
				</FormattedMessage>

				<FormattedMessage id="DashBoard.InstitutionModal.City" defaultMessage="City">
					{x => <input type="text" name="city" placeholder={x} tabIndex="3" />}
				</FormattedMessage>

				<FormattedMessage id="DashBoard.InstitutionModal.Country" defaultMessage="Country">
					{x => <input type="text" name="country" placeholder={x} tabIndex="4" />}
				</FormattedMessage>

				<FormattedMessage id="DashBoard.InstitutionModal.State" defaultMessage="State">
					{x => <input type="text" name="state" placeholder={x} tabIndex="5" />}
				</FormattedMessage>

				<FormattedMessage id="DashBoard.InstitutionModal.Domains" defaultMessage="Domains">
					{x => <ArrayInput type="text" name="domains" placeholder={x} tabIndex="6" />}
				</FormattedMessage>

				<FormattedMessage id="DashBoard.InstitutionModal.Websites" defaultMessage="Websites">
					{x => <ArrayInput type="text" name="websites" placeholder={x} tabIndex="7" />}
				</FormattedMessage>

				{this.state.error ? <div className="error">{this.state.error}</div> : null}

				<FormattedMessage id="DashBoard.InstitutionModal.Create" defaultMessage="Create">
					{x => (
						<button style={{
							"padding": "10px",
							"borderColor": "#fff",
							"borderRadius": "5px",
							"marginTop": "10px",
							"marginBottom": "10px",
							"backgroundColor": "#E67E22",
							"color": "#fff",
							"width": "100%"
						}} type="submit" >
							{x}
						</button>
					)}
				</FormattedMessage>
			</form>
		)
	}
}

const e = view(Content)
e.width = 472
e.height = 360

export default e