import React, {useContext} from "react";
import { Seq } from "immutable";
import Utils from "../../utils";
import view from "../base/view";
import Panel from "../base/panel";
import Scrollable from "../base/scrollable";
import {
	CCContext
} from '../../containers/Application';
import Checkbox from "../base/checkbox";

const Content = ({view, model, modelState, editable, actions, user}) => {
	const { publishedStatusEditable } = useContext(CCContext);
	const isPublic = modelState.get("isPublic");
	const [publishVersions, setPublishVersions] = React.useState([]);
	const [selectAll, setSelectAll] = React.useState(true);
	const arrPublish = [true];
	const versionsRules = [];	
	let publishable = true;
	let disabled = true;

	Seq(model.top.all()).forEach((m) => {		
		let errorRules = [];
		let modelUser = m.user;
		if(!m.user && m.userId === user.id) {
			modelUser = user;
		}
		if (m.type) {
			errorRules = Content.rules[m.type].map(e => !e.eval(m, modelUser));
		}
		arrPublish.push(Seq(errorRules).every(e => !e))
		versionsRules.push({
			mData: m,
			rules: Content.rules[model.type],
			version: m.name,
			versionId: m.id,
			mSelected: m.selected,
			errorRules,
		});
	});

	//all need to be true
	publishable = Seq(arrPublish).every(e => e) && !isPublic;
	const btnActivedPublish = publishedStatusEditable && (isPublic || publishable);
	
	const publishAllVersions = () => {
		if (btnActivedPublish) {
			return actions.onPublish.call(null, {
				versions: publishVersions,
				published: !isPublic
			}, `this model`)
		}
		actions.onShowMessageOnAction("Please make sure all your versions meet the publishing criteria before you publish.");            
	};

	const handleSelectVersion = (vData, e) => {
		if (disabled) return;
		let versions = [...publishVersions];
		let key = versions.indexOf(vData.versionId);
		if (key > -1) {	versions.splice(key, 1)	}
		else { versions.push(vData.versionId) }
		setPublishVersions(versions)
	}

	const handleSelectAll = (e) => {
		if (disabled) return;
		setSelectAll(vl => {
			let newVl = !vl;
			if (newVl === true) {
				setPublishVersions(versionsRules.map(vr => vr.versionId));
			} else { setPublishVersions([])	}
			return !vl;
		});
	}

	React.useEffect(() => {
		setPublishVersions(versionsRules.map(vr => vr.versionId));
	}, []);

	return (
		<Panel {...view}>
			<Scrollable>
				{model.id !== undefined && (
					<div className="publishing">
						<p>{isPublic ? "Thank you for sharing your work with the community!" : "By publishing this model, it will become visible to all ModelIt! users who will be able to simulate the model and create their own copy to help expand on it in a collaborative fashion (only the original model creator and the users with whom the creator shared the model can continue to directly edit the published model)."}</p>
						<input className="raised" type="button" value={isPublic ? "Unpublish" : "Publish"} onClick={() => publishAllVersions()} disabled={Utils.enabled(btnActivedPublish)}/>
						{"Model " + (isPublic ? "was" : (publishable ? "is ready to be" : "cannot be")) + " published."}
						<h1>Publishing version requirements</h1>
						<h2>
							<Checkbox
								value={selectAll===true ? 1 : 0}
								onEdit={handleSelectAll.bind(this)}
								className={disabled && 'disabled'}
							/> Select all
						</h2>
						{versionsRules.map((vData, vKey) => (<div key={vKey} className="versions-rules">
							<h2>
								<Checkbox
									value={publishVersions.includes(vData.versionId) ? 1 : 0}
									onEdit={handleSelectVersion.bind(this, vData)}
									className={disabled && 'disabled'}
								/> {vData.version}{vData.mSelected ? ' (default)' : null}
							</h2>
							<ul>
								{vData.rules.map((v, k) => (
									<li key={k} className={Utils.css(vData.errorRules[k] && "error")}>
										<i>{v.text}</i>
										<br/>
										{vData.errorRules[k] && v.state && v.state(vData.mData)}
									</li>
								))}
							</ul>
						</div>))}
					</div>
				)}
			</Scrollable>
		</Panel>
	);
};

Content.rules = (function() {
	const reference = {
		text: "Model has to have been included in at least one peer-reviewed publication.",
		eval: (model, user) => Seq(model.ModelReference).count(),
		state: () => "There are no publications associated with this model (You can add publications under the Description page)."
	};
	const annotation = {
		text: "Each model component should be annotated in the knowledge base in an effort to make models more reproducible, transparent and accessible to the community.",
		eval: (model, user) => Seq(model.Component).every(e => e.pages),
		state: e => (
			<div>
				<p>Components without knowledge base information:</p>
				<span className="components">
					{Seq(e.Component).filterNot(e => e.pages).sortBy(e => e.name.toLowerCase()).map((v, k) => (
						<div key={k} className={Utils.css(v.isExternal ? "external" : "internal")}>{v.name}</div>
					)).toArray()}
				</span>
			</div>
		)
	};
	const profile = {
		text: "User profile of the model owner has to be filled.",
		eval: (model, user) => model.author || (user && user.firstName && user.lastName),
		state: () => "Complete your user profile (accessible under the User icon)."
	};

	return {
		research: [reference, annotation, profile],
		learning: [annotation, profile]
	};
})();

export default view(Content);