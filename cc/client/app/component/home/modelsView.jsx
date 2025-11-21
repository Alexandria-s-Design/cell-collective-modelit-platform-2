import React, {
	useContext,
	useCallback
} from 'react';
import { Seq } from 'immutable';
import NetViz from 'ccnetviz';
import FluxViz from '../../fluxviz';
import Utils from '../../utils';
import Application from '../../application';
import Texts from '../texts';
import view from '../base/view';
import Graph from '../graph';
import Panel from '../base/panel';
import Scrollable from '../base/scrollable';
import Slider from '../base/slider';
import Table from '../base/table';
import Checkbox from '../base/checkbox';
import PropertyLine from '../description/propertyLine';
import MetadataSingle from '../description/metadataSingle';
import classnames from 'classnames';
import cc, { ModelType } from '../../cc';
import { FormattedMessage } from 'react-intl';
import ModelControl from './ModelControl';
import { CCEntities } from '../../../app/containers/Application/index';
import {produce} from 'immer';
import { v4 as uuidv4 } from 'uuid';

import messages from './messages';
import { injectIntl } from 'react-intl';
import { ModelEvents } from '../modelMixin';
import { APP_MODEL_CATEGORIES } from '../../util/constants';


const GridLazy = React.lazy(() => import('../base/grid'));
const GridLoader = (props) => (<React.Suspense fallback={(<div>Loading...</div>)}><GridLazy {...props}/></React.Suspense>);
const GridMemo = React.memo(GridLoader);

const generateHash = (string) =>
{
    string = string ? string : uuidv4();
    return string;
};


const date = e => (e ? e.toLocaleDateString() : '');
const datetime = e => (e ? `${e.toLocaleDateString()} ${e.toLocaleTimeString()}` : '');
const graphEl = document.createElement("canvas");
graphEl.className="modelCanvas";
document.body.append(graphEl);
const loadedBuffer = [];
//const isLoaded = false;

const fluxVizGraphEl = document.createElement("canvas");
fluxVizGraphEl.className="modelCanvas";
document.body.append(fluxVizGraphEl);

const onLoad = () => {
  loadedBuffer.forEach((cbk) => cbk());
};


const singleLoad = () => {
	const queue = [];

	const execQueue = async (resolve) => {
		if(queue.length > 0){
			const [resolve, cbk] = queue[0];
				resolve(await cbk());
		}
	}
	return (cbk) => new Promise((resolve) => {
			queue.push([resolve, cbk])
			if(queue.length <= 1){
				execQueue();
			}
		}).finally(() => {
			queue.shift();
			execQueue();
		});	
}

let netVizInstance;
//TODO: remove hacks ;)
//setTimeout(() => {
if (NetViz.isWebGLSupported()) {
  netVizInstance = new NetViz(graphEl, { onLoad, styles: Graph.styles.base });
}

const netVizSerializer = singleLoad();
const fluxVizSerializer = singleLoad();

function checkCanvasConsistency(canvas){
	const attributes = { depth: false, antialias: false };
	const gl = 
		canvas.getContext('webgl', attributes) ||
		canvas.getContext('experimental-webgl', attributes);

	const pix = new Uint8Array(gl.drawingBufferWidth * gl.drawingBufferHeight * 4);
	gl.readPixels(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight, gl.RGBA, gl.UNSIGNED_BYTE, pix);

	let hasColor = false;

	// Loop over each pixel and invert the color.
	for (let i = 0, n = pix.length; i < n; i += 4) {
		const R = pix[i];
		const G = pix[i+1];
		const B = pix[i+2];
		const A = pix[i+3];
		//4th channel is missing ( alpha )

		//skip transparent
		if(A == 0) {	//white
			continue;
		}

		if(R == 0 && G == 0 && B == 0 && A == 255) {//black
			return false;
		}

		// if(R == 255) //black
		// 	return false;

		//if the image has different color than grayscale >> proceed
//		hasColor = hasColor || R != G || G != B || R != B;
		hasColor = hasColor || true;
	}

	return hasColor;
}

//}, 1000);

//TODO: image invalidation 
const Image = {};

