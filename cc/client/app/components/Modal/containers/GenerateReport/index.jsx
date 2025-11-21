import React, { useState } from "react";
import { connect } from "react-redux";
import { FormattedMessage } from "react-intl";

import { subWeeks, formatISO, subYears } from "date-fns";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { hideModal } from '../../actions';

import messages from "./messages";

import Utils from "../../../../utils";

import './styles.scss';

const GenerateReport = ({ modelID, modelName, onGenerate, courseId = null }) => {
	const [fromDate, setFromDate] = useState(subWeeks(new Date(), 1));
	const [toDate, setToDate] = useState(new Date());
	const [errorMessage, setErrorMessage] = useState("");

	const onSubmit = onGenerate !== undefined
		? () => { onGenerate(fromDate, toDate) }
		: async () => {
			Utils.downloadFile(`/web/api/module/${modelID}/report?start_date=${formatISO(fromDate)}&end_date=${formatISO(toDate)}`);
		};

	return (
		<form onSubmit={(e) => {
			if (!e.isDefaultPrevented()) {
				e.preventDefault()
			}
		}} className="reportDialog no-format">
			<table className="no-format">
				<colgroup>
					<col className="labels" />
					<col />
				</colgroup>
				<tbody>
					<tr>
						<td>
							<FormattedMessage id="ModelDashBoard.ModalGenerateReport.LabelGenerateFrom" defaultMessage="From" />:
						</td>
						<td>
							<DatePicker
								selected={fromDate}
								onChange={setFromDate}
								minDate={subYears(new Date(), 3)}
								maxDate={new Date()}
							/>
						</td>
					</tr>
					<tr>
						<td>
							<FormattedMessage id="ModelDashBoard.ModalGenerateReport.LabelGenerateTo" defaultMessage="To" />:
						</td>
						<td>
							<DatePicker
								selected={toDate}
								onChange={setToDate}
								minDate={subYears(new Date(), 3)}
								maxDate={new Date()}
							/>
						</td>
					</tr>
				</tbody>
			</table>

			{errorMessage && (
				<div className="error">
					{errorMessage}
				</div>
			)}

			<input onClick={onSubmit} value="Generate" type="submit" className="submitButton" />
		</form>
	)
}

const mapStateToProps = state => ({
	domain: state.app.domain
});

export default connect(mapStateToProps)(GenerateReport);