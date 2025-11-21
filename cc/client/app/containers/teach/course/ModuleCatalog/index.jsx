import React from "react";
import { connect } from "react-redux";
import { injectIntl } from "react-intl";

import Table from "../../../../components/Table";
import getModule from "../../../Model/actions";

import messages from "./messages";

class Catalog extends React.Component {
    constructor (props) {
        super (props);

        props.getModuleList();

        const { intl } = props;

        this.COLUMNS = [
            {
                name: "name",
                label: intl.formatMessage(messages.CourseDashBoardModuleCatalogLabelName)
            },
            {
                name: "description",
                label: intl.formatMessage(messages.CourseDashBoardModuleCatalogLabelDescription)
            },
            {
                name: "author",
                label: intl.formatMessage(messages.CourseDashBoardModuleCatalogLabelAuthor)
            },
            {
                name: "creationdate",
                label: intl.formatMessage(messages.CourseDashBoardModuleCatalogLabelCreated)
            },
            {
                name: "updatedate",
                label: intl.formatMessage(messages.CourseDashBoardModuleCatalogLabelUpdated)
            }
        ]
    }

    render ( ) {
        const { props }   = this;
        const { modules } = props;

        const data        = modules.map(m => {
            return [
                m.name,
                m.description,
                m.author,
                m.creationdate,
                m.updatedate
            ]
        })

        return (
            <div>
                <Table
                    columns    = {this.COLUMNS}
                    data       = {data}
                    selectable = {true} />
            </div>
        )
    }
}

const mapStateToProps    = state    => ({
    modules: state.model.module || [ ]
});
const mapDispatchToProps = dispatch => ({
    getModuleList: () =>
        dispatch(getModule("module").list())
});

export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(Catalog));