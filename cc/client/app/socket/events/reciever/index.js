import pong from "./pong";
import showMessage from "../../../message"

export default [
	{ name: "pong", action: pong },
	{
		name: "model:import",
		user: true,
		action: (message) => {
			let options = {
				timeOut: 0,
				extendedTimeOut: 0
			}
			let m = message.message

			if ( message.data ) {
				const { data } 	= message;
				const { id } 		= data;
				
				m = `${m} Click here to view.`

				options = {
					...options,
					onclick: () => {
						window.location.href = `/dashboard/#module/${id}`
					}
				}
			}

			showMessage({
				title: "Model Import",
				type: message.type,
				message: m,
				options,
			});
		} 
	},
	{
		name: "kinetic:laws",
		user: true,
		action: (message) => {
			const options = {
				timeOut: 0,
				extendedTimeOut: 0
			}
			let m = message.message;
			showMessage({
				title: "Model missing Kinetic Laws",
				type: message.type,
				message: m,
				options,
			});
		} 
	},
	{
		name: "model:context",
		user: true,
		action: (message) => {
			let options = {
				timeOut: 0,
				extendedTimeOut: 0
			}
			let m = message.message

			if ( message.data ) {
				const { data } 	= message;
				const { id } 		= data;				
				m = `${m} Click here to see more details.`
				options = {
					...options,
					onclick: () => {
						window.location.href = `/dashboard#module/${id}`
					}
				}
			}

			showMessage({
				title: "Context Specific",
				type: message.type,
				message: m,
				options,
			});
		} 
	},
]