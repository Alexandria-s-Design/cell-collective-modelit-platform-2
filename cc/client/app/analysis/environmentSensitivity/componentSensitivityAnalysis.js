import {getMergedInputsOutputs} from './utils';
import MyWorker from './componentSensitivityWorker?worker';

export default class ComponentSensitivityAnalysis{
    constructor(model, experiment, simulationData, update){
        this.model = model;
        this.e = experiment;
        this.update = update;

        this.data = { state: "RUNNING", phase: 0, percentComplete: 0, elapsedTime: 0 };

        const {inputs, outputs} = getMergedInputsOutputs(model, experiment, simulationData);

        this._run(inputs, outputs, update);
    }
    _run(inputs, outputs, update){
       const time = Date.now();
       let n = 0;
       const maxWorkers = (navigator.hardwareConcurrency || 4);


       //prepare array of tasks for the workers
       const tasks = [];
       for(let i = 0; i < inputs.headers.length; i++){
         for(let j = 0; j < outputs.headers.length; j++){
           tasks.push({input: i, output: j});
         }
       }

       //array for result
       const result = inputs.headers.map(i => outputs.headers.map(e=>NaN) );
       const steps = inputs.headers.length * outputs.headers.length;

       const reportFinish = () => {
         const d = this.data;
         d.state = "COMPLETED";
         d.elapsedTime = Math.round(0.001 * (Date.now() - time));
         d.analysis = {data: result, rows: inputs.headers, cols: outputs.headers};
       }

       //see the implementation of the PCC analysis inside worker.js
       if(inputs.headers.length <= 1 || outputs.headers.length <= 1){
         setTimeout(() => {
           reportFinish();
           update();
         },0);
         return;
       }

       const updateStatus = () => {
         const d = this.data;
         d.percentComplete = ++n / steps;
         if(n >= steps){
           reportFinish();
         }
         update();
       };

       const workers = [];

       const tryRunTask = (worker) => {
          if(!worker && workers.length < maxWorkers){
            worker = new MyWorker();
            worker.postMessage({data : {inputs, outputs}});
            worker.addEventListener('message', ({data: {params, value}}) => {
                result[params.input][params.output] = value;
                updateStatus();
                tryRunTask(worker);
            });
            workers.push(worker);
          }

          if(worker){
            const task = tasks.pop();
            worker.postMessage({params : task});
            return true;
          }else{
            return false;
          }
       }

       while(tryRunTask());
    }
}
