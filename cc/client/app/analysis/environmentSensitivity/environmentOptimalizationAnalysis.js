import {getMergedInputsOutputs} from './utils';
import {Seq} from 'immutable';
import MyWorker from './environmentOptimalizationWorker?worker';

export default class EnvironmentOptimalizationAnalysis{
  constructor(model, experiment, simulationData, optimizeNodes, update){
      this.data = { state: "RUNNING", phase: 0, percentComplete: 0, elapsedTime: 0 };

      const {inputs, outputs} = getMergedInputsOutputs(model, experiment, simulationData);

      this._run(inputs, outputs, optimizeNodes, update);
  }
  _run(inputs, outputs, optimizeNodes, update){
      //preprocess the data if the
      const optimization = Seq(outputs.headers)
                          .map((v,i)=>({i,v,t:optimizeNodes.has(v)?optimizeNodes.get(v):0}))
                          .filter(e=>e.t).cacheResult();

      //if the there is nothing to select for optimization, optimize for all of them to maximize
      //othervise optimize according to selection
      if(!optimization.isEmpty()){
        //preprocess the data, if the value should be optimized to minimize *(t == 2), just simply inverse the value
        const newoutputs = {
          headers: optimization.map(({v}) => v).toArray(),
          data: outputs.data.map(simulation=>
            optimization.map(({i,t})=> simulation[i]*(t==2?-1:1) ).toArray()
          )
        };

        outputs = newoutputs;
      }else{
        outputs = {
          headers : [],
          data    : []
        }
      }

      const time = Date.now();

      const reportFinish = (data) => {
        const d = this.data;
        d.state = "COMPLETED";
        d.elapsedTime = Math.round(0.001 * (Date.now() - time));
        d.analysis = data;
      }


      const worker = new MyWorker();
      worker.postMessage({data : {inputs, outputs}});
      worker.addEventListener('message', ({data}) => {
          reportFinish(data);
          update();
      });

//      this.data.state = "COMPLETED";

//      setTimeout(update,0);
      setTimeout(update,0);

  }
}
