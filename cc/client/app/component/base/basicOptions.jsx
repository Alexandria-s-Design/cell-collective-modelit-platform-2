import React from 'react';
import Options from './options';
import { Map } from 'immutable';

// A wrapper for the Options component to make it
// simple enough to use as a typical <select></select>
// HTML component.
class BasicOptions extends React.Component {
    constructor(props) {
        super(props);
    }

    UNSAFE_componentWillMount() {
        this.setState({ selection: null });
    }

    onChange(next, opt) {
        this.setState({ selection: opt });
        next(opt ? opt.key : null);
    }

    toOptions(options) {
        if( Array.isArray(options) ){
            options = options.reduce((prev, cur) => {
                const ret = prev;
                ret[cur] = cur;
                return ret;
            }, {});
        }

        return options;
    }
    
    render() {
        let { options, onChange, none, isScrollable, forcePosition } = this.props;

        options = this.toOptions(options);
    
        return <Options forcePosition={forcePosition} value={this.state.selection || null} options={Map(options).mapEntries(([k, v]) => { return [k, { key: k, value: v, id: k }] }).valueSeq()}
										get="value" onChange={this.onChange.bind(this, onChange)} none={none} isScrollable={isScrollable} />;
    }
}

BasicOptions.defaultProps = {
	isScrollable : false
}
export default BasicOptions;