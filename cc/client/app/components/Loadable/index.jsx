import React from "react";

export default class Loadable extends React.Component{
    render(){
        const {renderLazy, loadingLazy: loading, component} = this.props;

        const props = {};
        for(const k in this.props){
            if(!/[a-z]Lazy$/g.test(k))
                {props[k] = this.props[k];}
        }

				const ret = renderLazy(component, props);
				
				return (
					<React.Suspense fallback={loading}>
						{ret}
					</React.Suspense>
				)
    }
}