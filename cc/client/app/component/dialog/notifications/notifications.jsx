import React, { useEffect, useState } from "react";
import Scrollable from "../../base/scrollable";
import view from "../../base/view";
import "./index.css"


const Notfications = ({ user }) => {
	const [notifications, setNotifications] = useState([])
	
	const fetchNotifications = async () => {
		try {
			const res = await fetch(`${import.meta.env.VITE_CC_URL_CCAPP}/users/user/notifications`, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${user.token}`,
				}
			});
			const data = await res.json();
			return data.data
		} catch (err) {
			console.error(err)
			return []
		}
	}

	const readNotification = async (id) => {
		try {
			const res = await fetch(`${import.meta.env.VITE_CC_URL_CCAPP}/users/user/notifications`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${user.token}`,
				},
				body: JSON.stringify({ "user_id": user.id, "notification": id })
			});
			const data = await res.json();
			if (data.data.message == "OK") {
				setNotifications(notifications.filter(n => n.id != id))
			}
		} catch (err) {
			console.error(err);
		}
	}
	const loadNotifications = async () => {
		const newNotifications = await fetchNotifications()
		if (newNotifications && newNotifications.length > 0) {
			setNotifications(newNotifications)
		}
	}
	useEffect(() => {
		loadNotifications()
	}, [])


	return <div
		style={{ textAlign: 'center' }}
	>
		<Scrollable parentHeight={270} scrollSpeed={2}>
			<ul>
				{
					notifications && notifications.length > 0 ? notifications.map(notification => {
						return <li
							key={`${notification.id}-user-request`}
							className="notification-item"
							onClick={() => readNotification(notification.id)}
						>{notification.message}
						</li>
					})
						:
						<div>
							<h3>No Pending Notifications!</h3>
						</div>
				}
			</ul>
		</Scrollable>
	</div>
}

const e = view(Notfications)

e.width = 400;
e.height = 400;


export default e