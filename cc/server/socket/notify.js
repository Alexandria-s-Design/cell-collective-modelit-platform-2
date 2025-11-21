import { onConnection } from "../app"
import { getevent } from "./util";

import logger from "../../logger"

export const notify = (event, message, { user = null } = { }) => {
  if ( typeof message === 'string' ) {
    message = { type: "info", message: message }
  }
  
  event = getevent(event, { user })

  onConnection(socket => {
    logger.info(`Disptaching Event ${event}...`);
    socket.emit(event, message)
  });
}