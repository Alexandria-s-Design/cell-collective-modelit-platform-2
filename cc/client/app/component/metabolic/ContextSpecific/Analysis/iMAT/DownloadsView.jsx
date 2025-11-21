import React from "react";
import { Seq } from "immutable";
import Application from "../../../../../application";
import view from "../../../../base/view";
import Panel from "../../../../base/panel";
import Add from "../../../../../action/add";
import Table from "../../../../base/table";
import Utils from "../../../../../utils";
import cc from '../../../../../cc';
import "./style.scss";
import ContextDownloads from "../../../../../entity/metabolic/ContextSpecific/ContextDownloads";
import { format } from "date-fns";


export const DownloadsViewBuilder = () => {

	const Content = (props) => {
		const {view, model, modelState: state, persisted, entities, actions} = props;

		const handleDownload = (e) => {
			let url = `/api/model/${model.top.Persisted}/context/download/${e.context}`;
			return Utils.downloadFile(url);
		}

		const getColAction = (e) => {
			if (!e.downloads) {
				return <span>Creating...</span>
			}
			return <input type="button" className="icon base-download" onClick={handleDownload.bind(this, e)} />
		}

		const tableColumns = [
			{ get: "id", label: "ID", editable: false, def: "_id" },
			{ get: "context", label: "Context", editable: false, def: "_context" },
			{ get: "count", label: "Files", editable: false, def: "_count" },
			{ get: "createdAt", label: "Created At", editable: false, def: "_createdAt" },
			{ get: getColAction, label: "Status", editable: false, def: "_action" }
		];

		const tableData = Seq(model.ContextDownloads);

		React.useEffect(() => {
			(async () => {
					try {
						const {data: dataResult } = await cc.request.get(`/api/model/${model.top.Persisted}/context/downloads`);
						if (Array.isArray(dataResult.data)) {
							const updates = [];
							dataResult.data.forEach(v => {
								const downloadsEntity = new ContextDownloads({
									...v, createdAt: format(new Date(v._createdAt), 'yyyy-MM-dd')
								});
								updates.push(new Add(downloadsEntity));
							});
							actions.batch(updates);
						}
					} catch(err) { console.error(err) }
			})();
		}, [!tableData.isEmpty()])


		return (
			<Panel {...view} className="bar analysis1-phase1 panel-downloads">
				<Table {...actions}
						onDrag={null}
						references={[
							entities.get("ContextDownloads"),
						]}
						owner={model}
						data={tableData}
						creator={() => {}}
						columns={tableColumns}>
				</Table>
			</Panel>
		)
	}
	
	const downloadDocs = () => {
		return Utils.downloadFile("");
	}

	const Actions = (props) => {		
		const { model, modelState: state } = props;

		return {
			download: {
				action: downloadDocs.bind(null, props),
				title: 'Download documents'
			}
		};
	};
	
	return view(Content, null, Actions);
}

export default DownloadsViewBuilder();