const ModelCard = (props) => {
	const entities = useContext(CCEntities);
	let { reference, saveGraphImage, data:e } = props;


	const image = useCallback(async (e, r, setLoading) => {
		const modelType = e.modelType;
		const coverImage = e?.top?.coverImage;
		const id = e.id;
		let img = Image[id];
		if (!img || img.ref !== r) {
			let valid = false;
			if ( coverImage ) {
				img = Image[id] = { src: `${coverImage}`, ref: r };
			} else{
				if(!e.Component || !e.Regulator){
					return {loadModel: true};								
				}
				setLoading();
				if ( modelType === 'boolean' ) {
					if (!NetViz.isWebGLSupported() || !e) return {src: undefined};
					const layout = e.layout && e.layout.components;
					const f = layout ? e => layout[e.id] || e : e => e;
					let nodes = e.nodes
						.filter(e => e)
						.map((e, c) => (c = f(e)) && { x: c.x, y: c.y, style: Graph.nodeStyleMap[e.isExternal] })
						.toObject();
					const edges = e.edges
						.filter(e => e)
						.map(e => ({ source: nodes[e.source], target: nodes[e.target.id], style: Graph.edgeStyleMap[e.type] }))
						.toArray();
					NetViz.layout.normalize((nodes = Seq(nodes).toArray()));

					let image;
					await netVizSerializer(async () => {
						await netVizInstance.set(nodes, edges);
						netVizInstance.draw();
						valid = /* netVizInstance.hasFullFeatures() && */ checkCanvasConsistency(graphEl);
						image = netVizInstance.image();	
					});

					Image[id] = img = { src: image, ref: r };
				} else if (['metabolic', 'kinetic', 'pharmacokinetic'].includes(modelType)) {
					if (!NetViz.isWebGLSupported() || !e) return {src: undefined};
					if ( img === false ) {
						//wait for image appear 
						
						img = await new Promise((resolve) => {
							let waited = 0;
							const checkOrWait = () => {
								if(Image[id] !== false){
									resolve(Image[id]);
								}else if(waited > 5000){
									resolve({ src: null });
								}else{
									waited += 100;
									setTimeout(checkOrWait, 100);
								}
							}
							checkOrWait();
						});

					} else {
						Image[id] = false; // special value to indicate loading in progress

						let image;
						await fluxVizSerializer(async () => {
							let fluxvizData = null;
							if (modelType === 'metabolic') {
								fluxvizData = e.cobra
							} else if (modelType === 'kinetic') {
								fluxvizData = e.fluxvizModel(false);
							} else if (modelType === 'pharmacokinetic') {
								fluxvizData = e.fluxvizModel(false);
							}
							await FluxViz.render(fluxVizGraphEl, fluxvizData);
							valid = /* fluxVizGraphEl.hasFullFeatures() && */ checkCanvasConsistency(fluxVizGraphEl);
							image = fluxVizGraphEl.toDataURL("image/png");
						});
	
						img = Image[id] = { src: image, ref: r };
					}
				} else {
					img = { src: null };
				}

				if(img.src && valid){
					saveGraphImage && saveGraphImage(e.top.id, img.src);
				}
			}
		}
		
		return img;
	}, [e]);
// 	const image = async (model, r ) => {
// 		if (!NetViz.isWebGLSupported() || !model) return;
// 		const id = e.id;
// 		let img = Image[id];
// 		if (!img || img.ref !== r) {
// 			const layout = e.layout && e.layout.components;
// 			const f = layout ? (e => (layout[e.id] || e)) : (e => e);
// 			let nodes = e.nodes.filter(e => e).map((e, c) => (c = f(e)) && { x: c.x, y: c.y, style: Graph.nodeStyleMap[e.isExternal] }).toObject();
// 			const edges = e.edges.filter(e => e).map(e => ({ source: nodes[e.source], target: nodes[e.target.id], style: Graph.edgeStyleMap[e.type] })).toArray();
// 			NetViz.layout.normalize(nodes = Seq(nodes).toArray());
// 			await netVizInstance.set(nodes, edges);
// 			netVizInstance.draw();
// 			Image[id] = img = { src: netVizInstance.image(), ref: r };
// 		}
// 		return img.src;
// } 
	reference = reference || (e && e?.path && entities && entities.getIn(e.path));

	return  (
		<Card {...props} reference={reference} image={image} />
	)  ; 
}

