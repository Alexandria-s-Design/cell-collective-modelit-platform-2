import React from 'react';

import AddModelDropDown from '../AddModelDropDown';

import './style.scss';

export function CourseAddModelCard({onAdd}){
	return (
		<div className="courseCard addModuleToCourse card" style={{ width: '100%' }}>
			<div>
				<div className="frame">

						<div className="cover research-cover">
								<AddModelDropDown key={`addModelDropDown`} addModelToCourse={onAdd} />,
						</div>
				</div>
			</div>
		</div>
	);
}
