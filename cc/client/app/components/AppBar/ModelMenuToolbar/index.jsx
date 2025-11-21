import React, { useState } from "react";
import { FormattedMessage } from "react-intl";
import Application from "../../../application";
import { ModelType } from "../../../cc";
import FileInput from "../../../component/base/fileInput";
import BaseMenu from "../BaseMenu";

const ModelMenuItem = ({ modelType, application, isAdmin }) => {
	const [isShown, setIsShown] = useState(false);
	
	return (<li onMouseEnter={() => setIsShown(true)}
	onMouseLeave={() => setIsShown(false)}
	key={modelType}>
		<div onClick={(event) => setIsShown(current => !current)}>
			<span>{ModelType[modelType].name}</span>
		</div>
		<ul style={{display: isShown ? 'block' : 'none' }}>
			{(ModelType[modelType].features.create || isAdmin)
				&& (
					<li onClick={() => application.modelAdd(undefined, null, { modelType })}>
						<div>
							<FormattedMessage
								id="DashBoard.ModelMenu.LabelCreate"
								defaultMessage="Create" />
						</div>
					</li>
				)}
			{(ModelType[modelType].features.import || isAdmin)
				&& (
					<li>
						<div>
							<FormattedMessage
								id="DashBoard.ModelMenu.LabelImport"
								defaultMessage="Import">
								{message => <FileInput
									name="fileImportInput"
									title={message} multiple={true}
									inSpan={true}
									onChange={files => application.modelImport(files, { modelType })} />}
							</FormattedMessage>
						</div>
					</li>
				)}
		</ul>
	</li>)
}

const ModelMenuToolbar = ({ isModelImporting, isActive, isAdmin, modelImport, modelAdd, application }) => {
	const [isShown, setIsShown] = useState(false);
	return (
		<div className="menu">
			<ul className="toolbarCss static">
				{Application.domain !== "learning" &&
					<li onMouseEnter={() => setIsShown(true)}
						onMouseLeave={() => setIsShown(false)}
					>
						<div onClick={(event) => setIsShown(current => !current)}>{
							!isModelImporting ?
								Application.domain === "research"
									?
									<FormattedMessage id="DashBoard.ModelMenu.LabelNewModel"
										defaultMessage="New Model" />
									:
									<FormattedMessage id="DashBoard.ModelMenu.LabelNewModule"
										defaultMessage="New Module" />
								:
								<FormattedMessage id="DashBoard.ModelMenu.LabelImporting"
									defaultMessage="Importing..." />
						}</div>
						{<ul style={{display: isShown ? 'block' : 'none' }}>
							{
								Object.keys(ModelType)
									.filter(m => isActive(ModelType[m]))
									.map((modelType, k) => ( <ModelMenuItem key={k} modelType={modelType} application={application} idAdmin={isAdmin} /> ))
							}
						</ul>}
					</li>
				}

			</ul>
		</div>
	)
}

export default ModelMenuToolbar;
