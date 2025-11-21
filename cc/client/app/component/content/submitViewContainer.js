import Content from './submitButtonView'
import { connect } from 'react-redux'

function mapStateToProps(state) {
	return {
		checkComplete: state.checkComplete
	}
}
export default connect(mapStateToProps)(Content);