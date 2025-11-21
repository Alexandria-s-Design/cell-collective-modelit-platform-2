import React from "react";

//TODO: get rid of inSpan and remove the duplicities in code
export default function FileInput({id, name, ext, multiple, inSpan, disabled, className, title, onChange: change, onMouseDown, inputRef}){
	const onChange = e => (e = e.target.files) && e.length && change(e);
	// if (inputRef) {
	// 	return <span>
	// 			<label htmlFor={name} className={className} onPointerDown={onMouseDown}>{title}</label>
	// 			<input id={id} name={name} type="file" accept={ext} multiple={multiple} disabled={disabled}
	// 				onChange={onChange}/>
	// 	</span>
	// }
	return !inSpan ? (
			<label className={className} title={title} onPointerDown={onMouseDown}>
				<input type="file" accept={ext} multiple={multiple} disabled={disabled} onChange={onChange}/>
			</label>
		): (
			<span>
				<label htmlFor={name} className={className} onPointerDown={onMouseDown}>{title}</label>
				<input id={id} name={name} type="file" accept={ext} multiple={multiple} disabled={disabled} ref={inputRef}
					onChange={onChange}/>
		</span>
		);
}
