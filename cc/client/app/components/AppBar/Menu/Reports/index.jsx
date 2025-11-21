import React, {useContext} from "react";
import BaseMenu from "../../BaseMenu";
import messages from "../messages";
import Application from "../../../../application";
import Utils from "../../../../utils";
import {CCContext} from "../../../../containers/Application";
import {FormattedMessage} from 'react-intl';
import { format} from "date-fns"; 

const ReportsMenu = ({openModal, hideModal}) => {
    const {model, cc} = useContext(CCContext);

    const modelId = model.top && model.top.Persisted;
		const modelTop = model.top;
    return <BaseMenu title={<FormattedMessage {...messages.Reports}/>}
                     content={<ul>
                         {Application.domain === "teaching" ? <li>
                             <div onClick={() => {
                                 openModal('GenerateReport', {
                                     title: 'Generate Student Report', onGenerate: (from, to) => {
																				let isPublic = modelTop.isPublic ? 1 : 0;
																				let courseId = cc.state.course || '';
                                         Utils.downloadFile(`/web/api/module/${modelId}/report?start_date=${format(from, "yyyy-MM-dd'T'HH:mm")}&end_date=${format(to, "yyyy-MM-dd'T'HH:mm")}&for_domain=${Application.domain}&course=${courseId}&isPublic=${isPublic}`);
                                         hideModal();
                                     }
                                 })
                             }}>
                                 <FormattedMessage {...messages.StudentReport} />
                             </div>
                         </li> : null}
                         {(<li>
                             <div onClick={() => {
                                 openModal('GenerateReport', {
                                     title: 'Generate Image Report', onGenerate: (from, to) => {
                                         openModal('ImageReport', {
                                             title: 'Image Report',
                                             from,
                                             to,
                                             model: modelId,
                                             width: 750,
                                             height: 580
                                         });
                                     }
                                 })
                             }}>
                                 <FormattedMessage {...messages.ImageReport}/>
                             </div>
                         </li>)}
                     </ul>}/>
}

export default ReportsMenu;
