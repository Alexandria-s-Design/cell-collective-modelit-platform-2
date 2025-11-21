import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import DatePicker from "react-datepicker";
import messages from "./messages";
import './styles.scss';

const CourseDateRange = ({ from, to, editable, onEdit }) => {
	const [startDate, setStartDate] = useState(from ? new Date(from) : new Date());
	const [endDate, setEndDate] = useState(to ? new Date(to) : new Date());

	const handleChangeStart = (date) => {
		setStartDate(date)
		onEdit({ startDate: date })
	}

	const handleChangeEnd = (date) => {
		setEndDate(date);
		onEdit({ endDate: date })
	}


	if (!editable) {
		return (
			<div className="course-datepicker">
				{<FormattedMessage {...messages.CourseDateRangeStartDate}/>}
				<DatePicker
					selected={startDate}
					placeholderText={startDate}
					readOnly
					className='courseDateRange'
				/>
				{<FormattedMessage {...messages.CourseDateRangeEndDate}/>}
				<DatePicker
					selected={endDate}
					placeholderText={endDate}
					readOnly
					className='courseDateRange'
				/>
			</div>
		);
	}
	else {
		return (
			<div className="course-datepicker">
				{<FormattedMessage {...messages.CourseDateRangeStartDate}/>}
				<DatePicker
					selected={startDate}
					onChange={handleChangeStart}
					selectsStart
					startDate={startDate}
					endDate={endDate}
					popperPlacement="bottom-end"
					className='courseDateRange'
				/>
				{<FormattedMessage {...messages.CourseDateRangeEndDate}/>}
				<DatePicker
					selected={endDate}
					onChange={handleChangeEnd}
					selectsEnd
					startDate={startDate}
					endDate={endDate}
					minDate={startDate}
					popperPlacement="bottom-end"
					className='courseDateRange'
				/>
			</div>
		);
	}
}
CourseDateRange.propTypes = {
	from: PropTypes.instanceOf(Date),
	to: PropTypes.instanceOf(Date),
	editable: PropTypes.bool,

}

export default CourseDateRange;
