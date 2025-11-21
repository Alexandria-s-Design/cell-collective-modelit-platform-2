import React, {useEffect, useState} from "react";
import {Seq} from 'immutable';
import Panel from '../../../../component/base/panel';
import Table from '../../../../component/base/table';
import Utils from '../../../../utils';

// import DatePicker from "react-datepicker";
// import "react-datepicker/dist/react-datepicker.css";

// import { hideModal } from '../../actions';

// import messages from "./messages";

// import utils from "../../../../utils";

import './styles.scss';

const CourseInsights = ({ modelID, courseId=null}) => {

		const [data, setData] = useState();
		const [ loading , setLoading] = useState(true);
		const [errorMessage, setError] = useState();

		const doLoad = async  () => {
			setError(undefined);
			setLoading(true);
			try{
				const parameters = {};
				const config = {
					headers: {
							"Content-Type": "application/json"
					}//,
					// responseType: 'blob'
				};

				setData((await window.cc.request.post(
					`api/course-report/${courseId}/userReport`,
					parameters,
					config
				)).data);	
			}catch(e){
				setError(e+"");
			}finally{
				setLoading(false);
			}
		}
		
		useEffect(() => {
			doLoad();
		},[courseId]);




		const rTable = (data) => {

		// const columns = [
		// 									'first_name', 'last_name', 'institution', 'email'
		// 							].map(
		// 								Utils.ext.bind(null, "key")
		// 							).map(
		// 								//map default values
		// 								column => ({name: column.key, ...column})
		// 							);			

			const columns = [
						{
							get: 'last_name',
							label: "Last name"
						},
						{
							get: 'first_name',
							label: "First name"
						}
				];
				
			return (
				<Table
									columns={columns}
									references={[data]}
									data={Seq(data).sort((a, b) => 
										a.last_name.localeCompare(b.last_name)
									)}
					/>
			)
	};


		const data2show = data && Array.isArray(data) ? data : [];
								
		const isPaid = (row) => true;

    return (
				<React.Fragment>
								<div className="text-center">
									<div className="insightsRefreshData" onClick={() => doLoad()}>..... refresh data ......</div>
									{errorMessage && (
												<div className="error">
														{errorMessage}
												</div>
										)}
                  {loading && (
                    <div className="loading">loading data...</div>
									)}
									
									<div className="insightsContainer">
										<div>
											<h2 
												className="hasTitle"
												title="This is a list of students that have begun working in ModelIt!, but they have not yet upgraded their account to unlock automatic grading and insights."
												>Free accounts &#x1F6C8;</h2>
											<Panel
														parentWidth={400}
														parentHeight={400}
														height={400}
														top="300"
														left="0">
													{rTable(data2show.filter(e=>!e.is_premium))}											
												</Panel>
										</div>
										<div>
										<h2 
												className="hasTitle"
												title="This is a list of students that have begun working in ModelIt!. They have upgraded their account and their work will be automatically graded and included in the insights dashboard."
												>Premium accounts &#x1F6C8;</h2>
											<Panel
													parentWidth={400}
													parentHeight={500}
													height={500}
													top="300"
													left="0">
												{rTable(data2show.filter(e=>e.is_premium))}
											</Panel>
										</div>
									</div>
								</div>

				</React.Fragment>
    )
}

export default CourseInsights;