const Card = injectIntl(class extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			loadedCard: false,
			loadingCard: false,
			cardImg: null
		}
	}
  shouldComponentUpdate(props, state) {
		if(this.props.reference !== props.reference || this.props.data?.id !== props.data?.id){
			this.loadCardImage(props).then(() => {});
		}

    return this.props.reference !== props.reference || state.cardImg !== this.state.cardImg || state.loadingCard !== this.state.loadingCard || state.loadedCard !== this.state.loadedCard;
	}

	loadCardImage = async (props) => {	
		if(this.state.loadingCard){
			return;
		}
		try{
			const { data: e, reference } = props;
			if(!e){
				return;
			}

			const setLoading = () => {
				this.setState({loadingCard: true});
			}

			const {src, loadModel} = await props.image(e, reference, setLoading);
			if(loadModel && !e._loading){
				await this.props.load(this.props.data);
				return;
			}

			const newSt = {
				loadedCard: true,
				cardImg: src
			};
			if(newSt.loadedCard !== this.state.loadedCard || newSt.cardImg !== this.state.cardImg){
				this.setState(newSt);				
			}
			this.setState({loadingCard: false});	
		}catch(e){
			this.setState({loadingCard: false});
			console.error(e);
		}
	}

	UNSAFE_componentWillMount(){
		this.loadCardImage(this.props).then(() => {});
	}

	componentDidMount() {
		const hostname = window.location.hostname;
		let measurementId;

		switch (hostname) {
			case "cellcollective.org":
				measurementId = "G-V89ZEJMZDR"; // Production landing
				break;
			case "research.cellcollective.org":
				measurementId = "G-FC5WJX5422"; // Production research
				break;
			case "teach.cellcollective.org":
				measurementId = "G-Q1M61MJ78H"; // Production teach
				break;
			case "learn.cellcollective.org":
				measurementId = "G-N15N4L9JEG"; // Production learn
				break;
			case "develop.cellcollective.org":
				measurementId = "G-EZ1XK3WELR"; // Develop
				break;
			case "staging.cellcollective.org":
				measurementId = "G-PDKQEH4GM4"; // Staging
				break;
			case "hotfix.cellcollective.org":
				measurementId = "G-9TJ0R5S67X"; // Hotfix
				break;
			case "localhost":
				measurementId = "G-ZP37KP1MJR"; // Localhost
				break;
			default:
				console.warn("Undefined host name", window.location.hostname);
				return;
		}

		// DISABLED: Check European GDPR
		// const script = document.createElement("script");
		// script.async = true;
		// script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
		// document.head.appendChild(script);

		// window.dataLayer = window.dataLayer || [];
		// function gtag() {
		// 	dataLayer.push(arguments);
		// }
		// gtag("js", new Date());
		// gtag("config", measurementId);
		// console.log("[modelView] Loading Gtag for "+hostname);
	}
	
	render ( ) {
		const props = this.props;

		const { data: e, submittedLessons, modelId } = props;
    const courseId = props.courseId ? props.courseId : null;
		const modelType 	= e.modelType;

		if ( !e ) {
			return (<div/>);
		}

		let loaded 			= e.Component || e.Metabolite;

    const author = (
      <div>
        <FormattedMessage id="DashBoard.ModelsView.LabelAuthor" defaultMessage="Author">
          {(messages) => <PropertyLine entity={e} name="publisher" label={messages} />}
        </FormattedMessage>
      </div>
    );

    const dates = (
      <div>
        <FormattedMessage id="DashBoard.ModelCard.LabelCreated" defaultMessage="Created">
          {(messages) => <PropertyLine entity={e} name="created" label={messages} format={date} formatTitle={datetime} />}
        </FormattedMessage>
        <FormattedMessage id="DashBoard.ModelCard.LabelUpdated" defaultMessage="Updated">
          {(messages) => <PropertyLine entity={e} name="updated" label={messages} format={date} formatTitle={datetime} />}
        </FormattedMessage>
      </div>
    );

    const info = {
      research: () => (
        <div className="research-info">
          {author}
          <div>
            <FormattedMessage id="DashBoard.ModelCard.Label" defaultMessage="Score">
              {(messages) => <PropertyLine entity={e} name="score" label={messages} format={(e) => e && (e || 0).toFixed(1)} />}
            </FormattedMessage>
            <FormattedMessage id="DashBoard.ModelCard.LabelCited" defaultMessage="Cited">
              {(messages) => <PropertyLine entity={e} name="cited" label={messages} format={(e) => e || 0} />}
            </FormattedMessage>
          </div>
          {dates}
          {false && (
            <div>
              <dl>
                <div className="rating">
                  <div style={{ width: Utils.toPercent((e.rating || 0) / 5) }} />
                </div>
                <dt>{'(' + (e.ratingNum || 0) + ')'}</dt>
              </dl>
              <dl>
                <dt>Comments</dt>
                <dd>(0)</dd>
              </dl>
            </div>
          )}
        </div>
      ),

      learning: () => (
        <div className="research-info">
          <div>
            <FormattedMessage id="DashBoard.ModelCard.LabelModuleID" defaultMessage="Module ID">
              {(messages) => <PropertyLine entity={e.top} name="id" label={messages} />}
            </FormattedMessage>
          </div>
          <div>
            <FormattedMessage id="DashBoard.ModelCard.LabelAudience" defaultMessage="Audience">
              {(messages) => <MetadataSingle entity={e} name="TargetAudience" label={messages} />}
            </FormattedMessage>
            {courseId !== null && Application.domain === 'teaching' ? (
              <a
								style={{fontSize:"10px", lineHeight: '4px'}}
								key="add"
								type="button"
                title="Generate Student Report"
								href="#"
                onClick={(e) => {
									e.stopPropagation();
                  // props.onSelect(props.data, null, "Insights")
									props.generateReport()
                }}>View Insights</a>
            ) : null}
          </div>
          <div>
            <FormattedMessage id="DashBoard.ModelCard.LabelUpdated" defaultMessage="Updated">
              {(messages) => <PropertyLine entity={e} name="updated" label={messages} format={date} formatTitle={datetime} />}
            </FormattedMessage>
            <FormattedMessage id="DashBoard.ModelCard.LabelTime" defaultMessage="Time">
              {(messages) => <MetadataSingle entity={e} name="EstimatedTime" label={messages} format={(e) => '~ ' + (e < 2 ? Math.round(60 * e) + ' minutes' : Math.floor(e) + ' hours')} />}
            </FormattedMessage>
          </div>
          <div className={'icon ' + e.top.learningType} title={Texts.LearningType[e.top.learningType]} />
        </div>
      ),
    };

		const cover = e.cover;
    // const cover = `/images/model/${e.coverImage}`;
		const coverClass = 'cover research-cover';

		const imsrc = this.state.cardImg;

		const { intl } = props;

		let modelTypeInfo = ModelType[modelType];
		if( modelTypeInfo === undefined ) {
			modelTypeInfo = {
				shortLabel: "Unknown"
			};
		}
		const modelTypeShort = modelTypeInfo.shortLabel || modelTypeInfo.label || modelTypeInfo.name;

		loaded = this.state.loadedCard || !!cover;

		const onSelect = props.onSelect.bind(null, e);
		const clicked = async (...args) => {

			const cbk = async (course) => {
				onSelect(...args);
				await props.selectCourse(course);
			}

			if (courseId) {
				await cbk(courseId);
			} else {
				if (Application.domain === "learning" && (props.user.id === props.data.userId)) {
					await props.promptCourse(props.data.top.Persisted, "Select a course to view this lesson for:").then(async course => {
						await cbk(course);
					});
				} else {
					await cbk(null);
				}
			}
		}

    return (
      <div
				className={Utils.css(e.type, ((!loaded && !cover) || this.state.loadingCard ) && 'loading')}
        onClick={clicked}
        onDoubleClick={props.onDoubleClick ? props.onDoubleClick.bind(null, e) : () => {}}>
        <div>
          <div>{e.top.name} </div>
          {!Application.isEducation && (
            <div>
              {e.versionDef && (
                <dl>
                  <dd>{`${intl.formatMessage(messages.ModelCardLabelVersion)} ${e.versionDef.name}`}</dd>
                </dl>
              )}
              <FormattedMessage id="DashBoard.ModelCard.LabelApproach" defaultMessage="Approach">
                {(messages) => <PropertyLine entity={e} label={messages} format={(v) => modelTypeShort} />}
              </FormattedMessage>
            </div>
          )}

          {/* boolean... */}
          {!Application.isEducation && modelType == 'boolean' && (
            <div>
              <FormattedMessage id="DashBoard.ModelCard.LabelComponents" defaultMessage="Components">
                {(messages) => (
                  <PropertyLine
                    entity={e}
                    name="numNodes"
                    label={messages}
                    // format={v => (loaded ? e.nodes.count() : v)}
                  />
                )}
              </FormattedMessage>
              <FormattedMessage id="DashBoard.ModelCard.LabelInteractions" defaultMessage="Interactions">
                {(messages) => (
                  <PropertyLine
                    entity={e}
                    name="numEdges"
                    label={messages}
                    // format={v => (loaded ? e.edges.count() : v)}
                  />
                )}
              </FormattedMessage>
            </div>
          )}

          {!Application.isEducation && ['metablic', 'kinetic', 'pharmacokinetic'].includes(modelType) && (
            <div>
              <FormattedMessage id="DashBoard.ModelCard.LabelMetabolites" defaultMessage="Metabolites">
                {(messages) => (
                  <PropertyLine
                    entity={e}
                    name="nMetabolites"
                    label={messages}
                    // format={v => (loaded ? e.metabolites.count() : v)}
                  />
                )}
              </FormattedMessage>
              <FormattedMessage id="DashBoard.ModelCard.LabelReactions" defaultMessage="Reactions">
                {(messages) => (
                  <PropertyLine
                    entity={e}
                    name="nReactions"
                    label={messages}
                    // format={v => (loaded ? e.reactions.count() : v)}
                  />
                )}
              </FormattedMessage>
            </div>
          )}
          


					{(courseId && submittedLessons?.models.includes(modelId)) ? 
							<div className={"icon_circle material-symbols-rounded " + 'base-check-green'} title={Utils.capitalize(e.type || "boolean") + ' Model'} />
					: null}
					
          {(e.permissions.delete || props.refs) && (
            <div
              className="remove model-card"
              onClick={_ => (e.permissions.delete ? props.onRemove(e) : props.onRemoveRef(e), _.stopPropagation())}
            />
          )}
        </div>
        <div className={Utils.css(coverClass)}>
					{cover ? (
							<img src={Application.url(cover)} alt="Cover model picture" />
						) : (
								loaded && (
									imsrc ? 
										(<img fetchpriority="high" src={new URL(imsrc, Application.api)} className="model-img" alt="Model picture WebGL"/>) : 
										(!this.state.loadedCard && (<div className="graphErrBox">WebGL initialization failed.</div>))
								)
							)}
        </div>
        {info[e.type] && info[e.type]()}
      </div>
    );
  }
});

