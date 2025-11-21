import React from 'react';
import classNames from 'classnames';
import { Seq } from 'immutable';
import { connect } from 'react-redux';
import { FormattedMessage, injectIntl } from 'react-intl';

import messages from './messages';
import menuMessages from '../messages';

import { CCContextConsumer } from '../../../../containers/Application';
import ModelDownload from './ModelDownload';
import { changeWorkspace, WORKSPACE } from '../../../../containers/Application/ModuleDM/Module/actions';
import BaseMenu from "../../BaseMenu";
import Application from '../../../../application';

const FileMenu = ({ changeWorkspace, user, saving, domain }) => {
	return <BaseMenu title={<FormattedMessage {...menuMessages.File} />}
		content={<CCContextConsumer>{({ cc, model, versions }) => {
			const editable = cc.modelIsEditable(model);
			const modelIsEditable = Seq(versions).some(cc.modelIsEditable.bind(cc))

			const modelIsDirty = Seq(versions).some(cc.modelIsDirty.bind(cc));
			const layoutIsDirty = cc.layoutIsDirty(model);

			let canSave = user && modelIsEditable && modelIsDirty;

			if (!canSave) {
				if (cc.props.currLesson
					&& cc.props.currLesson.id
					&& !cc.props.currLesson.submitted) {
						canSave = true;
				}
			}

			const canSaveLayout = !saving && editable && user && layoutIsDirty;
			const IsPublicAndEditDisabled = model.isPublic && model.permissions && !model.permissions.edit;
			const modelType = model.modelType || "boolean";
			const isNotLearning = domain != 'learning';
			const isLearning = domain == 'learning';

			return (<ul>
				{Application.isTeach && (<li>
					<div onClick={() => {
						cc.modelAdd(undefined, null, { modelType })
					}}>
						<FormattedMessage {...messages.NewModel} />
					</div>
				</li>)}
				{Application.isTeach && (<li className={classNames(!canSave && "disabled")}>
					<div onClick={() => {
						canSave && cc.modelSave(null, undefined).then(() => {
						})
					}}>
						<FormattedMessage {...(IsPublicAndEditDisabled && !isLearning ? messages.DisabledSavePublished : messages.Save)} />
					</div>
				</li>)}
				{!Application.isTeach && isNotLearning && (<li className={classNames(!canSaveLayout && "disabled")}>
					<div onClick={() => {
						canSaveLayout && cc.modelLayoutSave(null, undefined)
					}}>
						<FormattedMessage {...(IsPublicAndEditDisabled ? messages.DisabledSaveLayoutPublished : messages.SaveLayout)} />
					</div>
				</li>)}
				{isNotLearning && (<li>
					<div onClick={() => {
						changeWorkspace(WORKSPACE.SHARING);
					}}>
						<FormattedMessage {...messages.Share} />
					</div>
				</li>)}
				{isNotLearning && (<li>
					<div onClick={() => {
						cc.modelCopyCurrent(null, undefined)
					}}>
						<FormattedMessage {...messages.Copy} />
					</div>
				</li>)}
				{isNotLearning && <ModelDownload />}
			</ul>);

		}}</CCContextConsumer>} />
}


const mapStateToProps = state => ({
	domain: state.app.domain,
	saving: state.app.saving,
	user: state.auth.user,
});
const mapDispatchToProps = dispatch => ({
	changeWorkspace: (workspace) => dispatch(changeWorkspace(workspace))
});

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(injectIntl(FileMenu));
