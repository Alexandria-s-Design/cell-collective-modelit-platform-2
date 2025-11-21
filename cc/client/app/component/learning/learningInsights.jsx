import React from "react";
import view from "../base/view";
import Collapsible from "../base/collapsible";
import Scrollable from "../base/scrollable";
import Animate from '../../mixin/animate';
import { select } from 'd3-selection';
import request from '../../request';

import { Map, Seq } from 'immutable';

const CANVAS_SIZE = 150;
const RING_WIDTH = 20;
const BLUE1 = '#3498db';
const BLUE2 = '#2592db';

const LABEL_MAP = {
    "personal": "Your Score",
    "course": "Your Course",
    "institution": "Your Institution",
    "overall": "All Institutions"
};

const parseSubTitle = ({ onClick, value }) => ({ onClick, value });

/**
 * Attributes
 * format: Text at middle of circle
 * progress: Color of the achieved percentage
 * progressFont: Font style of the text at middle of circle
 * color: Color of the achieved percentage
 * titleStyle: Style of bottom title
 * helperText: Text below main text
 */
class ProgressDial extends React.Component {
    constructor(props){
        super(props);
    }

    UNSAFE_componentWillMount() {
        this.setState({
            currentProgress: 0,
            timePassed: 0
        });
    }

    componentDidMount() {
        if( this.props.loaded ) this.initialize();
        this.initDraw();
    }

    componentDidUpdate(prevProps) {
        const doInit = this.props.loaded && !prevProps.loaded;
        if( this.props.progress !== prevProps.progress ){
            this.setState({ currentProgress: 0, timePassed: 0 }, this.initialize);
        }else if( doInit ){
            this.initialize();
        }
    }

    initialize() {
        this.refs.animate.animate({
            from: {currentProgress: 0},
            to: {currentProgress: this.props.progress},
            step: s=> (this.props.progress > 0 &&	this.setState(s)),
            easing: 'easeInOutQuad',
            duration: 750
        }, 0);
    }

    reset() {
        if( this.state.currentProgress === this.props.progress ) this.setState({timePassed: 0, currentProgress: 0}, this.initialize);
    }

    _click() {
        this.props.onClick && this.props.onClick();
        this.reset();
    }

    _getEnd(progress) {
        const END = (360 * Math.min((this.props.loaded ? progress : 0) / 100, 0.999));
        const R = (CANVAS_SIZE / 2) - (RING_WIDTH / 2);

        return {
            x: (CANVAS_SIZE / 2) + R * Math.cos((END * Math.PI / 180.0) - Math.PI/2),
            y: (CANVAS_SIZE / 2) + R * Math.sin((END * Math.PI / 180.0) - Math.PI/2),
            largeArcFlag: (END <= 180) ? "0" : "1"
        }
    }

    draw( d3ref ) {
        const START_X = CANVAS_SIZE / 2;
        const START_Y = RING_WIDTH / 2;

        let z = '';
        if( this.state.currentProgress >= 99.9 ){
            z = ' z'; // indicates 'close path'. If we try to do an SVG arc from one point back to itself, the circle disappears entirely.
        }

        const R = (CANVAS_SIZE / 2) - (RING_WIDTH / 2);
				const strokeColor = this.props.color || BLUE1;

        const path = d3ref.select("path");
        path.attr("d", (datapoint => {
            const END = this._getEnd(datapoint);
            return `M ${END.x} ${END.y} A ${R} ${R} 0 ${END.largeArcFlag} 0 ${START_X} ${START_Y}${z}`
        }).bind(this)).attr('stroke', strokeColor)
            .attr('stroke-width', RING_WIDTH)
            .attr('fill-opacity', '0');

				const format = this.props.format || ((prog) => `${prog}%`);
				const font = this.props.progressFont || {};

				const textY = CANVAS_SIZE / 2 + Math.ceil((5 / (CANVAS_SIZE / 2)) * 100);
        const text = d3ref.select("text");
        text.html(`${this.props.loaded ? format(Math.round(this.props.progress)) : '...'}`)
            .attr("x", CANVAS_SIZE / 2)
            .attr("y", textY)
            .attr("fill", strokeColor || "black")
            .attr("text-anchor", "middle")
            .attr("alignment-baseline", "central")
            .attr("font-family", font.face || font.family || "Roboto")
            .attr("font-size", font.size || "36px");
			
			if (this.props.helperText && this.props.progress == this.state.currentProgress) {
				d3ref.append("text")
						.html(`${this.props.loaded ? this.props.helperText : ''}`)
						.attr("x", CANVAS_SIZE / 2)
						.attr("y", Math.ceil((textY * 2) - ((48/textY) * 100)))
						.attr("fill", "#666")
						.attr("text-anchor", "middle")
						.attr("alignment-baseline", "central")
						.attr("font-family", font.face || font.family || "Roboto")
						.attr("font-size", '12pt');
			}
    }

