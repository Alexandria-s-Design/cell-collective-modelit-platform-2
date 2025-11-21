import cc                           from "../../../cc";

import {openModal}                  from "../../../components/Modal/actions";
import {store}                      from "../../../store";

let eventCnt = 0;

export default config =>
{
    switch(++eventCnt){
        case 1:     //first load on client show
            cc.store.setVersion(config.version);
            break;
        default:
            /*
                another loads - user can already have some temporary work, 
                    so instead of erasing cache we would only show the message
            */
            if(!cc.store.checkVersion(config.version)){
                store.dispatch(openModal('NewDeploy', {title: "New version released"}));
            }
            break;
    }
};