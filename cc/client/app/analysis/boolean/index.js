import  { Seq } from 'immutable';
import handler from './handler';
import MyWorker from './feedbackLoops?worker';
import MyStateTransitionWorker from './stateTransitionGraph?worker';


export default class BooleanAnalysis {
    static doTopologyAnalysis(components, selected, props, onResult){

        const equations = [];
        const componentsByKey = {};

        const componentToKey = (compoenent) => ("C"+compoenent.id).replace(/-/g, "_");

        Seq(components).toArray().forEach(component => {
          componentsByKey[componentToKey(component)] = component;
					// NOTE: questionable solution for undefined in downloaded topology data
					// const prefixedKey = `${componentToKey(component)}__VARIABLE_PREFIXER__`;
  				// componentsByKey[prefixedKey] = component;
          if(component.expression(componentToKey).indexOf("false") < 0){
            equations.push(`${componentToKey(component)} = ${component.expression(componentToKey)}`.replace(/!/g, '~').replace(/&&/g, '*').replace(/\|\|/g, '+'))
          }
        });

        const getComponentFromKey = (k) => componentsByKey[k];

        if(selected === null){
          onResult({
            diameter : "",
            avgConn: undefined,
            averageShortestPath: undefined,
            cmatrix: "",
            distribution: "",
            inDegree: "",
            outDegree: "",
            closeness: "",
            feedbackLoops: "",
            shortestPair: "",
            worker: "",
            noResult: ""
          });
        }
        else {
          const func = {
                  'cmatrix': 'connectivityMatrix',
                  'shortestPair': 'allPairShortestPath',
                  'diameter' : 'diameter',
                  'averageShortestPath' : 'averageShortestPath',
                  'avgConn' : 'averageConnectivity',
                  'distribution' : 'connectivityDistribution',
                  'inDegree' : 'connectivityInDegree',
                  'outDegree' : 'connectivityOutDegree',
                  'closeness' : 'closenessCentrality'
          };

          selected = selected.getIn(['Topology', 'selection']).toObject();
          const s = Seq(func).filter((_,k) => selected[k]).map((v) => handler[v](equations, getComponentFromKey)).toObject();
          props.actions.onEditModelState(['Topology', 'data'], s);
          onResult(s);
        }
    }

    static getEqn(components, stateSpace){
      const tr = (e) => e.toString().replace('-', '_');
      const equations = Seq(components).map(c => {
            let r = ('N'+tr(c.id)+" = "+c.expression(e => 'N'+tr(e.id)));
            if(stateSpace) r = r.replace('false', '0').replace('true', '1');
            else r = r.replace("false", "falsy");
            return r.replace(/!/g, '~').replace(/&&/g, '*').replace(/\|\|/g, '+').replace(/-/g, '_');
      }).toArray();
      return equations;
    }

    static feedbackLoops(model, components, props, onResult){
      if(components === null){
        onResult({loops : null, feedbackFile: ''});
        return;
      }

		const eqn = BooleanAnalysis.getEqn(components);

		if(window.Worker){

        onResult({loops : Seq(), feedbackRunning: false, feedbackResult: ""});
        const worker = new MyWorker();
        worker.postMessage(JSON.stringify({eqn : eqn}));

			onResult({loops : Seq(), feedbackResult : "Please wait while we compute feedback loops..."});

			setTimeout(() => {
				worker.terminate();
				onResult({feedbackResult : "Feedback Loops unavailable!! Computation exceeds the time limit for this model!!"});
			}, 120000);

        worker.addEventListener('message', function(e) {
          let data = Seq(JSON.parse(e.data)).map((e, i)=>({"cycle" : Seq(e).map(e=>model.Component[e.substr(1).replace("_", '-')]) ,"id" : i, "type" : 0}));

          data = data.map((e) => ({ "entities": e.cycle, "type" : (e.type === 0) ? 'Negative' : 'Positive',  "name" : e.cycle.map(e => e.name).toArray().join(' -> ')}))
                    .groupBy(e => e.name).map((e) => e.get(0)).toIndexedSeq().map((e,i)=>((e.id=i),e)).cacheResult();


				const flFile = handler.feedbackLoopFile(data._cache);

				props.actions.onEditModelState(["Feedback", "feedback", "loops" ], data, undefined);
				props.actions.onEditModelState(["Feedback", "feedback", "feedbackFile" ], flFile, undefined);

				(data.size > 0) ? onResult({loops : data, feedbackRunning : true, feedbackFile : flFile}) : onResult({noResult: "No Feedback Loops found"});

				worker.terminate();
			});
		}
	}

    static cycleSelect(c, onResult){
      onResult({funcCircuit: c});
    }

    static stateTransitionGraph(model, components, props, onResult){

      if(components === null){
          onResult({stateTransitionGraph : null, stateGraphRunning: false, stateGraphResult : ""});
          return;
      }

      if(Seq(components).count() > 16){
          onResult({stateTransitionGraph : null, stateGraphRunning: false, stateGraphResult : "State Transition Graph unavailable!! Graph is available only for models with 16 or less components"});
          return;
      }

      if(window.Worker){
          const worker = new MyStateTransitionWorker();
          worker.postMessage(JSON.stringify({eqn : BooleanAnalysis.getEqn(components, true)}));

          onResult({stateGraphResult : "Please wait while we compute State Transition Graph..."});

          worker.addEventListener('message', function(e){
              const data = Seq(JSON.parse(e.data));
              if(data.isEmpty()){
                onResult({stateTransitionGraph : null, stateGraphRunning: false, stateGraphResult : "State Transition Graph not available for this model"});
                worker.terminate();
              }else{
                  const keys = Seq(Seq(data.first()).first()).map((_,k)=>k).sort().cacheResult();
                  const graph = data.map(e=>Seq(e).map(e=> ({name: keys.map(k=>(parseInt(e[k])?'1':'0')).join(''), keys: keys.toArray()}) ).toArray()).toArray();
                  props.actions.onEditModelState(['StateTransition', 'graph'], graph, undefined);
                  onResult({stateGraphRunning : true, stateGraphResult : ''});
                  worker.terminate();
              }
          });
      }

    }
}
