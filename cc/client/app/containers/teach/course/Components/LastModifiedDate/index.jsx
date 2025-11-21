import { last } from 'lodash';
import React from 'react';

class LastModifiedDate extends React.Component {
  render() {
		let {updatedAt} = this.props;
    const lastModifiedDate = new Date(updatedAt);

		//format the date to mm-dd-yyyy
    const month = (lastModifiedDate.getMonth() + 1).toString().padStart(2, '0');
    const day = lastModifiedDate.getDate().toString().padStart(2, '0');
    const year = lastModifiedDate.getFullYear();
    const formattedDate = `${month}/${day}/${year}`;
    
    return (
      <span>Date Updated: {formattedDate}</span>
    );
  }
}

export default LastModifiedDate;
