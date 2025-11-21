import React from 'react';

// TODO: Extract ErrorBoundary to separate file, use other places as well?
class ErrorBoundary extends React.Component {
	constructor(props){
		super(props);
		this.state = { 'error': null }
	}

	static getDerivedStateFromError(error){
		return { 'error': "An error occurred while loading this panel." };
	}

	render(){
		if( this.state.error ){
			return <span color="red">{this.state.error.toString()}</span>;
		}

        return this.props.children
	}
}

export default ErrorBoundary;