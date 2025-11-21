import React from 'react';
import {Seq} from 'immutable';
import { TransitionGroup } from 'react-transition-group';
import Utils from '../../utils';
import Selectable from '../../mixin/selectable';
import TransitionItem from '../base/transitionItem';

export default class extends React.Component{
    static defaultProps = {
        minWidth: 260,
        transitionProps: {}
    }
    constructor(...args) {
        super(...args);
				this.state = Seq(this.state || {}).concat({position: this.getPosition(this.props)}).toObject();
				this.marked = [];
    }
    getRow(props) {
        return Utils.range(Math.floor(props.parentWidth / props.minWidth), 1, 10);
    }
    getPosition(props) {
        const n = this.getRow(props);
        return (Math.ceil(props.end / (props.parentWidth / n + props.fixedHeight)) + 2) * n;
    }
    UNSAFE_componentWillReceiveProps(props) {
        this.setState({ position: Math.max(this.state.position, this.getPosition(props)) });
    }
    render() {
				const props = this.props;
        const { data, card, cardProps: cp, transitionProps, selected, references: _references } = props;
        const n = this.getRow(props);
        const p = this.state.position;
				let i = 0;

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

				let remoteIdx = 0; /* 
				used to track the index of models which are known to exist remotely (whether loaded or not)
													this is necessary to make sure the correct indices are marked for loading (local unsaved models
													shift the indices and cause the incorrect range to be marked for loading)
				*/

        const content = (
            <Selectable>
                <div className={"grid cards row-" + n}>
                    <TransitionGroup>
                        {data.map((e,k) => {
													const idx = k;

													if( e == null ) {
														e = { sub: () => NULL_CARD_DATA };
													}
													let ref;

													const prevIdx = remoteIdx;

													if( e.path != null ) {
														ref = references.getIn(e.path);
														if( parseInt(ref.get("id") ) >= 0 ) remoteIdx++; // ignore local temp models :)
													} else {
														ref = null;
														remoteIdx++;
													}

													if(i < p){
														if( !this.marked.includes(prevIdx) ) {
															this.marked.push(prevIdx);
															markedForLoad.push(prevIdx);
														}
													}


													cp.data = e && e.sub ? e.sub() : e;
													if( cp.data == undefined ) return null; // some model subs return undefined :/
													cp.reference = ref;
                          return (<TransitionItem key={k} {...transitionProps}>
                                <div className={Utils.css("card", e === selected && "selected")}>
                                    <div>
                                        {i++ < p && (
																					<div className="frame grid-models">
																							{React.createElement(card, cp)}
																					</div>
                                        )}
                                    </div>
                                </div>
                            </TransitionItem>
                        ) } ).toArray()}
                    </TransitionGroup>
                </div>
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
