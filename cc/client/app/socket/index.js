import io from "socket.io-client";
import Application from "../application"

import { RECIEVER } from "./events";


const PREFIX    = "cc";

const getevent  = (name, { user = null, prefix = PREFIX } = { }) =>
{
		if ( user ) {
			const user_id = user.app_user_id || user.id
			prefix = `${prefix}:${user_id}`
		}

    return `${prefix}:${name}`
};

const socket = io(Application.api.split('/web')[0]);

const getCurrentUser = () => {
  let user 		= null;
  const key 	= `VERSION[${Application.version}].Main`;
  const data 	= localStorage.getItem(key);

  if ( data ) {
    const results = JSON.parse(data);
    user = results.user;
  }

  return user;
}

socket.on("connect", () => {
	console.log("User Connected...");
	
	socket.emit(getevent("ping"));
	
  RECIEVER.forEach(({ name, action }) => {
    const event = getevent(name, { user: getCurrentUser() })

    socket.on(event, (message) => {
      console.log(`Recieved Event: ${event}...`);
      action(message)
    });
  });
});

export default socket;