const getCur = (m, modelTypes) => {
  return Seq(m)
    .map((m) => m.sub())
    .filter((m) => m)
    .filter((m) => (modelTypes ? Seq(modelTypes).includes(m.modelType) : m))
    .toMap();
};

const getModelTypes = (modelFilter) => {
  const ModelTypes = Seq(ModelType)
    .filter((v) => !v.beta)
    .map((v, k) => ({ ...v, type: k }));

  let values = ModelTypes.map((v) => v.type);

  if (modelFilter) {
    const modelType = ModelTypes.find((v) => v.name == modelFilter.name);
    values = Seq([modelType.type]);
  }

  return values;
};

const timeValueOf = (datestr) => (new Date(datestr)).getTime();

class Content extends React.Component {
  constructor(props) {
    super(props);
		this.state = {  };

		props.view.setState({ cardData: {}, loadedContent: false, });
		
		ModelEvents.addListener('modelRemove', this.modelRemoved);

		this._loadCardsCount().then(() =>{});
	}
	
	modelRemoved = ({ids}) => {
		ids = ids.map(e=>parseInt(e));

		this.props.view.setState({cardData: produce(this.props.cardData, (draft) => {
			for(const key in draft){
				if(Array.isArray(draft[key])){
					const oldLength = draft[key].filter(e=>e).length;
					const newArr = draft[key].filter(e=>!ids.includes(e));
					const newLength = newArr.length;
					const diff = oldLength - newLength;
					if(diff == 0){
						//performance optimization
						//continue;
					}

					draft[key] = new Array(draft[key].length - diff);
					newArr.forEach((v, idx) => {
						draft[key][idx] = v;
					});
				}
			}
		})});
	}

