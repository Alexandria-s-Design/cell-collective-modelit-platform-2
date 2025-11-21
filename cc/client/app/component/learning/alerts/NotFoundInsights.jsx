import React from "react";
import './style.scss';
import { changeWorkspace, WORKSPACE } from '../../../containers/Application/ModuleDM/Module/actions';
import view from '../../base/view';
import Application from "../../../application";

const isLearning = Application.domain == 'learning';

const NotFoundInsights = () => {

	// render({ changeWorkspace }) {


		return <>
			{isLearning ? (
				<div>
					<h4>To view the insight dashboard:</h4>
					<ul>
						<li>Complete the lesson (Click Submit at the end of the lesson)</li>
						<li>Upgrade your account</li>
					</ul>

					{/* <input
						type="button"
						value={"View Lesson"}
						onClick={() => changeWorkspace(WORKSPACE.CONTENT)}
					/> */}
				</div>
			) : (
				<div>Insights not found.</div>
			)}
		</>
	// }

}

export default NotFoundInsights;