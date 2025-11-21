import React from 'react';
import { Seq } from 'immutable';
import Utils from '../../utils';
import ModelPersist from '../../mixin/modelpersist';
import Persist from '../../mixin/persist';
import Emitter from '../../mixin/emitter';
import Editable from './editable';
import Application from '../../application';
import viewsMessages from '../../viewsMessages';
import { getViewMessageKey } from '../../viewsMessages';
import { FormattedMessage } from "react-intl";
import ErrorBoundary from "./errorBoundary";

const getK = ({props: {persistGlobal}}) => ("VERSION[" + Application.version + "]" + persistGlobal);
const getA = (self) => (self.props.actions || {}).onLayoutViewChange;
const posConf = { left: null, top: null, width: null, height: null };
const mkUndef = (e) => (e ? e : undefined);

const mixins = [
	ModelPersist(
		posConf,
		(props) => props.layoutGetValue,
		(self) => getA(self),
        "model",
        null,
        [(v) => {
            return v;
        }]
    ),
	Persist(
		posConf,
		(_, self) => mkUndef( !getA(self) && JSON.parse(localStorage[getK(self)] || "false") ),
		(_, v, self) => (!getA(self) && ( localStorage[getK(self)] = JSON.stringify(v) ) ,v ),
		"modelGlobal"
	),
    Emitter];


