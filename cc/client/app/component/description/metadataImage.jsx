import React from "react";
import FileInput from "../base/fileInput";
import Add from "../../action/add";
import Entity from "../../entity/Entity";
import Confirmaton from "../../component/dialog/confirmation";
import { CCContextConsumer } from "../../containers/Application/index";

export default class MetadataImage extends React.Component {
	init(e) {
		this.setState({ entity: e.first(), progress: 0 });
	}
	done(k, v) {
		const { name, actions } = this.props;
		const e = this.state.entity;
		e.Persisted = k;
		this.setState({ entity: null });
		actions.batch([new Add(e.set(v)), new Add(new Entity["m" + name]({ value: e }))]);
	}
	progress(e, p) {
		this.setState({ progress: p.loaded / p.total });
	}
	render() {
		const { entity, title, ext, actions, user } = this.props;
		const s = this.state;

		if (s && s.entity) {
			const p = Math.round(360 * s.progress);
			return (<div className="icon progress" style={{backgroundImage: "linear-gradient(" + (p < 180 ? p + 90 : p - 90) + "deg, transparent 50%, #" + (p < 180 ? "F3F3F3" : "52A7E0") + " 50%)," +
                "linear-gradient(90deg, #F3F3F3 50%, transparent 50%)"}}/>);
		}
		else {
			const style = "icon base-image";
			return(
			entity ?  
				<CCContextConsumer>
					{({cc}) => { 
						return <input type="button" className={style} title={"Remove " + title} onClick={() => cc.showDialog(Confirmaton, {type: "delete", message: "This model has a background image. If you remove it, this cannot be undone. Are you sure you want to remove it?", action: actions.onRemove.bind(null, entity, null)})}/>
					}
					}
				</CCContextConsumer>
				:
				user ? (<FileInput className={style} title={"Add " + title} ext={ext} onChange={actions.uploadDocuments.bind(null, this.init.bind(this), this.done.bind(this), this.progress.bind(this))}/>) :  (<div className="icon base-image" onClick={e=>this.props.actions.showError("Please log in to use this feature.")} />) 
			);
			}
	}
}

MetadataImage.defaultProps = { ext: ".jpg,.jpeg,.png" };