import React from 'react';
import Utils from '../../utils';

class Content extends React.Component {
    constructor(props) {
        super(props);
				this.content = React.createRef();
				this.state = {
					showing: props.showing || false,
					height: 0,
					measured: false
				}
    }

		_update() {
			const height = this.content.current.getBoundingClientRect().height;
			if (height !== this.state.height) {
				this.setState({
					height
				}, () => {
					!this.state.measured && this.setState({ measured: true });
				});
			}
		}

		componentDidMount() {
			this.setState({
				showing: this.props.showing || false,
				measured: false
			});

			this._update();
		}

		componentDidUpdate() {
			this._update();
		}

    render() {
        const { show, hide, className, arrow } = this.props;
        return (
            <div className={className ? "collapsible-pane " + className : "collapsible-pane"}>
                <div className={ this.state.showing ? "toggle" : "toggle hidden" } onClick={_ => {
                    const new_val = !this.state.showing;
                    this.setState({ showing: new_val });
                    this.props.onChange && this.props.onChange(new_val);
                }}>{ this.state.showing ? (hide || 'Hide') : (show || 'Show') }&nbsp;<span>{arrow ? arrow(this.state.showing) : null}</span></div>
                <div className={Utils.css("content-wrapper", !this.state.showing && "hidden", this.state.measured && "measured")} style={{'height': this.state.showing ? this.state.height + 10 : 0}}>
                    <div className={Utils.css("content", !this.state.showing && "hidden")} ref={this.content}>
                        {this.props.children}
                    </div>
                </div>
            </div>
        );
    }
}

Content.defaultProps = {
	arrow: (showing) => { return showing ? '<<<' : '>>>' }
}

export default Content;