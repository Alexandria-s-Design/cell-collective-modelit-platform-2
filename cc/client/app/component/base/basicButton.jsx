import React from 'react';

export default function BasicButton({
	type, label, onAction, className
}) {
	let styleClasses = 'base-basic-button';
	if (className) {
		styleClasses += ` ${className}`;
	}
	return (<button
			className={styleClasses}
			type={type ? type : "button"}
			onClick={onAction ? onAction : null}
	>{label}</button>);
}