import React, {useState} from "react";

const BaseMenu = (props) => {
    const [isShown, setIsShown] = useState(false);
    return (
        <li onMouseEnter={() => setIsShown(true)}
            onMouseLeave={() => setIsShown(false)}
            key={props.itemAttrs && props.itemAttrs.key}
        >
            <div onClick={(event) => setIsShown(current => !current)}>{props.title}</div>
            {isShown && props.content}
        </li>
    );
}

export default BaseMenu;
