import React from 'react';
import { connect } from 'react-redux';
import { format } from "date-fns";
import { openModal, hideModal } from "../../components/Modal/actions";
import Application from "../../application";


const mapStateToProps = () => ({})

const mapDispatchToProps = dispatch => ({
	openModal: (type, props) =>
	dispatch(openModal(type, props)),
	hideModal: () => dispatch(hideModal())
});

const Content = {
	construct: state => connect(mapStateToProps, mapDispatchToProps)(
		class extends React.Component {
			render() {
				const { model, cc } = this.props;
				const modelId = model.top.Persisted;
				const modelTop = model.top;
				return (
					<div id="gen-button-wrapper">
						<button onClick={() => {
							this.props.openModal('GenerateStudentReport', {
								title: 'Generate Student Report',
								modelID: modelId,
								downloadUrlParams: {
									course: cc.state.course || '',
									isPublic: modelTop.isPublic? 1 : 0,
									for_domain: `${Application.domain}`,
								},
							})
						}}>
							Download Excel File
						</button>
					</div>
				)
			}
		}
	)
}

export { Content };

export default {
	name: 'Download Student Report',
	Actions: {},
	Content,
	domains: ['teaching','learning']
}
