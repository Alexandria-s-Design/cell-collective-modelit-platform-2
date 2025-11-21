import React, {useContext} from 'react';
import {FormattedMessage} from 'react-intl';
import {CCActiveLayout} from '../../../../containers/Application';

import PanelsMenu from './Panels';
import LayoutsMenu from './Layouts';
import menuMessages from '../messages';
import BaseMenu from "../../BaseMenu";


const InsertMenu = ({domain}) => {
  const {layout} = useContext(CCActiveLayout);
    return <BaseMenu title={<FormattedMessage {...menuMessages.Insert}/>}
                     content={
                         <ul>
                             {(domain !== "teaching") && <LayoutsMenu/>}
                             {!(layout === "Overview") && <PanelsMenu/>}
                         </ul>
                     }/>
};

export default InsertMenu;


