import cc from "../cc";
import showMessage from "../message";

const refresh = ({ force = false, message = undefined, refreshIn = 5*1000 } = { }) => {
    const doRefresh = () => {
        cc.store.clear({ thresold: force ? 0 : 1 });
        window.location.reload(true);
    }

    if(message){
        showMessage(message);
        window.setTimeout(doRefresh, refreshIn);
    }else{
        doRefresh();
    }
}

export default { refresh };