import json2csv from "json2csv";

const PRIMARY = ["First Name", "Last Name", "Email", "Institution", "Last Updated Date"];
const END_PRIMARY = PRIMARY.length;

const types = [
    [/^Pre Test [0-9]+[\.|:] .*$/, END_PRIMARY, (q1, q2) => {
        let Q1_Str = q1.split(' ')[1];
        Q1_Str = Q1_Str.slice(0, Q1_Str.length-1);
        let Q2_Str = q2.split(' ')[1];
        Q2_Str = Q2_Str.slice(0, Q2_Str.length-1);
        const Q1_Val = parseInt(Q1_Str);
        const Q2_Val = parseInt(Q2_Str);
        return Q1_Val - Q2_Val;
    }],
    [/^Q?[0-9]+(\.[0-9]+[a-z]?)?[\.|:]? .*$/, END_PRIMARY+1, (q1, q2) => {
        const Q1_Has_Q = (q1[0] === 'Q');
        const Q2_Has_Q = (q2[0] === 'Q');
        let Has_Q = false;
        if( Q1_Has_Q && !Q2_Has_Q ) return -1;
        else if( !Q1_Has_Q && Q2_Has_Q ) return 1;
        else Has_Q = (Q1_Has_Q && Q2_Has_Q);
        if( Has_Q ){
            q1 = q1.slice(1);
            q2 = q2.slice(1);
        }
        let Q1_Str = q1.split(' ')[0];
        let Q2_Str = q2.split(' ')[0];
        if( Q1_Str[Q1_Str.length-1] === '.' || Q1_Str[Q1_Str.length-1] === ':' ) Q1_Str = Q1_Str.slice(0, Q1_Str.length-1);
        if( Q2_Str[Q2_Str.length-1] === '.' || Q2_Str[Q2_Str.length-1] === ':' ) Q2_Str = Q2_Str.slice(0, Q2_Str.length-1);
        
        
        const Q1_Val = parseFloat(Q1_Str);
        const Q2_Val = parseFloat(Q2_Str);
        if( Q1_Val !== Q2_Val ) return (Q1_Val - Q2_Val);

        // Otherwise, the difference in order is determined by the letter.
        // Even if a letter is not included, this bit of code will not perturb
        // the correctness of the sorting order.
        let Q1_Letter = Q1_Str[Q1_Str.length-1];
        let Q2_Letter = Q2_Str[Q2_Str.length-1];
        if(!/[a-z]/.test(Q1_Letter)) Q1_Letter='|'; // The pipe is greater than all lowercase ASCII letters.
        if(!/[a-z]/.test(Q2_Letter)) Q2_Letter='|';
        return (Q1_Letter > Q2_Letter) ? 1 : ((Q1_Letter === Q2_Letter) ? 0 : -1);
    }],
    [/^Post Test [0-9]+[\.|:] .*$/, END_PRIMARY+2, (q1, q2) => {
        let Q1_Str = q1.split(' ')[1];
        Q1_Str = Q1_Str.slice(0, Q1_Str.length-1);
        let Q2_Str = q2.split(' ')[1];
        Q2_Str = Q2_Str.slice(0, Q2_Str.length-1);
        const Q1_Val = parseInt(Q1_Str);
        const Q2_Val = parseInt(Q2_Str);
        return Q1_Val - Q2_Val;
    }]
];
const MAX = Math.max(...types.map(e => e[1]))+1;

const getType = q => {
    if( PRIMARY.includes(q) ) return PRIMARY.indexOf(q);
    for( const key in types ){
        const type = types[key];
        if( type[0].test(q) ){
            return type[1];
        }
    }
    return MAX;
};
const getComparison = type => {
    let ret = null;
    types.some(t => {
        if( t[1] === type ){
            ret = t[2];
            return true;
        }
    });
    if( ret === null ){
        return (a, b) => ((a > b) ? 1 : ((a < b) ? -1 : 0));
    }else return ret;
};

const reportToCSV = (report, { separator = "," } = { }) => {
    report.columns.sort((a, b) => {
			const type_a = getType(a);
			const type_b = getType(b);
			if( type_a !== type_b ){
					return type_a - type_b;
			}

			const compare = getComparison(type_a);
			return compare(a, b);
    });

    // const columns = report.columns.map(e => `"${e}"`).join(",");
    // const data = report.data.map(row => report.columns.map(col => 
    //     ((col in row) ? `"${row[col]}"` : "")
    // ).join(separator)).join("\n");

    // const content = `${columns}\n${data}`
		const parser = new json2csv.Parser({ fields: report.columns });
		const content = parser.parse(report.data);

    return content;
}

export { reportToCSV };