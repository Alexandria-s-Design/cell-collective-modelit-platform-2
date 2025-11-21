import { getenv }   from "../../util/environment";
import { getevent } from "./util";

export default socket =>
{
    socket.on(getevent("ping"), () => {
        socket.emit(getevent("pong"), {
            version: getenv("VERSION"),
             commit: getenv("GIT_COMMIT"),
        });
		});
};