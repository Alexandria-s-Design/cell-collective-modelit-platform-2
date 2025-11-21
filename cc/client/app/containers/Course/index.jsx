import React from 'react';

// TODO: Display AppBar
import Modal from '../../components/Modal';
import Catalog from '../teach/course/Catalog';
import {teachCourseData, learnCourseData} from '../teach/course/Catalog';
import Application from '../../application';

export const CCCourseContext = React.createContext('dim');
class Course extends React.Component {
    constructor (props) {
        super (props);
    }

    render ( ) {
				const { props: {parentWidth, parentHeight} } = this;
			

        return (
            <div>
								<CCCourseContext.Provider value={{dim:{parentWidth, parentHeight}}}>	
										<Catalog>
										</Catalog>
                </CCCourseContext.Provider>								
            </div>
        );
    }
}

Course.Header = () => {
	function modelCount() {
		const  n =  Application.domain === 'teaching' ?  teachCourseData.useCount() : learnCourseData.useCount();
		return n; 
	}
	return (<React.Fragment>My Courses ({modelCount()})</React.Fragment>);
};
export default Course;
