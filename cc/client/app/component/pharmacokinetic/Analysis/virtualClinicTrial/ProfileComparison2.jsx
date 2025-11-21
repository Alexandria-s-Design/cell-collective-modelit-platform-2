import React from "react"
import degreeGraphView from "../../../topology/degreeGraphView";
import { FormattedMessage } from "react-intl"

export default degreeGraphView("inDegree", {
    placeholder: <FormattedMessage id="ModelDashBoard.PanelInDegree.LabelInstructionPlaceholder"
        defaultMessage="Select Connectivity In Degree and click run button to display the Graph"/>
});

