import React from "react";
import "./style.scss";

export default function LoadingBar({text}) {
	return (<div className="loadingbar-base">
		<span>{text}</span>
	</div>)
}