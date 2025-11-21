import React from 'react';

class ErrorBoundary extends React.Component {
	constructor (props){
		super (props);
		this.state = { 'error': null, 'info': null }
	}

	componentDidCatch () {
		this.setState({
			'error': 'An error occurred while loading this panel.'
		});
	}

	componentDidUpdate(prevProps, prevState) {
		if (this.props !== prevProps) {
			this.setState({
				'error': null
			})
		}
	}

	render ( ) {
		if( this.state.error ){
			let classes = "error-boundary";
			
			if( this.props.errorClass )
				{classes += ` ${this.props.errorClass}`;}

			let content = this.state.error.toString();

			if ( this.state.info ) {
				content = <React.Fragment>{content}<br />{this.state.info.componentStack.split('\n').reduce((total, cur, idx) => {
					if( idx != 0 ){
						total.push(<br />);
					}
					total.push(cur);
					return total;
				}, [])}</React.Fragment>;
			}
			return <div className={classes}>{content}</div>;
		}

		return this.props.children || null;
	}
}

export default ErrorBoundary;