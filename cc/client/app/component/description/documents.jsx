import React from "react";
import { Seq } from "immutable";
import Utils from "../../utils";
import Application from "../../application";
import { FormattedMessage } from "react-intl";

export default ({entity, detail}) => (
	
	<div>
		<FormattedMessage id="ModelsView.decuments.labelDocuments" defaultMessage="Documents">
			{(message)=>(<h1>{message}</h1>)}
		</FormattedMessage>
		<ul>
			{Seq(entity.mDocumentPublic || {}).concat(detail ? entity.mDocumentPrivate : {}).sortBy(e => e.position).map(e => e.value).map((v, k) => (
				<li key={k}>
					<span className="link" onClick={Utils.downloadFile.bind(null, Application.url(v))}>{v.name}</span>
				</li>
			)).toArray()}
		</ul>
	</div>
);