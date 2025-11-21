import React from 'react';
import { Seq } from 'immutable';

import view from '../../base/view';
import Panel from '../../base/panel';
import CompartmentControl from './CompartmentControl';
import Compartment from '../../../entity/kinetic/Compartment';
import Application from '../../../application';
import Add from '../../../action/add';
import utils from '../../../utils';
import fluxviz from '../../../fluxviz';
import { createSpecies, removeMetabolite } from './SpeciesView';
import { ModelEvents } from '../../modelMixin';

const MODEL_STATE_GRAPH_KEY = ['KineticModel', 'graph'];
export const GraphViewBuilder = ({ viewable = false } = {}) => {
  class Content extends React.Component {
    constructor(props) {
      super(props);
      this.graph = React.createRef();
      ModelEvents.addListener('modelSaved', this.handleModelSavedEvent);
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
				this.props.selected.Compartment !== props.selected.Compartment
      );
    }

    async update(props) {
      const { model } = props;

      const fluxvizModel = model.fluxvizModel();

      const updateSelectedCompartment = node => {
        const compartment = Seq(props.model.Compartment).find(c => c.name === node.label);
        props.actions.onSelect(compartment || 'Compartment');
      };

      let { graph, styles, nodes, renderCompartmentBasedGraph } = await fluxviz.render(this.graph.current, fluxvizModel, updateSelectedCompartment, this.graphOptions || {}, props);

      if (props.selected.Compartment) {
        const filteredNode = nodes.find(node => node.label === props.selected.Compartment.name);
        if (filteredNode) {
          const { compartmentBasedGraph, compartmentBasedStyles } = await renderCompartmentBasedGraph(filteredNode);
          graph = compartmentBasedGraph;
          this.graphOptions = { styles: compartmentBasedStyles };
        }
      }
      if (graph) {
        props.actions.onEditModelState(MODEL_STATE_GRAPH_KEY, graph);
      }
      this.graphOptions = { styles };
    }

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

    getGraphImage = () => {
      const graph = this.props.modelState.getIn(MODEL_STATE_GRAPH_KEY);
      if (!graph) {
        return null;
      }
      graph.draw();
      return graph.image();
    };

    handleModelSavedEvent = ({ id }) => {
      console.log('Model saved event received successfully ' + id);
      const image = this.getGraphImage();
      console.log('before generating graph image');
      if (image) {
        const modelId = id || this.props.model.accessId;
        console.log('this is generating graph image', modelId);
        this.props.actions.saveGraphImage(modelId, image);
      }
    };

    componentWillUnmount() {
      ModelEvents.removeListener('modelSaved', this.handleModelSavedEvent);
    }

    render() {
      const { props } = this;
      const { view } = props;
      return (
        <Panel {...view}>
          <canvas ref={this.graph} id="graph" />
        </Panel>
      );
    }
  }

  const Actions = props => {
    let {
      editable,
      actions,
      model,
      selected: { Metabolite: metabolite, Compartment: compartment },
    } = props;
    editable = editable && !viewable;

    const data = model.Compartment ? Seq(model.Compartment) : Seq();

    const addCompartment = () => {
      const newCompartment = new Compartment({
        name: Application.defNameExt(data, 'c', /^c[A-Z]\d*$/i),
      });
      actions.batch(Seq([new Add(newCompartment)]));
    };

    const removeCompartment = e => {
      const message = `Do you wish to delete all metabolites, reactions and genes corresponding to ${e.name}?`;
      const options = {
        okText: 'FORCE',
        cancelText: 'DELETE',
        onCancel: () => {
          actions.onRemove(e);
        },
      };
      actions.onConfirm(
        message,
        () => {
          actions.onRemove(e);
        },
        options,
      );
    };

    return utils.pick(
      {
        compartment: (
          <span>
            <CompartmentControl {...props} editable={editable} panel="graph" />
            {compartment && 'Species:'}
            {!compartment && 'Compartment:'}
          </span>
        ),
        add:
          editable &&
          (compartment
            ? {
                title: 'Create a new Metabolite',
                action: () => createSpecies(props),
              }
            : { title: 'Add Compartment', action: () => addCompartment() }),
        remove:
          editable &&
          (compartment
            ? {
                title: 'Remove a Metabolite',
                action: () => removeMetabolite(props),
              }
            : { title: 'Remove Compartment', action: () => removeCompartment(compartment) }),
      },
      editable,
    );
  };

  const Info = ({ editable }) =>
    editable && (
      <div>
        <p>Keyboard Shortcuts</p>
        <p>Click on a Compartment Node, or select it from the</p>
        <p> “View” dropdown options, to go a level deeper.</p>
        <p>Right click to go back to previous compartment. </p>
      </div>
    );

  return view(Content, null, Actions, {}, [], Info);
};

export default GraphViewBuilder();
