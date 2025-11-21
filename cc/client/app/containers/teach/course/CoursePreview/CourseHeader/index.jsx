import React from 'react';
import { useDispatch } from 'react-redux';
import Editable from "../../../../../../app/component/base/editable";
import { openModal } from '../../../../../components/Modal/actions';
import CourseDateRange from '../../Components/CourseDateRange';
import LastModifiedDate from '../../Components/LastModifiedDate';

import './style.scss';

//import {useDispatch} from 'react-redux';

/***
 * TODO: styling of the component - remove &nbsp; and use real CSS :)
 */


const CourseHeader = ({id, title, codeKey, editable, onEdit, startDate, endDate, _updatedAt : updatedAt}) => {

	return (
	<React.Fragment>
			<div className="course-header">
					<Editable value={title} maxWidth={150} className="course-title" onEdit={onEdit && ((value) => onEdit({ title: value }))}/>
					
					<CourseDateRange editable={editable} from = {startDate} to = {endDate} onEdit={onEdit}/>

					<LastModifiedDate updatedAt = {updatedAt}/>
				</div>
		</React.Fragment>
		);
}

export default CourseHeader;