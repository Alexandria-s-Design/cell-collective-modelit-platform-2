import React from 'react';
import {Seq} from "immutable"
import {FormattedMessage} from 'react-intl';
import {CCContextConsumer} from '../../../../../containers/Application';
import fileMessages from '../messages';
import { ModelType } from "../../../../../cc";
import BaseMenu from "../../../BaseMenu";

const ModelDownload = () => {
    return <BaseMenu title={<FormattedMessage {...fileMessages.Download}/>}
                     content={<CCContextConsumer>
                         {({cc, model}) => (
                             <ul>
                                 {Seq(ModelType[model.modelType || "boolean"].exportTypes)
                                     .map(({label, name}, k) => (
                                         <li>
                                             <div onClick={e => cc.modelDownload(k, undefined, e)}>
                                                 {label || name}
                                             </div>
                                         </li>
                                     )).toArray()}
                             </ul>
                         )}
                     </CCContextConsumer>} />
};

export default ModelDownload;
