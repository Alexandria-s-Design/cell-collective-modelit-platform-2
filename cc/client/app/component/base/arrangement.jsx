import React from "react";
import Utils from "../../utils";
import Application from "../../../app/application";
import { Seq, Set, Map } from "immutable";
import ModelPersist from "../../mixin/modelpersist";
import Persist from "../../mixin/persist";
import Joyride from "react-joyride";
import JoyrideFunc from "../../joyride/joyride";

const mp = ModelPersist(
	{ views: "Map" },
	(props) => props.layoutGetValue, 
	(self)=>self.props.onLayoutViewChange,
	"model",
	null,
	[(v) => {
		return v;
	}]
);

const gK = ".globalLayout";
const p = Persist(
	{ viewsGlobal: "Map" },
	(k) => (localStorage[gK] ? JSON.parse(localStorage[gK]) : undefined),
	(v) => {localStorage[gK] = JSON.stringify(v); return v;}
);

export default p(mp( class extends Utils.MyComponent{
	constructor(props){
		super(props);
		const s = {views: {}, viewsGlobal: {0: "ModelsView"}};
		const is = Seq(s).map(e=>0).toObject();

		React.Children.forEach(props.children, (v, i) => {
			if(!v) return;
			const {key, props} = v;
			const k = this._getK(props);
			s[k][key] = is[k]++;
		});

		this.state = this.defState = Seq(this.state)
			.concat(Seq(s).map(e=>new Map(e)).toObject())
			.concat(this.persistLoad.model(undefined) || {})
			.concat(this.persistLoad[null](undefined) || {})
			.toObject();
	}
	_getZIndex(p) {
		if( p.props.inLayout)
			{return this.state.views.get(p.key);}
		else
			{return (this.state.viewsGlobal.get(p.key) || 0)+this.state.views.size;}
	}
	_getK(p) {
		return p.inLayout ? "views" : "viewsGlobal";
	}
	onFocus(key) {
		const s = Seq(this.state).toObject(); //shallow copy

		const foundK = Seq(this.props.children).filter(e=>e).filter(v=>v.key == key).map(v=>this._getK(v.props)).first();
		if(!foundK){ console.warning("Internal violation: no view to focus :("); return; }

		const top = s[foundK].size - 1;
		const index = s[foundK].get(key);
		index !== top && this.setState({ [foundK]: s[foundK].map((v, k) => (k === key ? top : v - (v > index))).toMap() });
	}
	UNSAFE_componentWillReceiveProps(props) {
		const s = Seq(this.state).filter((_,k)=>/^views/g.test(k)).toObject();
		const sizes = Seq(s).map(e => e.size).toObject();
		const is = Seq(sizes).toObject();
		const nis = Seq(s).map(e=>({})).toObject();

		React.Children.forEach(props.children, (v) => {
			if(!v) return;
			const {key, props} = v;
			const k = this._getK(props);

			nis[k][key] = s[k].get(key) !== undefined ? s[k].get(key) : is[k]++;
		});

		Seq(is).filter((v,k)=>v !== sizes[k] || sizes[k] !== Seq(nis[k]).size).forEach((_,k)=>{
			let i = 0;
			this.setState({ [k]:Seq(nis[k]).sort().map(()=>i++).toMap() });
		});
		this.props.layoutConf !== props.layoutConf && ((this._persisted.model = this.persistLoad.model(true, props)) || this.setState({views: this.state.views}));
	}
	getProgress(key, {type}){
		if(type === "finished"){
			let completed = this.props.joyRideStepsCompleted.add(key);
			let completedJoyride;
			let phase = this.props.joyRidePhase;
			if(completed.size === 4){
				phase += 1;
				completed = new Set();
				completedJoyride = new Set();
			}else{
				completedJoyride = this.props.completedJoyride.add(key);

			}
			this.props.setJoyRide({joyRideStepsCompleted : completed, joyRidePhase : phase, completedJoyride : completedJoyride});
		}
	}
	render() {
		const key = this.props.persist;
		const key2 = this.props.persistGlobal;
		// const views = this.state.views;
		const joyRidePhase = this.props.joyRidePhase;

		let shouldDisplayLessonPreview = Application.isLearning
				&& this.props.persist != ".Layout[Home]"
				&& this.props.persist != ".Layout[Overview][learning]";

		if (shouldDisplayLessonPreview && this.props.startButtonClicked) {
			shouldDisplayLessonPreview = false;
		}

		return (
			<div className="arrangement">
				{
					!(this.props.joyRideStepsCompleted || new Map()).get(key)
                &&
                ((!this.props.editable && key === ".Layout[Home]") || (this.props.editable))
                &&
                <Joyride
									ref={c => (this.ref = c)}
									run={true}
									steps={JoyrideFunc.joyrideLayouts(key, joyRidePhase)}
									showSkipButton={true}
									showStepsProgress={true}
									type={"continuous"}
									locale={{next: "Next", last: "End Tour", skip: "Skip", back: "Back"}}
									tooltipOffset={10}
									callback={this.getProgress.bind(this,key)}
                />
				}
				{ shouldDisplayLessonPreview &&
				<div className="overlay-flex">
					<div className="large-number text-white">
						<h1 className="text-center">Lesson Preview</h1>
						<h2>Go to the Overview tab and click Start Lesson to begin.</h2>						
					</div>
				</div>}
				{React.Children.map(this.props.children, e => (
					e && e.key && React.cloneElement(e, { viewType: e.key, persist: key + e.key, persistGlobal: key2 + e.key, index: this._getZIndex(e), onFocus: this.onFocus.bind(this, e.key)})
				), this)}

			</div>

		);
	}
} ));
