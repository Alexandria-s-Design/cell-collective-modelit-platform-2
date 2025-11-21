import React from 'react';
import { Seq } from 'immutable';
import Utils from '../../utils';
import Persist from '../../mixin/persist';
import Editable from './editable';
import { FormattedMessage } from 'react-intl'

const persist = Persist({history: null});

export default persist( class extends Utils.MyComponent{
    static defaultProps = {
        maxHistory: 10
    }
    getInitState(){
        return { history: [] };
    }
    onChange(value) {
        if (value) {
            const history = this.state.history.slice();
            const v = value.toLowerCase();
            const i = Seq(history).findIndex(e => e.toLowerCase() === v);
            i > 0 ? history.splice(i, 1) : i < 0 && history.length === this.props.maxHistory && history.pop();
            i && history.unshift(value);
            this.setState({ history: history });
        }
        this.props.onChange(value);
    }
    shouldComponentUpdate(props, state) {
        return this.props.value !== props.value || this.props.data !== props.data || this.state.showHistory !== state.showHistory || this.props.parentWidth !== props.parentWidth;
    }
    render() {
        const { value, data, property, parentWidth } = this.props;
        const sh = e => this.setState({ showHistory: e });
        return (
            <div className="search menu">
                <input type="button" className="icon base-search"/>
                <input type="button" className="icon base-menu" disabled={Utils.enabled(this.state.history.length)} onClick={() => sh(!this.state.showHistory)} onBlur={sh.bind(this, false)}/>
                {this.state.showHistory && (<ul className="ul">{this.state.history.map(e => (<li key={e}><div onMouseDown={this.onChange.bind(this, e)}>{e}</div></li>))}</ul>)}
                <FormattedMessage id="ModelDashBoard.TableSearch.LabelSearch" defaultMessage="Search">
                    {x => <Editable
                        value={value}
                        values={data.map(e => e[property]).valueSeq()}
                        placeHolder={x}
                        onEdit={this.onChange.bind(this)}
                        clear="true"
                        maxWidth={parentWidth - 57}/>
                    }
                </FormattedMessage>
             </div>
        );
    }
});