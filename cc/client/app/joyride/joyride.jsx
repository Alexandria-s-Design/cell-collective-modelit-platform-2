import React from 'react';
import { Seq } from 'immutable';
import { FormattedMessage } from 'react-intl';

export default class JoyRide {
  static joyridePhase1(layout) {
    /* Phase 1 */

    const joyrideStepsHomePhase1 = [
      {
        title: <FormattedMessage id="JoyRide.joyrideStepsHomePhase1.CreateNew" defaultMessage="Create a New Model" />,
        text: (
          <FormattedMessage
            id="Dashboard.joyrideStepsHomePhase1.ClickOn"
            defaultMessage={'Click on {photo} icon to create a new model'}
            values={{ photo: <img src="/assets/images/joyride/add.png" className="joyride-icons" /> }}
          />
        ),
        selector: '.large-add',
        position: 'top-left',
        type: 'hover',
        isFixed: true,
      },

      {
        title: (
          <FormattedMessage
            id="Dashboard.joyrideStepsHomePhase1.BrowseCatalog"
            defaultMessage="Browse the Catalog of Available Models"
          />
        ),
        text: (
          <FormattedMessage
            id="Dashboard.joyrideStepsHomePhase1.PublishMyModelsSharedWithMe"
            defaultMessage="
						<ul>
				<li><strong>PUBLISHED</strong> MODELS are peer-reviewed, published models made available to the ModelIt! community for simulations and further contributions.</li>
				<li><strong>MY MODELS</strong> contain models constructed and owned by you.</li>
				<li><strong>SHARED WITH ME</strong> are models that other users shared directly with you. Use this feature to directly build and analyze models with your collaborators (without sending model SBML files back and forth).<br/></li>
				<li><b>Scroll Right to see more Models!</b></li>
					</ul>"
					values={{
						ul: chunk => <ul>{chunk}</ul>,
						li: chunk => <li>{chunk}</li>,
						strong: chunk => <strong>{chunk}</strong>,
						b: chunk => <b>{chunk}</b>,
						br: <br />,
					}}
          />
        ),

        selector: '.catalog',
        position: 'top-left',
        beacon: {
          offsetX: 5000,
        },
        type: 'hover',
        isFixed: true,
      },
      {
        title: (
          <FormattedMessage
            id="Dashboard.joyrideStepsHomePhase1.CellCollectiveTutorials"
            defaultMessage="ModelIt! Tutorials"
          />
        ),

        text: (
          <FormattedMessage
            id="Dashboard.joyrideStepsHomePhase1.YouMayClick"
            defaultMessage={
              'You may click the {photo} icon at any time to learn about the many features of ModelIt!.'
            }
            values={{ photo: <img src="/assets/images/joyride/help.png" className="joyride-large-icon" /> }}
          />
        ),
        selector: '.large-help',
      },
    ];

    const joyrideStepsModelPhase1 = [
      {
        title: <FormattedMessage id="Dashboard.joyrideStepsModelPhase1.VisualEditor" defaultMessage="Visual Editor" />,
        text: (
          <FormattedMessage
            id="Dashboard.joyrideStepsModelPhase1.ClickOnTheIcon"
            defaultMessage={
              'Click on the icon to switch between {photo1} (View Mode) and {photo2} (Edit Mode). Double Click on an empty space to add a new component. Double Click Label to rename component. Shift + Right-click component to switch between internal or external components. Switch between positive or negative interaction by Shift + left-clicking the connecting line.'
            }
            values={{
              photo1: <img src="/assets/images/joyride/edit-gray.png" />,
              photo2: <img src="/assets/images/joyride/visibility.png" />,
            }}
          />
        ),
        selector: '.phase1-model1',
      },
      {
        title: (
          <FormattedMessage id="Dashboard.joyrideStepsModelPhase1.AddComponent" defaultMessage="Add Component" />
        ),

        text: (
          <FormattedMessage
            id="Dashboard.joyrideStepsModelPhase1.NewModelComponents"
            defaultMessage={
              'New model components may also be added by clicking here on {photo}. Double-click label to edit component name.'
            }
            values={{ photo: <img src="/assets/images/joyride/add-gray.png" className="joyride-icons" /> }}
          />
        ),
        selector: '.phase1-model2',
      },
      {
        title: <FormattedMessage id="Dashboard.joyrideStepsModelPhase1.AddRegulator" defaultMessage="Add Regulator" />,
        text: (
          <FormattedMessage
            id="Dashboard.joyrideStepsModelPhase1.ToAddAnActivatorOr"
            defaultMessage={
              'To add an activator or inhibitor, drag and drop components from the list of Internal Components or External Components to the appropriate Drop Component dialogue box.'
            }
          />
        ),
        selector: '.phase1-model3',
      },
      {
        title: <FormattedMessage id="Dashboard.joyrideStepsModelPhase1.Save" defaultMessage="Save" />,
        text: (
          <FormattedMessage
            id="Dashboard.joyrideStepsModelPhase1.ClickOn"
            defaultMessage={'Click on {photo} icon to save your changes.'}
            values={{ photo: <img src="/assets/images/joyride/save.png" className="joyride-large-icon" /> }}
          />
        ),
        selector: '.large-save',
      },
    ];

    const joyrideStepsSimulationPhase1 = [
      {
        title: (
          <FormattedMessage
            id="Dashboard.joyrideStepsSimulationPhase1.SetExternalCond"
            defaultMessage="Set External Conditions"
          />
        ),
        text: (
          <FormattedMessage
            id="Dashboard.joyrideStepsSimulationPhase1.UseTheSimpleSlider"
            defaultMessage="Use the simple slider to set the external conditions (i.e. the simulation inputs). Levels may also be varied during a simulation to visualize changes in the dynamics of the system in real-time. This is analogous with varying the environment of a biological system and observing its response."
          />
        ),
        selector: '.sim1-phase1',
      },
      {
        title: (
          <FormattedMessage
            id="Dashboard.joyrideStepsSimulationPhase1.UseTheSimpleSlider"
            defaultMessage="Use the simple slider to set the external conditions (i.e. the simulation inputs). Levels may also be varied during a simulation to visualize changes in the dynamics of the system in real-time. This is analogous with varying the environment of a biological system and observing its response."
          />
        ),
        text: (
          <FormattedMessage
            id="Dashboard.joyrideStepsSimulationPhase1.SelectTheCheckbox"
            defaultMessage={
              'Select the checkbox  below the visibility {photo} icon for the components you want to visualize on the Simulation Graph. Hovering over the component label will highlight its trendline, allowing you to quickly locate the component within a busy graph!'
            }
            values={{ photo: <img src="/assets/images/joyride/visibility.png" /> }}
          />
        ),
        selector: '.sim2-phase1',
      },
      {
        title: (
          <FormattedMessage
            id="Dashboard.joyrideStepsSimulationPhase1.SitmulationControls"
            defaultMessage="Simulation Controls"
          />
        ),
        text: (
          <FormattedMessage
            id="Dashboard.joyrideStepsSimulationPhase1.Click"
            defaultMessage={
              'Click {photo1} icon to start the simulation. You may also click {photo2} to pause the simulation at any time or reset the simulation by clicking on {photo3} icon. '
            }
            values={{
              photo1: <img src="/assets/images/joyride/run.png" className="joyride-icons" />,
              photo2: <img src="/assets/images/joyride/pause.png" className="joyride-icons" />,
              photo3: <img src="/assets/images/joyride/stop.png" className="joyride-icons" />,
            }}
          />
        ),
        selector: '.sim3-phase1',
      },
    ];

    const joyrideStepsAnalysisPhase1 = [
      {
        title: (
          <FormattedMessage
            id="Dashboard.joyrideStepsAnalysisPhase1.AddNewExperiment"
            defaultMessage="Add New Experiment"
          />
        ),
        text: (
          <FormattedMessage
            id="Dashboard.joyrideStepsAnalysisPhase1.ClickOn"
            defaultMessage={
              'Click on {photo} icon to create a new experiment. Experiments are renamed directly by clicking on the label.'
            }
            values={{ photo: <img src="/assets/images/joyride/add-gray.png" className="joyride-icons" /> }}
          />
        ),
        selector: '.analysis1-phase1',
      },
      {
        title: (
          <FormattedMessage
            id="Dashboard.joyrideStepsAnalysisPhase1.SetExternalConditionsTwo"
            defaultMessage="Set External Conditions"
          />
        ),
        text: (
          <FormattedMessage
            id="Dashboard.joyrideStepsAnalysisPhase1.UseSimpleSliderTwo"
            defaultMessage="Use the simple slider to set the external conditions (i.e. the simulation inputs) for the experiment. This is analogous with setting the external signals a biological system encounters within its environment, influencing its biological response."
          />
        ),
        selector: '.analysis2-phase1',
      },
      {
        title: (
          <FormattedMessage
            id="Dashboard.joyrideStepsAnalysisPhase1.InitiateExperiment"
            defaultMessage="Initiate Experiment"
          />
        ),

        text: (
          <FormattedMessage
            id="Dashboard.joyrideStepsAnalysisPhase1.ClickOnIcon"
            defaultMessage={'Click on  {photo} iicon to start the simulation.'}
            values={{ photo: <img src="/assets/images/joyride/run.png" className="joyride-icons" /> }}
          />
        ),

        selector: '.analysis3-phase1',
      },
      {
        title: (
          <FormattedMessage
            id="Dashboard.joyrideStepsAnalysisPhase1.SelectGraphComponents"
            defaultMessage="Select Graph Components"
          />
        ),
        text: (
          <FormattedMessage
            id="Dashboard.joyrideStepsAnalysisPhase1.Dose-ResponseGraphs"
            defaultMessage="Dose-response graphs may be generated for any component in the model by selecting the appropriate component for the X and Y-axis. In general, an external component is represented on the X-axis (the pendent variable) whereas internal components are represented on the Y-axis (the dependent variables). Multiple dose-response curves may be generated from a single experiment."
          />
        ),
        selector: '.analysis4-phase1',
      },
    ];
    let steps;

    switch (layout) {
      case '.Layout[Home]':
        steps = joyrideStepsHomePhase1;
        break;
      case '.Layout[Model]':
        steps = joyrideStepsModelPhase1;
        break;
      case '.Layout[Analysis]':
        steps = joyrideStepsAnalysisPhase1;
        break;
      case '.Layout[Simulation]':
        steps = joyrideStepsSimulationPhase1;
        break;
      default:
        break;
    }

    return steps;
  }

