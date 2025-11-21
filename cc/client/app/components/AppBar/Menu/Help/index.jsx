import React, {useContext, useState} from "react";
import messages from "../messages";
import AppConfig from "../../../../app.json";
import {FormattedMessage} from 'react-intl';
import {TYPE_WARNING} from "../../../../message";
import {CCContext} from "../../../../containers/Application";
import cclib from "../../../../cc";
import BaseMenu from "../../BaseMenu";

const HelpMenu = ({intl, openModal}) => {
    const {cc} = useContext(CCContext);
    const {formatMessage} = intl;

    const refresh = () => {
        cclib._.refresh({
            message: {
                message: formatMessage(messages.ReloadInMoment),
                type: TYPE_WARNING
            }
        });
    }

    return <BaseMenu title={<FormattedMessage {...messages.Help}/>}
                     content={<ul>
                         {/*<li>
                             <div onClick={() => {
                                 window.location.href = "https://support.cellcollective.org/";
                             }
                             }>
                                 <FormattedMessage {...messages.Tutorials}/>
                             </div>
                         </li>
                         <li>
                             <div onClick={() => {
                                 window.open(AppConfig.urls.support)
                                 /*props.openModal('UserDocumentation', { title: 'User Documentation', span: true })
                             }}>
                                 <FormattedMessage {...messages.Documentation}/>
                             </div>
														</li>*/}
                         <li>
                             <div onClick={() => {
                                 openModal('About', {title: 'About'})
                             }}>
                                 <FormattedMessage {...messages.About}/>
                             </div>
                         </li>
                         {/*<li>
                             <div onClick={refresh}>
                                 <FormattedMessage {...messages.Reload}/>
                             </div>
                         </li>
                         <li>
                             <div onClick={() => {
                                 cc.layoutSet("Sharing");
                             }}>
                                 <FormattedMessage {...messages.Debug}/>
                             </div>
														</li>*/}
                     </ul>}/>
}

export default HelpMenu;