    initDraw() {
        const svg = select(this.refs.target)
            .style("width", CANVAS_SIZE)
            .style("height", CANVAS_SIZE);
        
        const g = svg.selectAll("g").data([this.state.currentProgress]).enter().append("g");

        g.append("circle")
            .attr("cx", (CANVAS_SIZE / 2))
            .attr("cy", (CANVAS_SIZE / 2))
            .attr("r", (CANVAS_SIZE / 2)-(RING_WIDTH / 2))
            .attr("stroke", "#d7d7d7")
            .attr("stroke-width", RING_WIDTH)
            .attr("fill", "white");
        g.append("path");
        g.append("text");
        this.draw(g);
    }

    redraw() {
        const g = select(this.refs.target).selectAll("g");
        g.data([this.state.currentProgress]).enter();
        this.draw(g);
    }
    
    render() {
        this.redraw();
        const style = 'maxWidth' in this.props ? {maxWidth: this.props.maxWidth} : null;
				const titleColor = 'titleColor' in this.props ? {color: this.props.titleColor} : {color: BLUE2};
				const subtitle = 'subtitle' in this.props && parseSubTitle(this.props.subtitle);
				const subtitleStyle = {color: '#777', fontSize: '9.2pt'}
				titleColor.marginBottom = '5px';
        return (
            <Animate ref="animate">
                <div className="progress" style={style} title={this.props.label || "Progress"}>
                    <svg className="progress" ref="target" style={{width:`${CANVAS_SIZE}px`}} />
                    <h1 className="progress-title" style={titleColor}><span>{this.props.label || "Progress"}</span></h1>
										{subtitle && <a style={subtitleStyle} href="javascript:;" onClick={subtitle.onClick.bind(this)} className="progress-subtitle">{subtitle.value}</a>}
                </div>
            </Animate>
        );
    }
}

ProgressDial.defaultProps = {
    loaded: true
}

const getScore = (objectiveList, objectiveId) => {
    for( let i = 0; i < objectiveList.length; i++ ){
        const obj = objectiveList[i];
        if( obj.id === objectiveId ){
            return obj.score;
        }
    }
    return 0;
};

class Content extends React.Component {
    constructor(props){
        super(props);
    }

    UNSAFE_componentWillMount(){
        const { model, model: { top: { id } } } = this.props;

        const iState = {progress: {"personal": null, "course": null, "institution": null, "overall": null}, loaded: false, scrollable: false};
        iState.progress["learning_objectives"] = Seq(Object.keys(model.mLearningObjective)).reduce((cur, item) => cur.set(item, {loading: true, progress: 0}), Map()).toJS();
        this.setState(iState);
        
        request.post(`/api/module/${id}/insights`).then(res => {
            const data = res.data.data;
            this.setState({progress: data.scores});
        });
    }

    componentDidMount(){
        const self = this;
        const init = () => {
            self.setState({loaded:true})
        };
        setTimeout( init, 1500 );
    }

    render() {
        const { model: entity, view } = this.props;
        const progmap = this.state.progress;

        const self = this;
        return (
            <Scrollable {...view} disabled={!this.state.scrollable} ref="scrollable">
                <div className="insights-dashboard-wrapper">
                    <div className="insights-dashboard">
                        <div>
                            {Object.keys(progmap).map(key => {
                                if( !(key in LABEL_MAP) ) return null;
                                const value = progmap[key];
                                return <ProgressDial progress={value || 0} loaded={value !== null} label={LABEL_MAP[key]} />;
                            })}
                        </div>
                        <Collapsible show="Show Details" hide="Hide Details" className="details" onChange={(showing) => {
                            if( !showing ){
                                this.refs.scrollable.scroll(0, () => {
                                    self.setState({ scrollable: false });
                                });
                            }else{
                                self.setState({ scrollable: true });
                            }
                        }}>
                            {Seq(Map(entity.mLearningObjective).map((v, k) => {
                                const title = v.value;
                                const prog = getScore(this.state.progress.learning_objectives, parseInt(k));

                                return <ProgressDial progress={prog} label={title} maxWidth={175} tooltip={true} />
                            })).toArray()}
                        </Collapsible>
                    </div>
                </div>
            </Scrollable>
        );
    }
}

export { ProgressDial };

export default view(Content);
