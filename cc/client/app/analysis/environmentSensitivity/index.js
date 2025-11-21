import Immutable from 'immutable';
import SimulationDynamic from '../simulationDynamic';
import ComponentSensitivityAnalysis from './componentSensitivityAnalysis';
import EnvironmentOptimalizationAnalysis from './environmentOptimalizationAnalysis';

export default class {
    constructor(model, experiment, state, immediate) {
        this.model = model;
        this.e = experiment;

        let d;
        const genD = (o) => {
            d = this.data = {...o};
        };
        genD({ state: "RUNNING", phase: 0, percentComplete: 0, elapsedTime: 0 });

        //STATE AUTOMATON TO CALCULATE Analysis
        // phase 0 = generation of data through SimulationDynamic
        // phase 1 = component optimalization of data through
        // phase 1 = emnvironment optimalization of data through
        const stepsCnt = 3;
        const nextStep = () => {
            const calcPercent = (perc) => (d.phase/stepsCnt) + perc / stepsCnt;

            switch(d.phase){
              case 0:{
                const sd = this.simulation.data;
                d.percentComplete = calcPercent(sd.percentComplete);
                if(sd.state === 'COMPLETED'){
                  this._simulationData = this.simulation.data;
                  d.phase++;
                  this.analysis = new ComponentSensitivityAnalysis(model, experiment, this._simulationData.analysis, nextStep);
                }
                break;
              }
              case 1:{
                const sd = this.analysis.data;
                d.percentComplete = calcPercent(sd.percentComplete);
                if(sd.state === 'COMPLETED'){
                    genD({...d});
                    d.componentSensitivity = sd.analysis;
                    d.percentComplete = calcPercent(sd.percentComplete);
                    this.analysis = undefined;
                    this._envSensitivity = new EnvironmentOptimalizationAnalysis(model, experiment, this._simulationData.analysis, state.get('optimizeNodes') || new Immutable.Map(), nextStep);
                    d.phase++;
                }

                break;
              }
              case 2:{
                const sd = this._envSensitivity.data;
                d.percentComplete = {from: calcPercent(0), to: calcPercent(1)};
                if(sd.state === 'COMPLETED'){
                    d.environmentSensitivity = sd.analysis;
                    this._envSensitivity = undefined;
                    d.phase++;
                    nextStep();
                }

                break;
              }
              case 3: {
                d.percentComplete = 1;
                d.state = 'COMPLETED';
                break;
              }
              default:
                throw new Error("Unreachable");
            }
        }

        this.simulation = new SimulationDynamic(model, experiment, state, immediate, nextStep, state.get('ExperimentalCondition') || "DEATH");
    }
}
