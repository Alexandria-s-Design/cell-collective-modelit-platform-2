import React from "react";
import styles from "./Scrollable.module.css";

export interface IScrollableProps {
    className?: string;
    children?: React.ReactNode;
    maxHeight?: number;
    width?: number;
}

const Scrollable = (props: IScrollableProps) => {
    const containerStyles = {
        width: props.width ? `${props.width}px` : 'auto',
        maxHeight: props.maxHeight ? `${props.maxHeight}px` : 'none',
    };

    return (
        <div style={containerStyles} className={`${styles.scrollable} ${props.className}`} data-testid="scrollable-element">
            {props.children}
        </div>
    );
};

export default Scrollable;
