import { Seq } from 'immutable';
export function getMergedInputsOutputs(model, experiment, simulationData){
    let inputs;
    let outputs;

    //merge inputs and outputs from all valid output ranges to one big array
    experiment.validRanges.forEach(range=>{
        const data = simulationData[range.id];

        //get data according to the Component type ( external / internal )
        const getData = (isExternal) => Seq(model.Component).filter(e=>e.isExternal == isExternal).map(e=>data[e.id]);
        //transpose matrix and extract headers
        const getCsvData = (inp) => {
            const headers = Array.from(Seq(inp).keys());//.toArray();
            const first = Seq(inp).first();
            const data = first ? first.map((e,i)=>headers.map(componentId => inp.get(componentId)[i])) : [];
            return {data, headers};
        }

        const merge = (result, d) => {
          if(!result) return d;

          result.data = result.data.concat(d.data);
          return result;
        }

        inputs  = merge(inputs,  getCsvData(getData(true)) );
        outputs = merge(outputs, getCsvData(getData(false)) );
    });

    return {inputs, outputs}
}
