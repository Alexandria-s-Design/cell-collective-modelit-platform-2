import React from "react"
import degreeGraphView from "./degreeGraphView";
import { FormattedMessage } from "react-intl"

export default degreeGraphView("outDegree", {
    placeholder: <FormattedMessage id="ModelDashBoard.PanelOutDegree.LabelInstructionPlaceholder"
        defaultMessage="Select Connectivity Out Degree and click run button to display the Graph"/>
});

