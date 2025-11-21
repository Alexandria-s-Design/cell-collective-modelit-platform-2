import React, { useEffect, useState } from 'react';
import { Seq } from 'immutable';

import Options from '../../base/options';

const BoundaryControl = props => {
  const { actions, customOptions, e: Reaction } = props;
  const options = customOptions || Seq([
    { id: 0, name: 'sinks' },
    { id: 1, name: 'demands' },
    { id: 2, name: 'exchanges' },
  ]);

	const handleChange = (e) => {
		if(Reaction ){
			actions.onEdit(Reaction, "boundary", e && e.name ? e.name : null)
		}
	}

	const selectedValue = (value) => {
		return <div style={{padding: "0px 3px 3px 0px", display: "inline-block", fontWeight: "normal"}}>{value.name}</div>
	}

  return (
			<div>
				<Options
					propertyName="Boundary"
					options={options}
					value={(Reaction && Reaction.boundary) ? {name: Reaction.boundary  } : null}
					onChange={handleChange}
					get={selectedValue}
					def={{name: "None"}}
					dropdowIcon="icon-inheritb-bg"
				/> 					
			</div>
		
  );
};

export default BoundaryControl;
