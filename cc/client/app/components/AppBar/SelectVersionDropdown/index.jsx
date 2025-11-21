import React, {useState}                    from 'react';
import Application              from '../../../application';
import classNames               from 'classnames';
import cc_main                  from "../../../cc";


/**** TODO REPLACE WITH NEW DIALOG */
import Confirmation         from '../../../component/dialog/confirmation';


import './style.scss';
import BaseMenu from "../BaseMenu";

const SelectVersionDropdown = ({className, width, versions, value, onEdit}) => {
        const [isShown, setIsShown] = useState(false);

        if(!versions)
            {return (<div className={classNames(className,'version')} style={{width}} />);}

        const model = versions.get(value);

        if(!model)
            {return null;}

        return (<div className={classNames(className,'version')} style={{width}}
                     onMouseEnter={() => setIsShown(true)}
                     onMouseLeave={() => setIsShown(false)}>
                    <div className="modelVersionEdit"
                         onClick={(event) => setIsShown(current => !current)}>
                        <span> {model.name}</span>
                        {/* removed version from span for issue 2228 */}
                    </div>
                    {isShown && onEdit && (<ul className="ul" style={{minWidth:200}}>
                        {versions.sort(Application.cmpVersion(false)).map((m,id)=>(<li key={id}>
                            <div className={classNames(m===model && "disabled")} onClick={onEdit.bind(null, m)}>
                                {(m.name || "")}
                            </div>
                            {m && m.description && (
                                <ul className="ul">
                                    <li><div>{cc_main._ ?cc_main._.ellipsis(m.description) : m.description}</div></li>
                                </ul>
                            )}
                        </li>)).toArray()}
                    </ul>)}
            </div>);

};

export default SelectVersionDropdown;
