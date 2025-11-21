import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Seq } from 'immutable';
import Persist from '../../mixin/persist';
import util from '../../utils';
import view from '../base/view';
import Panel from '../base/panel';
import modelGraph from './modelGraph';
import LayoutControl from './layoutControl';
import MetadataImage from '../description/metadataImage';
import Component from '../../entity/Component';
import Application from '../../application';
import Remove from '../../action/remove';
import Update from "../../action/update";
import { capture, CaptureModal } from '../../capture';
import { format } from 'date-fns';
import { ModelEvents } from '../modelMixin';

export const GraphViewBuilder = ({ modelType = 'boolean' } = {}) => {
  const ModelGraph = modelGraph();
  class Content extends React.Component {
    constructor(props) {
      super(props);
      this.state = { deleteKey: false };
      ModelEvents.addListener('modelSaved', this.handleModelSavedEvent);
    }

    componentDidMount() {
			this.syncLayoutComponentCoordinates();
      if (!this.props.model.coverImage && this.props.model.id > 0) {
        this.handleModelSavedEvent(this.props.model.id);
      }
    }

    disableDeleteKey(v) {
      this.setState({ deleteKey: v });
    }

    handleModelSavedEvent = ({ id }) => {
      if (this.refs.self) {
        const modelImage = this.refs.self.image;
        if (modelImage) {
          const modelId = id || this.props.model.accessId;
          this.props.actions.saveGraphImage(modelId, modelImage);
        }
      }
    };
    componentWillUnmount() {
      ModelEvents.removeListener('modelSaved', this.handleModelSavedEvent);
    }

		syncLayoutComponentCoordinates() {
			if (this.props.selected.Layout) {
				const layoutComps = Seq(this.props.selected.Layout.components);
				const updateComps = [];
				layoutComps.forEach((node) => {
					updateComps.push(new Update(node.component, "x", node.x));
					updateComps.push(new Update(node.component, "y", node.y));
				});
				this.props.actions.batch(updateComps);
			}
		}

    render() {
      const props = this.props;
      const viewState = props.view.getState();

      return (
        <Panel {...props.view} className="phase1-model1 panel-svg">
          <CaptureModal view={props.view} />
          <ModelGraph imageVisible={viewState.imageVisible} {...props} ref="self" deleteKey={this.state.deleteKey} disableDeleteKey={this.disableDeleteKey.bind(this)} />
        </Panel>
      );
    }
  }

  const actions = (props, reference) => {
    const {
      model,
      view,
      state,
      user,
      actions,
      selected: { Component: component, LearningActivity: learningActivity },
      subSelected,
    } = props;
    let editable = props;
    const isImageVisible = view.getState().imageVisible;
    const ics = view.getState().imageCaptureState || 0;

    const isLearning = Application.domain === 'learning';
    const isResearch = Application.domain === 'research';

    if (isResearch) {
      editable = true;
    }

    const list = util.pick(
      {
        layout: (
          <span>
            <LayoutControl {...props} />
          </span>
        ),

        add: editable && {
          title: 'Create new Component',
          action: () => actions.onAdd(new Component({ name: Application.defNameExt(model.Component, '', /^[A-Z]\d*$/i), isExternal: true }), true),
        },
        remove: editable &&
          component && {
            title: 'Remove selection',
            action: () => {
              const subNodes = Seq(subSelected)
                .map(v => Seq(v).valueSeq())
                .valueSeq()
                .flatten(true);
              if (!subNodes.isEmpty()) {
                actions.onSelect(component);
                actions.batch(
                  Seq(subNodes)
                    .map(v => new Remove(v))
                    .toArray(),
                );
              } else {
                actions.onRemove(component);
              }
            },
          },

        background: editable && <MetadataImage entity={Seq(model.mBackgroundImage).first()} name="BackgroundImage" title="Background Image" user={state.user} actions={actions} />,

        download:
          Seq(model.Component).size &&
          (() => {
            let filename;
            const date_timeStamp = format(new Date(), "MMMM d, yyyy hh:mm aaaaa'm'");
            if (learningActivity) {
              const laName = (learningActivity && learningActivity.name + '_') || '';
              filename = `${model.top.Persisted}_${laName}_${date_timeStamp}.png`;
            } else {
              filename = `${model.top.name}_${date_timeStamp}.png`;
            }
            const image = reference('self').image;

            util.downloadBinary(filename, image);
          }),

        // capturing and saving an image of the model on the server
        copy:
          isLearning && user.id
            ? ics === 0
              ? {
                  title: 'Capture Model Image',
                  action: () => {
                    const data = reference('self').image;
                    capture(data, props.view, props.model, 'model');
                  },
                }
              : false
            : editable, // this is a hack: if we are not on Learn, this expression will evaluate to whatever 'editable' is and this icon will be removed by util.pick
      },
      editable,
    );

    return list;
  };

  const info = ({ editable }) =>
    editable && (
      <FormattedMessage
        id="ModelGraphView.ComponentName.KeyBoardShortcuts"
        defaultMessage={
          ' <span> <p>Keyboard Shortcuts</p> <ul> <li><strong> Delete Component or Arrow: </strong><code> Delete; (Mac Users) fn + Delete</code></li> <li><strong> Toggle Component (Internal <--> External): </strong><code> Shift + Click component</code></li> <li><strong> Toggle Arrow (Postive <--> Negative): </strong><code> Shift + Click arrow</code></li> <li><strong> Add Component: </strong><code> Double click white space</code></li> </ul>  </span> '
        }
				values={{
					span: chunk => <span>{chunk}</span>,
					p: chunk => <p>{chunk}</p>,
					ul: chunk => <ul>{chunk}</ul>,
					li: chunk => <li>{chunk}</li>,
					strong: chunk => <strong>{chunk}</strong>,
					code: chunk => <code>{chunk}</code>,
				}}
      />
    );

  const transfK = v => v.replace(/(\.Layout\[[^\]]+\])\[[0-9]+\]/i, (_, l) => l);
  const Pers = Persist(
    {
      imageVisible: false,
    },
    k => (k = transfK(k) && (localStorage[k] ? JSON.parse(localStorage[k]) : undefined)),
    (k, v) => (k = transfK(k) && ((localStorage[k] = JSON.stringify(v)), v)),
    'modelGraphView',
    { imageVisible: true },
  );

  return view(Content, null, actions, {}, [Pers], info);
};

export default GraphViewBuilder();