  UNSAFE_componentWillMount() {
		this.Image = {};
		
	}

	componentWillUnmount(){
		ModelEvents.removeListener('modelRemove', this.modelRemoved);
	}



	shouldComponentUpdate(nextProps, nextState){
		if(nextProps.user?.id !== this.props.user?.id || this.props.modelFilter !== nextProps.modelFilter){
			this._loadCardsCount(nextProps.modelFilter).then(() =>{});
		}
	
		if(nextProps.entities !== this.props.entities){
			this._checkForMissingModels(nextProps.entities, nextState);			
		}
		return true;
//		super.shouldComponentUpdate(nextProps, nextState);

	}

	_checkForMissingModels(newProps, newState){
		//is temporary

		// return;
		
		// const current = new Set(newProps?.cardData?.my || []);
		// return Seq(newProps.entities || []).filter((_, key) => parseInt(key) < 0 && !current.has(parseInt(key)));	

		// if(!getToAdd(newProps).isEmpty()){
		// 	newProps.view.setState((state) => {
		// 		const add = getToAdd(state);
		// 		if(add.isEmpty())
		// 			{return state;}
		// 		return produce(draft => {
		// 			if(!draft.cardData.my)
		// 				{draft.cardData.my = [];}
		// 			draft.cardData.my = [...add.map((value, key) => parseInt(key)).toArray(), ...draft.cardData.my];
		// 		}, state);
		// 	})
		// }		
	}

	async _loadCardsCount(modelFilter = this.props.modelFilter){
		this.props.view.setState({loadedContent: false});

		const data = await cc.context.ajaxPromise(`_api/model/cards/count/${Application.domain}?${cc._.constructGetParams({
			modelTypes: getModelTypes(modelFilter).join("&")
		})}`);
		
		const props =this.props;
		const newCardData = {};

		const add = (v, k) => {
			if(v && v.el){
				return;
			}
			const category = Application.catalogCategories[k].category;
			newCardData[k] = new Array(data[category] || 0);
		};


		Seq(props.sections).forEach((section, k) => {
			if( !section.source && !section.el ) {
				Seq(section).forEach(add);
			}else{
				add(section, k);
			}
		});

		this.props.view.setState((prev) => ({...prev, cardData: newCardData, loadedContent: true}));

		const user = this.props.user;
		const isAuthenticatedInServer = Object.keys(data).includes("my");
		if(!isAuthenticatedInServer &&  (user && user.token))  { 
	    // this is a rare scenario where the user is not authenticated but credentials in the UI are expired.
			this.props.cc.clearUserSession();
		}
	}

	async createCardData(requestKey, modelTypes, cc, Application, actions) {
    const params = Application.catalogCategories[requestKey];
    const data = await cc.context.ajaxPromise(`api/model/cards/${Application.domain}?${cc._.constructGetParams({
        ...params,
        modelTypes: modelTypes.join("&"),
        cards: 99999
    })}`);

    this.props.view.setState((prev) => ({
				...prev,
        cardData: produce(this.props.cardData, (draft) => {
            if (!draft[requestKey]) {
                draft[requestKey] = [];
            }
            for (let i = 0; i < data.length; i++) {
                const item = data[i]?.id || data[i]?.model?.id;
                if (item !== undefined) {
                    draft[requestKey][i] = item;
                }
            }
        })
    }), () => {
			// actions.loadCards(data); // Action to load cards, you can remove it if not needed
		});    
	}

