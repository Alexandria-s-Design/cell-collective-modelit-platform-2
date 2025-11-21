import React from 'react';
import {Seq, Map} from 'immutable';
import { TransitionGroup } from 'react-transition-group';
import Utils from '../../utils';
import Selectable from '../../mixin/selectable';
import Animate from '../../mixin/animate';
import TransitionItem from '../base/transitionItem';

export default class Slider extends React.Component{
    static defaultProps = { minWidth: 260 }
    constructor(props){
      super(props);
			this.state = Seq(this.state || {}).concat({position: 0}).toObject();
			this.marked = [];
    }
    getSize(props) {
        return Utils.range(Math.floor((props.parentWidth - 12) / props.minWidth), 1, 10);
    }
    getPosition(props, dir) {
        const size = this.getSize(props);
        return Utils.range(Math.floor(this.state.position) + dir * size, 0, props.data.count() - size);
    }
    move(dir) {
        this.refs.animate.animate({
            from: this.state,
            to: { position: this.getPosition(this.props, dir) },
            step: e => this.setState(e)
        });
    }
    UNSAFE_componentWillReceiveProps(props) {
        if (props.parentWidth !== this.props.parentWidth) {
            const p = this.getPosition(props, 0);
            p !== this.state.position && this.setState({ position: p });
        }
		}
		
		// componentShouldUpdate(props) {
		// 	return props.data != this.props.data;
		// }

    render() {
        const props = this.props;
        const { data, title, card, cardProps: cp, selected, references: _references } = props;
        const c = data.count();
        const n = this.getSize(props);
        const p = this.state.position;
				const b = p - p % n;


				const references = _references || new Map();
				
				const markedForLoad = [];

				const NULL_CARD_DATA = {
					parent: { id: -1 },
					id: -1,
					path: null,
					type: null,
					_loading: true,
					created: new Date(),
					updated: new Date(),
					modelType: null,
					top: {
						name: "Loading"
					},
					permissions: {
						view: true,
						edit: false,
						delete: false,
						share: false,
						publish: false
					}
				};

        const content = (
          <Selectable>
              <Animate ref='animate'>
                  <div className="slider">
                      {title && (<input className="no-hover" type="button" value={title} onClick={props.onClick}/>)}
                      <div>
                          <div className={"cards row-" + n} style={{ marginLeft: Utils.toPercent(-((p / n) % 1)) }}>
                              <TransitionGroup key={b + n}>
                                  {data.slice(b, b + 2*n).map((e, idx) => {
																		if( e == null ) {
																			e = { sub: () => NULL_CARD_DATA };
																		}
																		let ref;
																		if( e.path != null ) {
																			ref = references.getIn(e.path);
																		} else {
																			ref = null;
																			if( !this.marked.includes(b + idx) ) {
																				this.marked.push(b + idx);
																				markedForLoad.push(b + idx);
																			}
																		}
																		cp.data = e.sub();
																		cp.reference = ref;
																		return (
                                      <TransitionItem key={e.id || idx}>
                                          <div className={Utils.css("card", e === selected && "selected")}>
                                              <div>
                                                  <div className="frame slider-models">
                                                      {React.createElement(card, cp)}
                                                  </div>
                                              </div>
                                          </div>
                                      </TransitionItem>
                                  )}).toArray()}
                              </TransitionGroup>
                          </div>
                      </div>
                      {c > n && (<input type="button" className="icon base-left" onClick={this.move.bind(this, -1)} disabled={Utils.enabled(Math.floor(p))}/>)}
                      {c > n && (<input type="button" className="icon base-right" onClick={this.move.bind(this, 1)} disabled={Utils.enabled(Math.ceil(p) + n < c)}/>)}
                  </div>
              </Animate>
          </Selectable>
				);

				if( markedForLoad.length > 0 ) {
					const rangeMin = Math.min(...markedForLoad);
					const rangeMax = Math.max(...markedForLoad);
					props.load && props.load(rangeMin, rangeMax);
				}
				
				return content;
    }
}
