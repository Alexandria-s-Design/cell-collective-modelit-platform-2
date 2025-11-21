import React from "react";
import "./style.scss";

export function LoadingCircle({text}) {
	return (<div className="loadingcircle-base">
				<div className="loadingcircle-icon"></div>
				<span>{text || 'Loading...'}</span>
			</div>)
}