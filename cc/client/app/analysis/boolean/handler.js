import { Seq, OrderedMap, Map } from 'immutable';
import ccbooleananalysis from 'ccbooleananalysis';

const handler = {
	connectivityMatrix(equations, getComponentFromKey){
		const getName = (k) => (getComponentFromKey(k) || {}).name;

		const conn = ccbooleananalysis.connectivity(equations);
		const matrix = Seq(conn).toArray();
		const [...keys] = OrderedMap(matrix[0]).keys();
		let cmatrix = `,${keys.map(getName).join(",")}\n`;
		let i = 0;
		matrix.forEach(val => {
			const [...vals] = OrderedMap(val).values();
			vals.unshift(getName(keys[i]));
			cmatrix += `${vals.join(",")}\n`.replace(/true/g, 1).replace(/false/g, 0);
			i += 1;
		});
		return cmatrix;
	},
	allPairShortestPath(equations, getComponentFromKey){
		const getName = (k) => (getComponentFromKey(k) || {}).name;

		const map = OrderedMap(ccbooleananalysis.distances(equations));
		const [...keys] = map.keys();
		let sp = `,${keys.map(getName).join(",")}\n`;

		for(const m of map){
			sp += getName(m[0]);
			for(const key of keys){
				if(Map(m[1]).has(key)){
					const v = Map(m[1]).get(key);
					sp += `,${v}`;
				}
				else{
					const n = m[0];
					sp += (map.get(key)[n] !== undefined) ? `,${map.get(key)[n]}` : ",0";
				}
			}
			sp += "\n";
		}
		return sp;
	},
	diameter(equations){
		return ccbooleananalysis.diameter(equations);
	},
	averageShortestPath(equations){
		return ccbooleananalysis.averageDistance(equations);
	},
	averageConnectivity(equations){
		const [...avgConnObj] = Map(ccbooleananalysis.averageConnectivity(equations)).values();
		return avgConnObj.reduce((a,b) => a+b, 0);
	},
	connectivityDistribution(equations){
		let count = {}, distribution = "Degree,Nodes\n";
		const [...degrees] = OrderedMap(ccbooleananalysis.connectivityDegree(equations)).values();
		Seq(degrees).forEach(e => {(count[e] = 1 + (count[e] || 0));});
		count = OrderedMap(count);
		const [...x] = count.keys();
		const [...y] = count.values();
		for(let i = 0; i < x.length; i++){
			distribution += `${x[i]},${y[i]}\n`;
		}
		return distribution;
	},
	connectivityInDegree(equations){
		let count = {}, inDegree = "Degree,Nodes\n";
		const [...degrees] = OrderedMap(ccbooleananalysis.connectivityInDegree(equations)).values();
		Seq(degrees).forEach(e => {(count[e] = 1 + (count[e] || 0));});
		count = OrderedMap(count);
		const [...x] = count.keys();
		const [...y] = count.values();
		for(let i = 0; i < x.length; i++){
			inDegree += `${x[i]},${y[i]}\n`;
		}
		return inDegree;
	},
	connectivityOutDegree(equations){
		let count = {}, outDegree = "Degree,Nodes\n";
		const [...degrees] = OrderedMap(ccbooleananalysis.connectivityOutDegree(equations)).values();
		Seq(degrees).forEach(e => {(count[e] = 1 + (count[e] || 0));});
		count = OrderedMap(count);
		const [...x] = count.keys();
		const [...y] = count.values();
		for(let i = 0; i < x.length; i++){
			outDegree += `${x[i]},${y[i]}\n`;
		}
		return outDegree;
	},
	closenessCentrality(equations, getComponentFromKey){
		const getName = (k) => (getComponentFromKey(k) || {}).name;

		const sp = {}, closeness = ["Node,Closeness,Name"];
		const distances = OrderedMap(ccbooleananalysis.distances(equations));
		const [...nodes] = distances.keys();

		distances.forEach((e, i) => {
			const v = Object.values(e);
			const totalNodes = nodes.length;
			const dist = (totalNodes - v.length);
			sp[i] =  (totalNodes - 1) / (v.reduce((a,b)=> a+b, 0) + dist);
		});

		let i = 0;
		Seq(sp).forEach((value,component) => {
			closeness.push(`${i++},${value},${getName(component)}`);
		});
		return closeness.join('\n');
  },
  feedbackLoopFile : function(data){
    let fl = `id,Feedback Loops\n`;

    data.forEach(e => {
      const o = e[1];
      const id = o.id;
      const name = o.name;
      fl += `${id},${name}\n`;
    })
    return fl;
  }
}

export default handler;
