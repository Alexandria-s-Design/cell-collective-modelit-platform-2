import { jStat } from 'jstat';

let data;

self.addEventListener('message', function({data: e}) {
   /*if(e.data)*/ data = e.data;
   _doAnalysis(data.inputs, data.outputs, self.postMessage);
});

const filterValidCols = (({data, headers}) => {
  const transposed = headers.map((_,i)=>data.map(e=>e[i]));

  const filtered = headers.map((_,i) => i).filter((i) =>
        !transposed[i].every(e=>e < Number.EPSILON)
        ||
        !transposed[i].every(e=>e > 1-Number.EPSILON)
    );

  return {
    data: data.map(drow => filtered.map(e=>drow[e]) ),
    headers: filtered.map(e=>headers[e])
  };
});

const getSD = e=>(jStat.stdev(e) / jStat.mean(e))*100;

const getCol = (d,col) => {
  return d.map(e=>e[col]);
}

const getTopKindices = (data, k) => {
  const indices = data.map((_,i)=>i);
  indices.sort((a,b)=>data[b]-data[a]);
  indices.length = Math.min(indices.length,k);
  return new Set(indices);
}

function _doAnalysis(inputs, outputs, postMessage){
  outputs = filterValidCols(outputs);

  const sdoutputs = outputs.data.map(
          (e)=>({sd: getSD(e), data: e})
        );

  const calcOneStep = (kTop,i = undefined) => {
    const transform = (x) => (x*x);
    const sd_param = transform(i);

    const filterOutputs = 
        i === undefined ?
           () => true
           :
           e=>e.sd<sd_param;


    const d = sdoutputs.filter(filterOutputs).map(e=>e.data);
    const outarrs = outputs.headers.map((e,i)=>{
      const data = getCol(d,i);
      return getTopKindices(data,kTop < 0 ? data.length : kTop);
    });
    const reduced = outarrs.reduce((acc, value) => new Set(
        [...acc].filter(x => value.has(x))));

    const r = reduced.entries();
    let min;
    let max;
    for (const [_, index] of r) {  // @@iterator is used
      const sd = getSD(d[index]);
      if(!min || min.sd > sd)
        {min = {sd, index};}
      if(!max || max.sd < sd)
        {max = {sd, index};}
    }

    return {sd_param, size: reduced.size, indices: reduced, minsd: min ? min.sd : Infinity, maxsd: max ? max.sd : -Infinity, kTop, i};
  }


  //first step for the
  const mainLoop = (kTop = -1, i = 0.1) => {
    const ret = [];
    for(; i < 20; i+= 0.1){
      ret.push(calcOneStep(kTop,i));
    }
    return ret;
  }



  const sendOK = (e) => {
    e.inputs  = {data: Array.from(e.indices).map(e=>inputs.data[e]),  headers: inputs.headers};
    e.outputs = {data: Array.from(e.indices).map(e=>outputs.data[e]), headers: outputs.headers};
    postMessage(e);
    return;
  }

  if(sdoutputs.length > 1){

    if(outputs.headers.length <= 1){
      const kTop = 10;
      const e = calcOneStep(kTop);
      return sendOK(e);
    }else{
      //heuristic for finding optimal parameters for optimization according to multiple axis
  
      const sdoutputs_2 = [].concat(sdoutputs);
      sdoutputs_2.sort((a,b) => a.sd - b.sd);
      const fromI = Math.sqrt(sdoutputs_2[0].sd);
//      let toI = Math.sqrt(sdoutputs_2[sdoutputs_2.length-1].sd);

      const incI = (i) => {
        if(i < 10)
          {return i+1;}
        if(i < 20)
          {return i+2;}
        if(i < 50)
          {return i+3;}
        if(i < 200)
          {return i+10;}
        return Math.floor(i*1.05);
      }

      Array.prototype.count = function(e){
        let ret = 0;
        for(let i = 0; i < this.length; i++)
          {if(e(this[i]))
            {ret++;}}
        return ret;
      }

      for( let kTop = 3; kTop < sdoutputs.length; kTop = incI(kTop) ){
        const ret = mainLoop(kTop, fromI);
        const e = ret.filter(e=>e.size>=5)[0];
        if(e){
          return sendOK(e);
        }
      }
    }

  }
  postMessage({
    inputs:  {data:[], headers: inputs.headers},
    outputs: {data:[], headers: outputs.headers},
  });
}