const e = (Content, Header, Actions, is, Mixins, panelInfo, doBar, zIndex) => mixins.concat(Mixins || []).reduce((s,v) => v(s), class BaseView extends React.Component {

    constructor(...args) {
				super(...args);

        const def = {
            left: Utils.toFloat(this.props.left),
            top: Utils.toFloat(this.props.top),
            width: Utils.toFloat(this.props.width || 0),
						height: Utils.toFloat(this.props.height || 0)
				};
        const c = Seq(this.getInitState && this.getInitState() || {}).concat(def).concat(this.persistLoad.model() || {}).concat(this.persistLoad.modelGlobal() || {}).concat(is || {}).toObject();
        this.defState = this.state = Seq(c).concat(Seq(def).filter((_,k) => (c[k] === undefined || isNaN(c[k])))).toObject();
    }

    UNSAFE_componentWillReceiveProps(nextProps){
        this.props.layoutConf !== nextProps.layoutConf && ((this._persisted.model = this.persistLoad.model(true, nextProps)) || this.setState(this.getInitState()));
    }
    getMetrics() {
        const result = {
					minWidth: this.props.minWidth / this.props.parentWidth,
					minHeight: this.props.minHeight / this.props.parentHeight
        };
        result.left = this.state.minWidth ? 1 - result.minWidth : this.state.left;
        result.top = this.state.minHeight ? 1 - result.minHeight : this.state.top;
        result.width = Math.max(this.state.width, result.minWidth);
        result.height = Math.max(this.state.height, result.minHeight);
        return result;
    }
    onBarPointerDown(e) {
        const m = this.getMetrics();
        const dx = e.clientX / this.props.parentWidth - m.left;
        const dy = e.clientY / this.props.parentHeight - m.top;

        Utils.drag(e => this.setState({
            left: Utils.range(e.clientX / this.props.parentWidth - dx, 0, 1 - m.width),
            top: Utils.range(e.clientY / this.props.parentHeight - dy, 0, 1 - m.height)
        }));

        this.setState({
            left: m.left,
            top: m.top
        });
        document.activeElement && document.activeElement.blur();
        e.preventDefault();
    }
    onResize(type, e) {
        const d = Utils.directions[type];
        const m = this.getMetrics();
        let sx, sy, dw, dh, dx, dy, mw, mh, mx, my;

        if (d.x) {
            sx = d.x / this.props.parentWidth;
            const x = sx * e.clientX;
            dw = x - m.width;
            dx = x + m.left;
            mw = d.x > 0 ? 1 - m.left : m.left + m.width;
            mx = mw - m.minWidth;
        }

        if (d.y) {
            sy = d.y / this.props.parentHeight;
            const y = sy * e.clientY;
            dh = y - m.height;
            dy = y + m.top;
            mh = d.y > 0 ? 1 - m.top : m.top + m.height;
            my = mh - m.minHeight;
        }

        Utils.drag(e => {
                const state = {};
                if (d.x) {
                    state.width = Utils.range(sx * e.clientX - dw, m.minWidth, mw);
                    if (d.x < 0) state.left = Utils.range(dx - sx * e.clientX, 0, mx);
                }
                if (d.y) {
                    state.height = Utils.range(sy * e.clientY - dh, m.minHeight, mh);
                    if (d.y < 0) state.top = Utils.range(dy - sy * e.clientY, 0, my);
                }
                this.setState(state);
            }, null, type + "-resize");

        this.setState({
            left: m.left,
            top: m.top
        });
        document.activeElement && document.activeElement.blur();
        e.preventDefault();
    }
    render() {
        const mkPercent = (v, max = 1) => Utils.toPercent(Math.max(0, Math.min(max, v)));
        const props = this.props;
				const state = this.state;

				// cc.view = this;

        const style = {
            width: mkPercent(state.width),
            height: mkPercent(state.height),
            minWidth: props.minWidth,
            minHeight: props.minHeight,
            zIndex: zIndex ? zIndex : props.index
        };

        state.left + props.minWidth / props.parentWidth > 1 ? style.right = 0 : style.left = mkPercent(state.left);
        state.top + props.minHeight / props.parentHeight > 2 ? style.bottom = 0 : style.top = mkPercent(state.top);
        const width = Math.max(state.width * props.parentWidth, props.minWidth) - 17;
        const height = Math.max(state.height * props.parentHeight, props.minHeight) - 47;
        const p = Seq(props).concat(Content.extractPropsFromState ? Content.extractPropsFromState(this.state) : {}).concat({ drag: this.onBarPointerDown.bind(this), parentWidth: width, parentHeight: height,
            view: { persist: props.persist + ".", persistGlobal: props.persistGlobal + ".", parentWidth: width, parentHeight: height, addListener: this.addListener.bind(this), removeListener: this.removeListener.bind(this), getState: () => this.state, setState: this.setState.bind(this) }}).toObject();


        const stop = e => e.stopPropagation();
        const actions = [];

        if (Actions) {
            const pa = typeof(Actions) == "function" ? Actions(p, e => this.refs.self.refs[e], this.refs.self) : Actions;
            for (const p in pa) {
                if (!p) continue;
                let e = pa[p];
                (!e || typeof(e) == "function") && (e = { action: e });
								if(props.section != 'translate:ModelDashBoardLearningLabelCourses'){
									actions.push(e.type ? (e._owner ? React.cloneElement(e, { key: p, onPointerDown: stop }) : React.createElement( 'div', {style : {display: "initial"}, className: "act-btn-group"}, React.createElement('span',{style: {'verticalAlign': "super"}}, 'helperText' in e? e.helperText : ''), React.createElement(e.type, Seq({ key: p, className: "icon base-" + p, onPointerDown: stop }).concat(e).toObject()))):
									<input type="button" key={p} className={Utils.css("icon","base-" + (p === "copy" ? "saveIcon" : p), e.className)} title={e.title} disabled={Utils.enabled(e.action === null || e.action)} onClick={e.action === null ? this.emitEvent.bind(this, p) : e.action} onPointerDown={stop} />);
								}			
            }
        }
        const pi = typeof(panelInfo) === "function" ? panelInfo(p) : panelInfo;
        if(pi){
            actions.push((<div key='info' className={Utils.css("icon","base-info","infobox")} onPointerDown={stop}>
                <div>
                    <div className="infotext">
                        {pi}
                    </div>
                </div>
            </div>));
        }
        if (Actions)
            {actions.push((<span key="empty" className="icon"/>));}

        const translate = () => {
            const k = props.viewType;
            const message = viewsMessages[getViewMessageKey(k)];

            if ( message && 'defaultMessage' in message ) {
                return (<FormattedMessage {...message} />);
            }

            return null
        }

        let hasBar = (Header !== false);
        if( hasBar && doBar !== undefined ){
            if( typeof doBar === 'function' ){
                hasBar = doBar(props); //should return a boolean value
            }else{
                hasBar = doBar; // assume a boolean-ish value was passed in
            }
        }

        return (
            <div className="view" style={style} onPointerDown={props.onFocus}>
                <div className={!hasBar ? "compact" : null}>
                    {(hasBar) ? (<div className="bar" onPointerDown={this.onBarPointerDown.bind(this)}>
                        <ErrorBoundary>
                            <span className="options">{p.isLoading ? "Loading..." : Header ? (typeof(Header) == "string" ? translate() || Header : (<Header {...p}/>)) : translate() || props.name}</span>
                            {!p.isLoading && (
															<div className="actions">
																	{actions}
																	{
																			props.onClose && (Application.domain !== "learning" || props.isDialog) && (<input type="button" className="icon base-close" onClick={props.onClose} onPointerDown={stop}/>)
																	}
															</div>
														)}
                        </ErrorBoundary>
                    </div>) : null}
                    {props.width && props.height && (
                        <span>
                            <div className="resize n"  onPointerDown={this.onResize.bind(this, "n")}></div>
                            <div className="resize e"  onPointerDown={this.onResize.bind(this, "e")}></div>
                            <div className="resize s"  onPointerDown={this.onResize.bind(this, "s")}></div>
                            <div className="resize w"  onPointerDown={this.onResize.bind(this, "w")}></div>
                            <div className="resize se" onPointerDown={this.onResize.bind(this, "se")}></div>
                            <div className="resize sw" onPointerDown={this.onResize.bind(this, "sw")}></div>
                            <div className="resize ne" onPointerDown={this.onResize.bind(this, "ne")}></div>
                            <div className="resize nw" onPointerDown={this.onResize.bind(this, "nw")}></div>
                        </span>
                    )}
                    <div className="content">
											<ErrorBoundary>
												{p.isLoading ? <img src="/assets/images/loading.gif" alt="loading" height="22" width="22"/> :
													(<Content ref={React.Component.isPrototypeOf(Content) ? "self" : undefined} {...p} />)}
											</ErrorBoundary>
                    </div>
                </div>
            </div>
        );
    }
});

e.equal = (a, b) => a.parentWidth === b.parentWidth && a.parentHeight === b.parentHeight;
e.EntityMultipleHeader = ({entity:{name}, entity, actions:{onEdit}}) => ((<Editable value={name} onEdit={onEdit.bind(null, entity, 'name')} />));


export default e;
