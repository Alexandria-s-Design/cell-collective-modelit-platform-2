import React from 'react';
import { FormattedMessage } from 'react-intl';

import cc from '../../../../cc';

import './style.scss';

class StudentLessonStatus extends React.Component {
		UNSAFE_componentWillMount() {
        this.setState({
            loading: true,
            data: null,
            error: null
        });

        cc.request.post(`/api/module/${this.props.model}/lesson-status`).then(data => {
            this.setState({
                loading: false,
                data: data.data.data // lol
            })
        }).catch(data => {
            const err = data.response.data.error;
            let message = null;
            if( err.errors.length > 0 ) {
                message = err.errors[0].message;
            } else {
                message = err.message;
            }
            this.setState({
                loading: false,
                error: message
            });
        });
    }

    render() {
        const nameIfExists = (arr, ind) => {
            if (ind < arr.length) {
                const item = arr[ind];
                return `${item.last}, ${item.first}`;
            } else return null;
        };

        let content = null;

        if( !this.state.loading ) {
            if( this.state.error === null ) {
                const completedInfoBox = (
                    <div className="icon base-info infobox">
                        <div>
                            <div className="infotext">
                                <FormattedMessage id="StudentLessonStatus.InfoBox.Completed" defaultMessage="This is a list of students that have complete this lesson." />
                            </div>
                        </div>
                    </div>
                );

                const outstandingInfoBox = (
                    <div className="icon base-info infobox">
                        <div>
                            <div className="infotext">
                                <FormattedMessage id="StudentLessonStatus.InfoBox.Outstanding" defaultMessage="This is a list of students that have begun working in ModelIt!, but have not yet completed the lesson." />
                            </div>
                        </div>
                    </div>
                );

                const data = this.state.data;

                const completed = data.filter(datum => datum.completed);
                const outstanding = data.filter(datum => !datum.completed);

                const long = outstanding.length > completed.length ? outstanding : completed;
                const short = long === completed ? outstanding : completed;

                content = (
                    <table className="student-status">
                        <tbody>
                            <tr>
                                <th>Students with completed lessons {completedInfoBox}</th>
                                <th>Students with outstanding lessons {outstandingInfoBox}</th>
                            </tr>
                            {long.map((item, index) => {
                                return (
                                    <tr>
                                        {long === completed ? <td>{`${item.last}, ${item.first}`}</td> : nameIfExists(short, index)}
                                        {long === completed ? nameIfExists(short, index) : <td>{`${item.last}, ${item.first}`}</td>}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                );
            } else {
                content = (
                    <div className="error">Error: {this.state.error}</div>
                );
            }
        } else {
            content = (
                <div className="loading-status">Loading lesson status data...</div>
            );
        }

        return (
            <div>
                <div className="text-center student-lesson-status">
                    {content}
                </div>
            </div>
        )
    }
}

export default StudentLessonStatus;