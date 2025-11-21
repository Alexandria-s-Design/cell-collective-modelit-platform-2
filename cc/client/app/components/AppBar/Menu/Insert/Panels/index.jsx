import React, {useContext} from 'react';
import {Seq} from 'immutable';
import isObject from "lodash.isobject";
import classNames from 'classnames';

import {FormattedMessage} from 'react-intl';

import Application from '../../../../../application';
import {CCContext, CCViews,} from '../../../../../containers/Application';
import AccessControl from '../../../../../containers/ACL/AccessControl';
import Views from '../../../../../views';
import Views2 from '../../../../../component/views';

import messages from './messages';

import insertMessages from '../messages';
import {sanitizeLayoutName} from "../../../../../layouts";
import BaseMenu from "../../../BaseMenu";

const filterByModelType = (mType) => {
	return (_, categoryName) => {
		let sName = (`${categoryName}`).split(':');
		if (sName.length>1 && sName[1] !== mType) {
			return false;
		}
		return categoryName != "<prototype>";
	}
}

const Panels = () => {
    //Views with key "" are hidden to User ( David's shit )
    const viewsToShow = Seq(Views).filter((_, k) => k);

    const {views} = useContext(CCViews);
    const {cc, model, editable} = useContext(CCContext);


    return <BaseMenu title={<FormattedMessage {...insertMessages.Panel} />}
                     content={<ul>
                         {viewsToShow
                             .filter(filterByModelType(model.modelType)).map((viewsInCategory, categoryName) => {
                                 if (!views) {
                                     return false;
                                 }

                                 const viewEls = Seq(viewsInCategory)
                                     .filter(viewDefinition => viewDefinition.domains === undefined || viewDefinition.domains.includes(Application.domain))
                                     .filter((viewDefinition, viewKey) => {
                                         if (isObject(viewDefinition)) {
                                             if (viewDefinition.modelType) {
                                                 return model.modelType == viewDefinition.modelType;
                                             }
                                         }

                                         return true;
                                     })
                                     .map((viewDefinition, viewKey) => {
                                         viewDefinition = isObject(viewDefinition) ? viewDefinition : {name: viewDefinition};

                                         const getK = (e) => {
                                             const endIndex = e.search(/[\(\[_]/);
                                             return endIndex < 0 ?
                                                 e :
                                                 e.substring(0, endIndex);
                                         }


                                         const viewParams = Views2[getK(viewKey)];

                                         if (viewParams && viewParams.multiple && viewParams.multiple.get) {
                                             const multipleViews = viewParams.multiple.get(cc, model).toIndexedSeq().map((v2, k2) => {
                                                 const key = viewKey + '[' + viewParams.multiple.id(v2) + ']'

                                                 const name = (
                                                     (viewParams.multiple.name && viewParams.multiple.name(v2)) || viewDefinition.name
                                                 ) + "";

                                                 const remove = editable && viewParams.multiple.remove && viewParams.multiple.remove.bind(cc, cc, model, v2, key);

                                                 return (
                                                     <li key={key}>
                                                         <div
                                                             className={classNames("checkbox", views.has(key) && "checked")}
                                                             onClick={() => cc.viewToggle(undefined, key)}>
                                                             {name.toString()}
                                                             {remove && (<div className="remove" onClick={remove}/>)}
                                                         </div>
                                                     </li>);
                                             });

                                             return [
                                                 <li key={viewKey} className="custom">
                                                     <div className="checkbox state"
                                                          onClick={() => cc.viewAddCustom(undefined, viewKey, viewParams.multiple.add.bind(cc, cc, model))}>
                                                         <FormattedMessage {...messages.Add}>
                                                             {placeholder => (
                                                                 <React.Fragment>{placeholder} {viewDefinition.name}</React.Fragment>)}
                                                         </FormattedMessage>
                                                     </div>
                                                 </li>
                                             ].concat(multipleViews);
                                         }

                                         return [
                                             <AccessControl check={`model_view_${viewKey}`}>
                                                 <li key={viewKey}>
                                                     <div
                                                         className={classNames("checkbox", views.has(viewKey) && "checked")}
                                                         onClick={() => cc.viewToggle(undefined, viewKey)}>
                                                         {viewDefinition.name}
                                                     </div>
                                                 </li>
                                             </AccessControl>
                                         ];
                                     }).flatten(true)
                                     .filter(e => e)
                                     .toArray();

                                 return viewEls.length ? (
                                     <BaseMenu title={sanitizeLayoutName(categoryName)}
                                               content={<ul>{viewEls}</ul>}
                                               itemAttrs={{"key": categoryName}}
                                     />
                                 ) : null;
                             }).toArray()}
                     </ul>}/>
}

export default Panels;
