import React from 'react';
import {FormattedMessage, injectIntl} from 'react-intl';
import classnames from 'classnames';
import showMessage, {TYPE_WARNING} from '../../../../message';
import store from "store";
import Application from '../../../../application';

import languages from '../../../../languages.json';
import messages from './messages';
import userMessages from '../messages';
import BaseMenu from "../../BaseMenu";


const Component = ({intl: {formatMessage}}) => {
    const setLanguage = (code) => {
        showMessage({
            message: formatMessage(messages.ReloadInMoment),
            type: TYPE_WARNING
        });

        setTimeout(() => {
            store.set("user_language", code);
            window.location.reload(true);
        }, 1000);
    }

    return <BaseMenu title={<FormattedMessage {...userMessages.LanguageSelect} />}
                     content={<ul className="ul" style={{height: "300px", overflow: "auto"}}>
                         {
                             languages.map(({code, name, nativeName}) => (
                                 <li key={code}>
                                     <div
                                         className={classnames("checkbox", {"checked": Application.languageCode === code})}
                                         onClick={() => {
                                             setLanguage(code)
                                         }}>
                                         {nativeName}
                                     </div>
                                 </li>
                             ))
                         }
                     </ul>}/>
};

export default injectIntl(Component);
