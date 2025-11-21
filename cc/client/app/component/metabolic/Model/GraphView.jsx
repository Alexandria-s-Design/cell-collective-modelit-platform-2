import React from 'react';
import { Seq } from 'immutable';
import { FormattedMessage } from 'react-intl';

import view from '../../base/view';
import Panel from '../../base/panel';
import CompartmentControl from './CompartmentControl';
import utils from '../../../utils';
import { format } from "date-fns"
import fluxviz from '../../../fluxviz';

import { createMetabolite, removeMetabolite } from './MetabolitesView';
import { ModelEvents } from '../../modelMixin';

const MODEL_STATE_GRAPH_KEY = ['CBMModel', 'graph'];

export const GraphViewBuilder = ({ viewable = false } = {}) => {
  class Content extends React.Component {
    constructor(props) {
      super(props);
      ModelEvents.addListener('modelSaved', this.handleModelSavedEvent);
    }

    async update(props) {
      const { model, modelState } = props;

      const getVisibility = e => {
        const key = modelState.getIn(['Metabolite', 'visibility']);
        return key.get(e.id, true);
      };

      let modelCobra = model.cobra;
      let boundaryMetabolites = [];
      const getElementById = (seq, targetId) => seq.filter(obj => obj.id === targetId).first();
      modelCobra.reactions.forEach(reaction => {
        if (reaction.boundary) {
          const boundaryMet = getElementById(Seq(modelCobra.metabolites), Object.keys(reaction.metabolites)[0]);
          boundaryMetabolites.push({ ...boundaryMet, style: reaction.boundary });
        }
      });
      modelCobra.metabolites = modelCobra.metabolites.map(item1 => {
        const matchingItem = boundaryMetabolites.find(item2 => item2.id === item1.id);
        return matchingItem ? matchingItem : item1;
      });

      let updatedReactionsWithFlux = [];
      let updatedMetabolitesWithFlux = [];
      let filteredMetaboliteIds = [];

      const valueToPixels = value => {
        const baseValue = 0.001;
        const initialPixels = 1;
        const factor = Math.log10(value / baseValue);
        const pixels = initialPixels + Math.floor(factor);
        return pixels;
      };

      if (props.selected.Experiment) {
        const experimentId = props.selected.Experiment.id;
        let dataValues = modelState.getIn(['Experiment', 'fba', experimentId, 'data', 'fluxes']);

        dataValues = dataValues != undefined ? new Map(Object.entries(dataValues)) : undefined;
        let value = null;

        if (dataValues != undefined) {
          modelCobra.reactions.forEach(reaction => {
            value = dataValues.get(reaction.id);
            if (value != 0) {
              updatedReactionsWithFlux.push({ ...reaction, pixel: valueToPixels(value) });
              filteredMetaboliteIds.push(...Object.keys(reaction.metabolites));
            }
          });
          modelCobra.reactions = updatedReactionsWithFlux;
          const filteredMetaboliteIdsSet = new Set(filteredMetaboliteIds);
          modelCobra.metabolites.forEach(metabolite => {
            if (filteredMetaboliteIdsSet.has(metabolite.id)) {
              updatedMetabolitesWithFlux.push(metabolite);
            }
          });
          modelCobra.metabolites = updatedMetabolitesWithFlux;
        }
      }

      modelCobra &&
        Seq(modelCobra.metabolites).forEach(e => {
          e.notes = {
            fluxviz: {
              hide: !getVisibility(e),
            },
          };
        });

      const updateSelectedCompartment = node => {
        if (node) {
          const compartmentId = parseInt(node._id.replace('compartment:', ''));
          const c = Seq(model.Compartment).find((v, k) => k == compartmentId);
          props.actions.onSelect(c);
        } else {
          props.actions.onSelect(null || 'Compartment');
        }
      };

      let { graph, styles, nodes, renderCompartmentBasedGraph } = await fluxviz.render(this.refs.graph, modelCobra, updateSelectedCompartment, this.graphOptions || {});
      this.graphOptions = { styles };

      if (props.selected.Compartment) {
        const filteredNode = nodes.find(node => node.label === props.selected.Compartment.name);
        if (filteredNode) {
          const { compartmentBasedGraph, compartmentBasedStyles } = await renderCompartmentBasedGraph(filteredNode);
					if(compartmentBasedGraph) {
	          graph = compartmentBasedGraph;
	          this.graphOptions = { styles: compartmentBasedStyles };
					}
        }
      }

      if (graph) {
        props.actions.onEditModelState(MODEL_STATE_GRAPH_KEY, graph);
      }
    }

    async componentDidMount() {
      await this.update(this.props);
      if (!this.props.model.coverImage && this.props.model.id > 0) {
        this.handleModelSavedEvent(this.props.model.id);
      }
    }

    shouldComponentUpdate(props, state) {
      return (
        this.props.entities !== props.entities ||
        this.props.modelState.get('Metabolite') !== props.modelState.get('Metabolite') ||
        this.props.modelState.get('Reaction') !== props.modelState.get('Reaction') ||
        this.props.modelState.get('Experiment') !== props.modelState.get('Experiment') ||
        this.props.selected.Experiment !== props.selected.Experiment ||
        JSON.stringify(this.props.selected.Compartment) !== JSON.stringify(props.selected.Compartment)
      );
    }

    getGraphImage = () => {
      const graph = this.props.modelState.getIn(MODEL_STATE_GRAPH_KEY);
      if (!graph) return null;
      graph.draw();
      return graph.image();
    };

    async componentDidUpdate(prevProps) {
      this.props.entities !== prevProps.entities ||
      this.props.modelState.get('Metabolite') !== prevProps.modelState.get('Metabolite') ||
      this.props.modelState.get('Reaction') !== prevProps.modelState.get('Reaction') ||
      this.props.modelState.get('Experiment') !== prevProps.modelState.get('Experiment') ||
      this.props.selected.Experiment !== prevProps.selected.Experiment ||
      this.props.selected.Compartment !== prevProps.selected.Compartment
        ? await this.update(this.props)
        : null;
    }

    handleModelSavedEvent = ({ id }) => {
      const image = this.getGraphImage();
      if (image) {
        const modelId = id || this.props.model.accessId;
        this.props.actions.saveGraphImage(modelId, image);
      }
    };

    componentWillUnmount() {
      ModelEvents.removeListener('modelSaved', this.handleModelSavedEvent);
    }

    render() {
      const { props } = this;
      const { view } = props;
      const squareStyles = {
        content: '"\\25A0"',
        position: 'absolute',
        left: 0,
        top: '50%',
        transform: 'translateY(-50%)',
        width: '20px',
        height: '20px',
        marginRight: '10px',
        lineHeight: '20px',
      };
      const listItemStyles = {
        position: 'relative',
        paddingLeft: '30px',
      };

      return (
        <Panel {...view}>
          {this.props.selected.Compartment ? (
            // diplay compartment based graph with metabolites as nodes with legend for sinks, exchanges and demands
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <div style={{ height: '90%', position: 'relative' }}>
                <canvas ref="graph" id="graph" />
              </div>
              <div className="legend" style={{ alignItems: 'center', flexGrow: '1', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', height: '10%' }}>
                <div className="legend-item" style={listItemStyles}>
                  <span style={{ ...squareStyles, backgroundColor: 'rgb(255,0,0)' }}></span> Exchanges{' '}
                </div>
                <div className="legend-item" style={listItemStyles}>
                  <span style={{ ...squareStyles, backgroundColor: 'rgb(0,0,255)' }}></span> Demands{' '}
                </div>
                <div className="legend-item" style={listItemStyles}>
                  <span style={{ ...squareStyles, backgroundColor: 'rgb(0,255,0' }}></span> Sinks{' '}
                </div>
              </div>
            </div>
          ) : (
            // display model graph with compartments as nodes without legend
            <canvas ref="graph" id="graph" />
          )}
        </Panel>
      );
    }
  }

  const Actions = (props) => {
    let {
      editable,
     
      model,
      modelState,
    } = props;
    editable = editable && !viewable;

		const getImage= () => {
			const graph = modelState.getIn(MODEL_STATE_GRAPH_KEY);
			graph.draw();
			return graph.image()
		}

		return utils.pick({
			compartment: (
				<span>
					<CompartmentControl {...props} editable={editable}/>
					<span>Metabolites: </span>
				</span>
			),
			add: editable && {
				title: "Create a new Metabolite",
				action: (() => createMetabolite(props))
			},
			remove: editable && {
				title: "Remove a Metabolite",
				action: (() => removeMetabolite(props))
			},

			download: Seq(model.Compartment).size && (() => {
				const date_timeStamp = format(new Date(), "MMMM d, yyyy hh:mm aaaaa'm'");
				const filename = `${model.top.name}_${date_timeStamp}.png`
				utils.downloadBinary(filename, getImage())
		}),

		}, editable);
	};

	const Info = ({ editable }) => (editable && (
		<FormattedMessage
			id="MetabolicGraphView.KeyBoardShortcuts"
			defaultMessage={`
				<span>
					<p>Keyboard Shortcuts</p>
				</span>
				Click on node to go a level deeper
			`}
			values={{
				span: chunk => <span>{chunk}</span>,
				p: chunk => <p>{chunk}</p>
			}}
      />
    ));

  return view(Content, null, Actions, {}, [], Info);
};

export default GraphViewBuilder();
