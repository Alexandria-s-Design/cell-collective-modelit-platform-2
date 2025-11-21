import React from 'react';
import {connect} from 'react-redux';
import {injectIntl} from 'react-intl';

import {hideModal, openModal} from "../../Modal/actions";
import FileMenu from './File';
import InsertMenu from './Insert';
import EditMenu from './Edit';
import {changeWorkspace} from '../../../containers/Application/ModuleDM/Module/actions';
import {getSelectedModule} from '../../../containers/Application/ModuleDM/accessors';
import WorkspaceMenu from "./Workspace";
import HelpMenu from "./Help";
import ReportsMenu from "./Reports";


const Menu = ({changeWorkspace, workspace, user, domain, openModal, hideModal, intl}) => {
    // console.log(user);
    return (
        <div className="menu">
            <ul className="toolbarCss static">
                <FileMenu/>
                {domain !== "learning" && <InsertMenu domain={domain} />}
                <EditMenu/>
                <WorkspaceMenu {...{changeWorkspace, workspace, domain}}/>
                {domain === "teaching" && user && <ReportsMenu {...{openModal, hideModal}}/>}
                <HelpMenu {...{intl, openModal}}/>
            </ul>
        </div>
    );
};


const mapStateToProps = state => ({
    workspace: getSelectedModule(state)?.workspace,
    domain: state.app.domain,
    user: state.auth.user
});
const mapDispatchToProps = dispatch => ({
    changeWorkspace: (workspace) => workspace && dispatch(changeWorkspace(workspace)),
    openModal: (type, props) =>
        dispatch(openModal(type, props)),
    hideModal: () => dispatch(hideModal()),
    openReportDialog: (model) =>
        model && model.top && dispatch(openModal("GenerateReport", {
            modelID: model.top.Persisted,
            modelName: model.top.name,
            title: "Student Report",
            width: 300,
            height: null
        }))

});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(injectIntl(Menu));
