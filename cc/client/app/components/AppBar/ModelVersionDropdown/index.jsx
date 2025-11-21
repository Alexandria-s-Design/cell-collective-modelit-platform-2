import React, {useState} from 'react';
import Application from '../../../application';
import classNames from 'classnames';
import {Seq} from 'immutable';
import Editable from '../../../component/base/editable';
import Update from '../../../action/update';
import cc_main from "../../../cc";


/**** TODO REPLACE WITH NEW DIALOG */
import Confirmation from '../../../component/dialog/confirmation';


import {CCContextConsumer} from '../../../containers/Application';

import './style.scss';

const ModelVersionDropdown = ({className, width, selectable, select, versions, layout, editable}) => {
    const [isShown, setIsShown] = useState(false);

    selectable = selectable || editable;

    return (
        <CCContextConsumer>
            {({cc, model}) => {
                if (!versions) {
                    return (<div className={classNames(className, 'version')} style={{width}}/>);
                }


                const modelAllVersionsEditable = Seq(versions).every(cc.modelIsShareAndEditable.bind(cc));

                const defaultVersion = model.top && model.top.selected || versions.sort(Application.cmpVersion(true)).first();
                const changeDefaultVersion = (m, e) => {
                    e.stopPropagation();
                    cc.modelSetDefaultVersion(m);
                };


                const onEdit = (e, p, v) => cc.entityUpdate([new Update(e, p, v)]);

                /**** TODO REPLACE WITH NEW DIALOG */
                const showConfirmationDialog = (...args) => {
                    cc.showDialog(Confirmation, ...args);
                }

                return (<div className={classNames(className, 'version')} style={{width}}
                             onClick={(event) => setIsShown(current => !current)}
                             onMouseEnter={() => setIsShown(true)}
                             onMouseLeave={() => setIsShown(false)}>
                    <Editable className="modelVersionEdit" value={model.name}
                              children={model && (<span>{model.name}</span>)}
                              onEdit={editable && model && (e => e && onEdit(model, "name", e))} maxWidth={width}/>
                    {isShown && selectable && (<ul className="ul" style={{minWidth: 200}}>
                        {versions.sort(Application.cmpVersion(false)).map((m, id) => (<li key={id}>
                            <div
                                className={classNames(m === model && "disabled", 'version', modelAllVersionsEditable && 'versionSelect', m === defaultVersion && 'versionDefault')}
                                onClick={selectable && select.bind(null, m)}>
                                <span className="selectVersion" title={modelAllVersionsEditable ? "Set as default" : ""}
                                      onClick={m !== defaultVersion && changeDefaultVersion.bind(null, m)}>
																	{m !== defaultVersion ? "(not def)" : "(default)"}
																</span>
                                {(m.name || "")}

                                {editable && m.permissions.delete && (<div className="remove act_x" onClick={((e) => {
                                    e.stopPropagation();
                                    showConfirmationDialog({
                                        type: "remove",
                                        entity: m.name,
                                        action: cc.modelRemoveVersion.bind(cc, m)
                                    })
                                })}/>)}

                            </div>
                            {m && m.description && (
                                <ul className="ul">
                                    <li>
                                        <div>{cc_main._ ? cc_main._.ellipsis(m.description) : m.description}</div>
                                    </li>
                                </ul>
                            )}
                        </li>)).toArray()}
                        {editable && modelAllVersionsEditable && (<li className="custom">
                            <div className="checkbox"
                                 onClick={cc.modelAddVersion.bind(cc, model, model.top)}>{"Add new version"}</div>
                        </li>)}
                    </ul>)}
                </div>);
            }}
        </CCContextConsumer>);

};

export default ModelVersionDropdown;