  static joyridePhase2(layout) {
    const joyrideStepsHomePhase2 = [
      {
        title: <FormattedMessage id="Dashboard.joyrideStepsHomePhase2.SearchLabel" defaultMessage="Search" />,
        text: (
          <FormattedMessage
            id="Dashboard.joyrideStepsHomePhase2.YouMaySearch"
            defaultMessage="You may search for models by title, description, tags or protein name. A single query will search the Published Models, My Models, and Shared with Me catalogs concurrently."
          />
        ),
        selector: '.large-search',
      },
      {
        title: (
          <FormattedMessage
            id="Dashboard.joyrideStepsHomePhase2.ChangeBetweenList"
            defaultMessage="Change between List and Grid View"
          />
        ),
        text: (
          <FormattedMessage
            id="Dashboard.joyrideStepsHomePhase2.YouCanChangeYour"
            defaultMessage="You can change your view between list view and grid view."
          />
        ),
        selector: '.base-table',
        position: 'top',
        beacon: {
          offsetX: 5000,
        },
      },
      {
        title: (
          <FormattedMessage id="Dashboard.joyrideStepsHomePhase2.YourAccountMenu" defaultMessage="Your Account Menu" />
        ),
        text: (
          <FormattedMessage
            id="Dashboard.joyrideStepsHomePhase2.InThisMenu"
            defaultMessage="In this menu you can edit your user profile, change your password, and logout."
          />
        ),
        selector: '.large-account',
      },
    ];

    const joyrideStepsModelPhase2 = [
      {
        title: (
          <FormattedMessage
            id="Dashboard.joyrideStepsModelPhase2.ConditionsAndSubConditions"
            defaultMessage="Conditions and SubConditions"
          />
        ),
        text: (
          <FormattedMessage
            id="JoyDashboardRide.joyrideStepsModelPhase2.Conditions(OrSubConditions)"
            defaultMessage="Conditions (or SubConditions) are used to model cooperative or disjointed dependencies between one or more interacting partners. Click on add icon to open the Conditions panel, drag and drop the appropriate components to the (drop component) dialogue box and specify if the Condition must be Active or Inactive."
          />
        ),
        selector: '.phase1-model3',
      },
      {
        title: (
          <FormattedMessage
            id="Dashboard.joyrideStepsModelPhase2.AddindAndTaggingR"
            defaultMessage="Adding and Tagging References"
          />
        ),
        text: (
          <FormattedMessage
            id="Dashboard.joyrideStepsModelPhase2.ClickOn"
            defaultMessage={
              'Models are annotated and referenced using the Knowledge Base. Click on {photo1} to add content and {photo2} to add references. Simply enter the PubMed Identifier (PMID) to seamlessly format and integrate citations. References may be tagged according to publication and data type. Simply right-click on the reference and select the tag you want to add.'
            }
            values={{
              photo1: <img className="joyride-icons" src="/assets/images/joyride/add-gray.png" />,
              photo2: <img className="joyride-icons" src="/assets/images/joyride/reference.png" />,
            }}
          />
        ),
        selector: '.phase2-model',
      },
      {
        title: <FormattedMessage id="JoyRide.joyrideStepsModelPhase2.Share" defaultMessage="Share" />,
        text: (
          <FormattedMessage
            id="Dashboard.joyrideStepsModelPhase2.Collaboration"
            defaultMessage={
              'Collaboration is key to new discoveries using the systems approach - and is at the heart of ModelIt! Clicking on {photo} takes you to the Share page, enabling you to add collaborators, create shareable links and publish experiments.'
            }
            values={{ photo: <img src="/assets/images/joyride/share.png" className="joyride-large-icon" /> }}
          />
        ),
        selector: '.large-share',
      },
    ];
    const joyrideStepsSimulationPhase2 = [
      {
        title: (
          <FormattedMessage id="Dashboard.joyrideStepsSimulationPhase2.AddMutations" defaultMessage="Add Mutations" />
        ),
        text: (
          <FormattedMessage
            id="Dashboard.joyrideStepsModelPhase2.SelectTheComponentYou"
            defaultMessage="Select the component you would like to mutate. Clicking the box once is a loss-of-function mutation (indicated by a red checkmark), and clicking the box twice is a gain-of-function mutation (indicated by a green checkmark). Clicking through a third time removes the mutation. Mutations may be introduced before or during a simulation to visualize changes on the dynamics in real-time."
          />
        ),
        selector: '.sim1-phase2',
      },
      {
        title: (
          <FormattedMessage
            id="Dashboard.joyrideStepsSimulationPhase2.AddInitialState"
            defaultMessage="Add Initial State"
          />
        ),
        text: (
          <FormattedMessage
            id="Dashboard.joyrideStepsSimulationPhase2.ClickToCreate"
            defaultMessage={
              ' Click {photo} to create an initial state. Once an initial state is created, the  icon is displayed within the Internal Components panel. From this column, select the components you want active at the beginning of a simulation (t=0).'
            }
            values={{ photo: <img src="/assets/images/joyride/add-gray.png" className="joyride-icons" /> }}
          />
        ),
        selector: '.sim2-phase2',
      },
      {
        title: (
          <FormattedMessage
            id="Dashboard.joyrideStepsSimulationPhase2.SimultionFlow"
            defaultMessage="Simulation Flow"
          />
        ),
        text: (
          <FormattedMessage
            id="Dashboard.joyrideStepsSimulationPhase2.ClickToRecord"
            defaultMessage={
              ' Click {photo} to record a simulation flow. The icon will turn green once the recording is in progress. Changes in experimental conditions or mutations, and their respective time-point interval occurrences, are recorded and saved within a simulation flow, enabling re-running of preset experiments.'
            }
            values={{ photo: <img src="/assets/images/joyride/recording.png" className="joyride-icons" /> }}
          />
        ),
        selector: '.sim3-phase1',
      },
    ];
    const joyrideStepsAnalysisPhase2 = [
      {
        title: (
          <FormattedMessage id="Dashboard.joyrideStepsAnalysisPhase2.SimulationFlow" defaultMessage="Simulation Flow" />
        ),
        text: (
          <FormattedMessage
            id="Dashboard.joyrideStepsAnalysisPhase2.MultipleExperimentsMay"
            defaultMessage="Multiple experiments may be selected using the checkboxes. Once selected, you may remove, copy, or re-run the experiments simultaneously. This is especially useful for updating experiments after making a change to a model’s regulatory mechanism. "
          />
        ),
        selector: '.selection',
      },
      {
        title: (
          <FormattedMessage
            id="Dashboard.joyrideStepsAnalysisPhase2.SimulationFlowTwo"
            defaultMessage="Simulation Flow"
          />
        ),
        text: (
          <FormattedMessage
            id="Dashboard.joyrideStepsAnalysisPhase2.Collaboration"
            defaultMessage={
              ' Click {photo} next to Simulation Flow: label to create a simulation flow. Analysis simulation flows cannot be recorded, therefore, the external conditions (i.e. inputs) or mutations, and their range (i.e. time-point occurrences) must be pre-defined manually. Read the tutorial Simulation Flows for more details.'
            }
            values={{ photo: <img src="/assets/images/joyride/add-gray.png" className="joyride-icons" /> }}
          />
        ),
        selector: '.analysis2-phase2',
      },
      {
        title: (
          <FormattedMessage id="Dashboard.joyrideStepsAnalysisPhase2.DownLoadGraph" defaultMessage="Download Graph" />
        ),
        text: (
          <FormattedMessage
            id="Dashboard.joyrideStepsAnalysisPhase2.OnceYouHave"
            defaultMessage="Once you have a graph presented here you can download the Activity Relationship Graph as a PNG file by clicking here."
          />
        ),
        selector: '.analysis3-phase2',
      },
    ];
    const joyrideStepsSharingPhase2 = [];

    let steps;

    switch (layout) {
      case '.Layout[Home]':
        steps = joyrideStepsHomePhase2;
        break;
      case '.Layout[Model]':
        steps = joyrideStepsModelPhase2;
        break;
      case '.Layout[Analysis]':
        steps = joyrideStepsAnalysisPhase2;
        break;
      case '.Layout[Simulation]':
        steps = joyrideStepsSimulationPhase2;
        break;
      default:
        steps = [];
    }

    return steps;
  }

  static joyrideLayouts(layout, phase) {
    const def = {
      style: {
        backgroundColor: '#f3f3f3',
        borderRadius: '2.5%',
        color: '#333',
        mainColor: '#333',
        width: '25rem',
        beacon: {
          inner: '#f63',
          outer: '#f42',
        },
        close: {
          display: 'none',
        },
        hole: {
          backgroundColor: 'rgba(225,255,255,0.45)',
        },
      },
      isFixed: true,
      position: 'top',
      type: 'hover',
    };
    let cb;
    if (phase === 1) cb = this.joyridePhase1(layout);
    else if (phase == 2) cb = this.joyridePhase2(layout);
    else cb = [];
    return Seq(cb)
      .map(e =>
        Seq(def)
          .concat(e)
          .toObject(),
      )
      .toArray();
  }
}