  render() {
    const props = this.props;
		const { view, user, entities, section: path, search, actions, models, modelCartLoading, searchCartLoading, cardLayoutLoading } = props;
		const state = view.getState()
		const modelFilter = state.modelFilter;
		const modelTypes = getModelTypes(modelFilter);

    if (cardLayoutLoading) {
      return (
        <Panel {...view} top="44%" left="48%">
          <img src="/assets/images/loading.gif" height="22" width="22" />
        </Panel>
      );
		}

    const onSelect = actions.onMaster || actions.onDetail.bind(null, true);
    const onDoubleClick =
      actions.onMaster &&
      (e => {
        Application.domain === 'research' && actions.onDetail(true, e, true);
      });
    const selected = actions.onMaster && props.master;
		let main = path[0];
    if (!props.sections[main]) {
      main = Seq(props.sections)
				.filter(e => e)
        .map((_, k) => k)
        .first();
    }
    let content,
			section = props.sections[main];
		const { intl } = props;
		const isTable=view.getState().table;
		if (isTable && !section.el) {

			let tableKey;
			let requestKey;
			if( path.length === 1 && !section.source ) {
				tableKey = "default";
				requestKey = Seq(section).filter(e => e).map((_,k) => k).first();
			} else {
				tableKey = requestKey = main;
			}

			const loadingKey = "loading_state_" + tableKey;

			if( !this.props.view.getState()[loadingKey] ) {
				this.props.view.setState({
					[loadingKey]: "loading"
				});

				(async () => await this.createCardData(requestKey, modelTypes, cc, Application, actions))().then(
					() => this.props.view.setState({
						[loadingKey]: "loaded"
				}));
			} else if ( this.props.view.getState()['modelFilter'] != this.props.view.getState()['previousModelFilter']) {
				(async () => await this.createCardData(requestKey, modelTypes, cc, Application, actions))().then(
					() => this.props.view.setState({
						['previousModelFilter']: modelFilter
				}));
			}

			const data = (this.props.cardData && this.props.cardData[requestKey] ? this.props.cardData[requestKey] : []).filter(e => e).map(id => models[id]).filter(e => e);

			return (<Panel {...view} key="PanelNas" cardData={data}>
				<Table {...actions}
					key={generateHash(data.map(obj => JSON.stringify(obj.id)).join(","))}
					onSelect={onSelect}
					onDoubleClick={onDoubleClick}
					owner={entities !== undefined && (search || main)}
					references={[entities, search, main]}
					selected={selected}
					data={search ? search.data() : Seq(data)}
					master={actions.onMaster}
					columns={[
						{ get: e => e.top.name, label: intl.formatMessage(messages.TableLabelName) },
						{
							get: e => e.top.modelType,
							label: intl.formatMessage(messages.TableLabelModelType),
							style: "modelType",
							minWidth: 600
						},
						{ get: e => e.top.description, label: intl.formatMessage(messages.TableLabelDescription), minWidth: 900 },
						{ get: 'tags', label: intl.formatMessage(messages.TableLabelTags), minWidth: 1200 },
						{ get: 'publisher', label: intl.formatMessage(messages.TableLabelAuthor), style: 'large', minWidth: 450 },

						// --- NOTE: this data does not seem to be incorporated into the initial model objects :/ ---
						{
							get: 'created',
							format: e => <span title={datetime(e.created)}>{date(e.created)}</span>,
							label: intl.formatMessage(messages.TableLabelCreated),
							style: 'date',
							minWidth: 600
						},
						{
							get: 'updated',
							format: e => date(e.updated),
							label: intl.formatMessage(messages.TableLabelUpdated),
							style: 'date',
							minWidth: 700
						}
					]}></Table>
			</Panel>);
		}
		
		let wrapInScrollable = true;

    if (this.props.loadedContent) {
      const cp = {
				saveGraphImage: actions.saveGraphImage,
				load: actions.load,
        onSelect: onSelect,
        onDoubleClick: onDoubleClick,
        onRemove: actions.onRemove,
        onRemoveRef: actions.onRemoveRef,
				selectCourse: actions.selectCourse,
				promptCourse: actions.promptCourse,
				user: props.user,
				selectedSection: props.section
      };
      const ti = { done: () => this.refs.scrollable.componentDidUpdate() };
			const p = { references: entities, selected: selected, onSelect: actions.onMaster, card: ModelCard, cardProps: cp };

      if (0 && search) {
        content = <GridMemo {...p} key={search.value} data={search.data()} fixedHeight={86} transitionProps={ti} />;
      } else {
				const loader = async (k, min, max) => {
					const params = Application.catalogCategories[k];
					const { category } = params;
					let data = await cc.context.ajaxPromise(`api/model/cards/${Application.domain}?${cc._.constructGetParams({
							...params,
							modelTypes: modelTypes.join("&"),
							start: 0,
							cards: 99999,
							onlyPublic: 'true'
					})}`);
					data = Seq(data)
						.sortBy(d => {
							const date = d.modelType !== "boolean" ? timeValueOf(d._updatedAt) : Math.max(timeValueOf(d.model.biologicUpdateDate), timeValueOf(d.model.knowledgeBaseUpdateDate));
							return new Date(date);
						})
						// .reverse()
						.toArray()

					const findOutSpecificPlatfromCategories = (k) => {
							const researchRegex = /translate:ModelDashBoard\.Research/;
							const learningRegex = /translate:ModelDashBoard\.Learning/;
							const teachingRegex = /translate:ModelDashBoardLearning/;
					
							if (researchRegex.test(k)) {
									return "research";
							} else if (learningRegex.test(k)) {
									return "learning";
							} else if (teachingRegex.test(k)) {
									return "teaching";
							} else {
									return null;
							}
					};

					const platform = findOutSpecificPlatfromCategories(k);

					const dataIds = await cc.context.ajaxPromise(`_api/model/cards/ids/${Application.domain}?${cc._.constructGetParams({
						modelTypes: getModelTypes(modelFilter).join("&")
					})}`);

					const dataIdsWithReversedCategories = Object.entries(dataIds).reduce((acc, [key, value]) => {
						acc[Application.reversedCategories(platform, key)] = value;
						return acc;
					}, {});
					
					this.props.view.setState(({cardData}) => {
						const newCardData = produce(cardData, (draft) => {
							for (let key in dataIdsWithReversedCategories) {
								if(!draft[key]) {
									draft[key] = [];
								} else {
									draft[key] = dataIdsWithReversedCategories[key];
								}
							}
						});			
						return ({cardData: newCardData});
					}, () => {
						actions.loadCards(data);
					});
				};

				let targetSection;

				const mapModels = (e, k) => {
					let ret = Seq();
					const { orderBy: paramOrderBy } = Application.catalogCategories[k];
					const loadedIds = this.props.cardData[k] || [];
					// const loadedIdsSet = new Set(loadedIds.sort().reverse().map(e=>parseInt(e)).filter(e=>e));
					const loadedIdsSet = new Set(loadedIds.map(e=>parseInt(e)).filter(e=>e));

					const source = e?.source;

					if(source){
						let sourceData = source(getCur(props.models, modelTypes), user)
							.map((e) => (e?.top || e))
							.filter(e => e)
							.filter((m) => !loadedIdsSet.has(parseInt(m.id)))
							.filter(getModelTypeFilter(modelTypes))
							.sortBy(e => e.updated)
							.reverse()
							.map(e=>parseInt(e.id))
							.toArray();

							ret = ret.concat(sourceData);
					}

					ret = ret.concat(loadedIds);

					let filteredLoadedIds = ret.filter(item => item !== undefined)
					if (Object.keys(models).length > 0) {
						filteredLoadedIds = filteredLoadedIds.filter(id => models[id]);
					}
					
					if (['popular','recommended'].includes(paramOrderBy) == false) {
						filteredLoadedIds = filteredLoadedIds.sortBy(number => -number)
					}

					if (!filteredLoadedIds || filteredLoadedIds.isEmpty()) {
						// Return the original ret if filteredLoadedIds is null or empty
						return ret;
					}

					return filteredLoadedIds
				}

        if (section.el) {
					wrapInScrollable = false;
					content = (<section.el collapsed={isTable} />);
				} else if (path.length === 1 && !section.source) {
					let i = 0;
					content = Seq(section)
						.filter(e=>e)
						.map((e, k) => mapModels(e, k).valueSeq().toArray())
						.filter(e => e && e.length)
						.map(v => {
							return Seq(v).map(m => {
								if(m){
									return models[m];
								}
							})
						})
            .map((v, k) => (
              <Slider
                {...p}
                key={k+""}
                title={cc.context.translateLayoutKey(k)}
                data={Seq({})}
								master={!i++}
								load={loader.bind(this, k)}
                onClick={actions.onSection.bind(null, [main, k])}
              />
            ))
            .valueSeq().toArray();
        } else {
					// this check is added to select the correct section for mapping models to ensure the proper loading of models in the research platform.
					targetSection = (path.length === 2) ? setTargetSectionForLoad(path, main) : main;
					const s = path.length > 1 ? section[path[1]] : section;
					const data = mapModels(section, targetSection).map(m => (m ? models[m] : undefined));
          cp.refs = s.refs;

          content = <GridMemo {...p} data={data} cardProps={cp} fixedHeight={86} transitionProps={ti} load={loader.bind(this, main)} />;
        }
      }
    }

    if (wrapInScrollable) {
      content = (
        <Scrollable key={path.join('|')} ref="scrollable" fixedWidth="true" scrollSpeed="2">
          {content}
        </Scrollable>
      );
    }

    return (
      <Panel {...view} className="modelCards">
        {content}
        <canvas className="modelCanvas" ref="graph" />
      </Panel>
    );
  }
}

