import React, {useContext} from 'react';
import {Range, Seq} from 'immutable';
import {FormattedMessage} from 'react-intl';

import classNames from 'classnames';
import {CCContext, CCLayouts} from '../../../../../containers/Application';

import {sanitizeLayoutName} from "../../../../../layouts";
import messages from "../messages";
import BaseMenu from "../../../BaseMenu";

export default () => {

    const {cc, model} = useContext(CCContext);
    const {layouts, favorites, typed, access} = useContext(CCLayouts);

    //TODO: metabolic layouts
    const layouts_new = layouts.get("").filter((_, l) => (cc.layoutIsValid.bind(cc, model.type, l)));

    const newLayout = Range(1, Infinity).map(e => "Custom Layout " + e).find(e => !layouts_new.has(e));
    const predefined = Seq(typed)
        .filter(e => e && model && e.modelType == model.modelType)
        .filterNot(e => e.internal || e.minAccess > access)
        .keySeq().sortBy(e => e.toLowerCase());
    const custom = layouts_new.keySeq().filterNot(e => typed[e]).sortBy(e => e.toLowerCase());

    return <BaseMenu title={<FormattedMessage {...messages.Layout} />}
                     content={<ul>
                         {predefined.map(e => (
                             <li key={e}>
                                 <div
                                     className={classNames("checkbox", favorites.has(e) && "checked")}
                                     onClick={cc.layoutToggle.bind(cc, e)}
                                 >
                                     {sanitizeLayoutName(e)}
                                 </div>
                             </li>
                         )).toArray()}
                         {custom.map(e => (
                             <li key={e} className="custom">
                                 <div
                                     className={classNames("checkbox", favorites.has(e) && "checked")}
                                     onClick={cc.layoutToggle.bind(cc, e)}
                                 >
                                     <i>{sanitizeLayoutName(e)}</i>
                                     <div className="remove" onClick={cc.layoutRemove.bind(cc, e)}/>
                                 </div>
                             </li>
                         )).toArray()}
                         <li className="custom">
                             <div className="checkbox state"
                                  onClick={cc.layoutAdd.bind(cc, newLayout)}>Add <i>{newLayout}</i>
                             </div>
                         </li>
                     </ul>}/>
};
