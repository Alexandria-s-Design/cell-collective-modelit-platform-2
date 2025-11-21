import React from "react";

export default ({user, detail, actions}) => {
	const started = user.workspace[detail.top.id];
	const p = { entity: detail };
 
	const activity = () => { 
		actions.startActivity(detail)
	};

	return (
		<div>
			{/* <input className="raised" type="button" value={"Add to My Learning"} disabled={Utils.enabled(user.id !== undefined && (!started ))} onClick={activity}/> */}
			<br/>
			<br/>
			{/* {started && editing && detail.userId !== user.id && (<input className="raised" type="button" value="Restart Activity" onClick={actions.startActivity.bind(null, detail)}/>)} */}
		</div>
	);
};