const getModelTypeFilter = (modelTypes) => {
	const models = modelTypes.toSet();
	if(models.size <= 0){
		return () => true;
	}
	return model => {
		let mv = model.sub ? model.sub() : model;
		if(!mv){
			mv = Seq(model.all()).first();
			//TODO: add currentVerion from the model is not set correctly for my models: (
				if(!mv){
				return true;
			}
		}
		return models.has(mv.modelType);
	}
}

const translatedContent = injectIntl(Content);
translatedContent.extractPropsFromState = (({cardData, modelFilter, loadedContent}) => ({cardData, modelFilter, loadedContent}));

const Header = (props) => {
	let { view, user, models, cardData, entities, sections, section, search, actions } = props;
	let component = null;
	const state = view.getState();
	const modelFilter = state.modelFilter;
	const modelTypes = getModelTypes(modelFilter);

	const modelCount = (e,k) => {
		//to handle nested sections :)
		if(cardData && !cardData[k]){
			const section = props.sections[k];
			if(section){
				if(!section.source && !section.el){
					const newk = Seq(section).filter((v, k) => {
						if(v && v.el){
							return false;
						}
						return true;
					}).keySeq().first();
					
					if(newk){
						k = newk;
					}

				}
			}
		}

		let count = 0;
		if(cardData && cardData[k]){
			count = cardData[k].length;

			//my models are exception >> add unsaved models :)
			const loadedIdsSet = new Set((cardData[k]).map(e=>parseInt(e)).filter(e=>e));
			const source = e?.source;
			if(source && k.includes('My')){
				count+= source(getCur(models, modelTypes), user)
												.map((e) => (e.top || e))
												.filter((m) => !loadedIdsSet.has(parseInt(m.id)))
												.filter(getModelTypeFilter(modelTypes))
												.count();
			}

		}

    return count;
  };

  if (entities) {
    if (search) {
      const count = search.data().count();
      component = (
        <span>
          <span className="font-bold">{count}</span> {`${cc._.pluralize('model', count)} found for `} <i>{search.value}</i>
        </span>
      );
    } else {
      sections = Seq(sections).filter((e) => e);
      if (!user.id) {
        sections = sections.filterNot((e) => e.source && e.user).cacheResult();
      }

			const showModelControl = !Application.isEducation;

      component = (
				<React.Fragment>
					<ul className="catalog" style={ { display: 'inline-block', borderRight: showModelControl ? '1px solid gray' : undefined } }>
						{Seq(sections)
							.map((fetcher, name) => {
								const title = cc.context.translateLayoutKey(name);
								const toMatchTitle = section[0]?.replace(/\s/g, '');

								return (
									<li
										key={name}
										className={classnames({ selected: name.includes(toMatchTitle) })}
										onClick={actions.onSection.bind(null, [name])}>
										{
											fetcher.el ?
												(<fetcher.el.Header section={name} />) :
												`${title} (${modelCount(fetcher, name)})`
										}
									</li>
								);
							})
							.toList().toArray()}
					</ul>
					{showModelControl && (
						<ModelControl
							style={ { marginLeft: '24px', display: 'inline-block', position: 'relative' } }
							value={view.getState().modelFilter}
							onChange={e => {
								view.setState({ previousModelFilter: state.modelFilter});
								view.setState({ modelFilter: e });
							}}/>
					)}
				</React.Fragment>
      );
    }
  } else {
		component = (
			<ul className="catalog">
				{Seq(sections)
					.map((fetcher, name) => {
						const title = cc.context.translateLayoutKey(name);
						return (
							<li
								key={name}
								className={classnames({ selected: name === section[0] })}
								onClick={actions.onSection.bind(null, [name])}>
								{
									fetcher.el ?
										(<fetcher.el.Header section={name} />) :
										`${title} (${modelCount(fetcher, name)})`
								}
							</li>
						);
					})
					.toList().toArray()}
			</ul>
		)
	}

  return component;
};

const Actions = ({ view, section, actions }) =>
  Utils.pick(
    {
      table: {
        type: Checkbox,
        value: view.getState().table,
        onEdit: (e) => {
          view.setState({ table: e });

          if (e && section.length > 1) {
            section = [section[0]];
            actions.onSection(section);
          }
        },
      },
    },
    !Application.isEducation,
  );

function setTargetSectionForLoad(path, main) {
		return (
			[
				"translate:ModelDashBoard.Research.LabelRecentlyPublished",
				"translate:ModelDashBoard.Research.LabelMostPopular",
				"translate:ModelDashBoard.Research.LabelRecommendedToYou"
			].includes(path[1])
		) ? path[1] : main;
	}
export default view(translatedContent, Header, Actions);
export {
	Card, ModelCard
}