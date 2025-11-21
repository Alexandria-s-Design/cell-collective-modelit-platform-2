import { jStat } from 'jstat';

let data;

self.addEventListener('message', function({data: e}) {
   if(e.data) data = e.data;
   if(e.params) self.postMessage({params: e.params, value: _doAnalysis(data.inputs, data.outputs, e.params)});
});


function ols_resid(endog, exog) {
    const coef = jStat.lstsq(exog, endog);
    const predict =
        jStat.multiply(exog, coef.map(function(x) { return [x] }))
            .map(function(p) { return p[0] });
    return jStat.subtract(endog, predict);
}

function _doAnalysis(inputs, outputs, params){
    const skipIndiceProxy = (arr, skipIdx) => arr.filter((_,i) => i !== skipIdx );
    const getIndiceProxy = (arr, idx) => arr.map(e=>e[idx]);

    const i = params.output;

    const out = getIndiceProxy(outputs.data, i)
                .map(e=>e+Number.EPSILON); //fix cols with all zeros

    const skipIdx = params.input;
    const inp = inputs.data.map(e => skipIndiceProxy(e, skipIdx).map(e=>e+Number.EPSILON) );
    let val = NaN;
    const idRow = getIndiceProxy(inputs.data, skipIdx);
    const lmY_resid=ols_resid(out,inp);
    const lmXj_resid=ols_resid(idRow,inp);
    val = jStat.corrcoeff(lmY_resid, lmXj_resid);
    return val;
}
