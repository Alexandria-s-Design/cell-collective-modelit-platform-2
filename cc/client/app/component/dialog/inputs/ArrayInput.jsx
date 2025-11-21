import React from 'react'
import { last, omit } from 'lodash'

const inputStyles = {
	position: "initial",
	verticalAlign: "middle",
	height: "16px",
	width: "16px",
	backgroundImage: "url(/assets/images/icons/base/close.png)",
	backgroundColor: "#888888",
}

class Chip extends React.Component {
	constructor(props) {
		super(props)
		this.value = props.value
		this.inputName = props.inputName
		this.onRemove = props.onRemove
		this.idx = props.idx
	}
	render() {
		return (
			<div>
				<input type="hidden" name={`${this.inputName}[${this.idx}]`} value={this.value} />
				<>
					{`${this.value} `}
				</>
				<input
					type="button"
					style={inputStyles}
					onClick={this.onRemove}
				/>
				<br />
			</div>
		)
	}
}

class ArrayInput extends React.Component {
	constructor(props) {
		super(props)
		this.state = { formValues: [""] }
		this.inputName = props.name
		this.props = props
		this.formChange = this.formChange.bind(this)
		this.onInputRemove = this.onInputRemove.bind(this)
		this.keyDown = this.keyDown.bind(this)
	}

	formChange(e) {
		const values = this.state.formValues
		values[values.length - 1] = e.target.value
		this.setState({ formValues: values })
	}

	onInputRemove(idx) {
		return () => {
			const values = [...this.state.formValues]
			values.splice(idx, 1)
			this.setState({ formValues: values })
		}
	}

	keyDown(e) {
		if (e.key === 'Enter' || e.key === ',') {
			this.state.formValues.push("")
			this.setState({ formValues: this.state.formValues })
			e.preventDefault()
		}
	}

	render() {
		return (
			<div>
				<input
					{...omit(this.props, 'name')}
					style={{ width: "100%" }}
					value={last(this.state.formValues)}
					onChange={this.formChange}
					onKeyDown={this.keyDown}
					title="Press Enter or , to add multiple values."
				/>
				<>
					{this.state.formValues.slice(0, -1).map((val, idx) =>
						<Chip
							key={`${val}-${idx}`}
							inputName={this.inputName}
							value={val}
							idx={idx}
							onRemove={this.onInputRemove(idx)}
						/>
					)}
				</>
			</div>
		)
	}
}

export default ArrayInput
