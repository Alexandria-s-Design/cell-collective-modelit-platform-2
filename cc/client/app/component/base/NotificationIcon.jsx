import React from 'react'
import NotificationImportant from '@mui/icons-material/NotificationImportant'

// This component is  reusable as per specs
const NotificationIcon = ({title}) => {
		return (
			<div title={title}>
					<NotificationImportant style={{ color: "red",  marginTop: "5px" }} />
			</div>
		);
	}


export default NotificationIcon;
