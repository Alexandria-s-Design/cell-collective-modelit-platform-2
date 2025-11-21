import React, {useContext} from 'react';
import classNames from 'classnames';

import {WORKSPACE} from '../../../../containers/Application/ModuleDM/Module/actions';
import {FormattedMessage} from 'react-intl';

import messages from "../messages";
import {CCContext} from "../../../../containers/Application";
import BaseMenu from "../../BaseMenu";

const WorkspaceMenu = ({changeWorkspace, workspace, domain}) => {
    const {cc} = useContext(CCContext);

    return <BaseMenu title={<FormattedMessage {...messages.Workspace}/>}
                     content={
                         <ul>
                             <li>
                                 <div className={classNames("checkbox", workspace === WORKSPACE.MODEL && "checked")}
                                      onClick={() => {
                                          changeWorkspace(WORKSPACE.MODEL);
                                      }}>
                                     <FormattedMessage {...messages.Model}/>
                                 </div>
                             </li>
                             <li>
                                 <div className={classNames("checkbox", workspace === WORKSPACE.CONTENT && "checked")}
                                      onClick={() => {
                                          changeWorkspace(WORKSPACE.CONTENT);
                                      }}>
                                     <FormattedMessage {...messages.ContentDesign}/>
                                 </div>
                             </li>
                             { // comment: this is for the condition if accountid == 1 or 2 then LearningInsights tab appears.
                             }
                             {/* { (domain !== "research") && cc.state.course && user.subscription[0].AccountPlanId === 3 &&  */}
                             {(domain !== "research") && cc.state.course &&
                                 <li>
                                     <div
                                         className={classNames("checkbox", workspace === WORKSPACE.INSIGHTS && "checked")}
                                         onClick={() => {
                                             changeWorkspace(WORKSPACE.INSIGHTS);
                                         }}>
                                         <FormattedMessage {...messages.LearningInsights}/>
                                     </div>
                                 </li>
                             }
                         </ul>}/>

}

export default WorkspaceMenu;
